# Standard Library
import json
from datetime import datetime
from typing import Any, TypedDict, cast
from uuid import UUID

# Third Party
import frontmatter  # type: ignore
import openai
from redis.client import StrictRedis
from redis.connection import ConnectionPool

# First Party
from app.core.database.engine import SessionLocal
from app.core.deps import ServiceContext
from app.core.exceptions.application import MissingResourceException
from app.core.exceptions.http import AppHTTPException, ServiceUnavailableException
from app.core.intelligence.basic import OpenAIMessagePromptDict, OpenAISystemPromptDict
from app.core.intelligence.basic import generate_completion_stream
from app.core.logging.logger import get_app_logger
from app.core.models.message import ConversationMessage, ConversationMessageRoleEnum
from app.core.redis.channels import get_conversation_channel_for
from app.core.redis.publisher import publisher_sync
from app.core.schemas.account import AccountOut
from app.core.schemas.conversation import ConversationCreate
from app.core.schemas.message import ConversationMessageOut, MessageCreate
from app.core.schemas.message import MessageCreateCustomizations
from app.core.schemas.openai import ChatCompletionChoiceChunk
from app.core.schemas.openai import ChatCompletionResponseStream
from app.core.services.account import get_account_by_id
from app.core.services.conversation import create_conversation_service
from app.core.services.conversation import get_conversation_by_id
from app.core.worker.settings import worker_settings

# Local Folder
from .celery import celery

logger = get_app_logger(__name__)

redis_pool = ConnectionPool(
    host=worker_settings.REDIS_URL.host, port=worker_settings.REDIS_URL.port
)


class MessageBuffDict(TypedDict):
    conversation_id: str
    role: str | None
    content: str
    finish_reason: str | None


@celery.task
def openai_completion_task(
    *,
    conversation_id: UUID,
    prompts: tuple[OpenAISystemPromptDict, list[OpenAIMessagePromptDict]],
    with_metadata: bool | None = None,
):
    channel = get_conversation_channel_for(conversation_id=conversation_id)
    accumulated_choices: list[ChatCompletionChoiceChunk] = []

    try:
        openai_response_stream = generate_completion_stream(
            aggregate_prompts=prompts, with_metadata=with_metadata
        )
    except openai.OpenAIError:
        logger.error("Failed to get completion from OpenAI", exc_info=True)
        raise ServiceUnavailableException("Failed to establish outbound communication")
    message_buff: MessageBuffDict = MessageBuffDict(
        conversation_id=str(conversation_id),
        role=None,
        content="",
        finish_reason=None,
    )

    chunk: ChatCompletionResponseStream | None = None

    with StrictRedis(connection_pool=redis_pool) as redis_client:
        if redis_client.ping():
            logger.info("Synchronous Redis connected")
        else:
            logger.info("Could not establish a connection to Synchronous Redis")
        for chunk in openai_response_stream:
            choices = chunk.choices
            delta = choices[0].delta
            role = delta.role
            content = delta.content

            for i in range(0, len(choices)):
                choice = choices[i]
                try:
                    accumulated_choice = accumulated_choices[i]
                except IndexError:
                    accumulated_choices.insert(i, choice)
                    break
                # If the streamed, incoming choice has content
                if choice.delta.content is not None:
                    accumulated_choice.delta.content = accumulated_choice.delta.content or ""
                    accumulated_choice.delta.content += choice.delta.content
                # If the accumulated choice's role has not been set
                if accumulated_choice.delta.role is None:
                    accumulated_choice.delta.role = choice.delta.role
            # If a finish reason has been set other than None
            is_first_choice_finished = message_buff.get("finish_reason") is not None

            # We are only sending progress update for the first choice.
            # If the first choice has come to a finish don't send update anymore, so we don't
            # send the same data multiple times.
            if not is_first_choice_finished:
                meta = cast(dict[str, Any], message_buff)
                if choices[0].finish_reason in ["stop", "length"]:
                    message_buff.update({"finish_reason": choices[0].finish_reason})
                    publisher_sync(redis_client, channel, json.dumps(meta))
                if role is not None:
                    message_buff.update({"role": role})
                    publisher_sync(redis_client, channel, json.dumps(meta))
                if content is not None:
                    message_buff.update({"content": message_buff.get("content") + content})
                    publisher_sync(redis_client, channel, json.dumps(meta))
                else:
                    continue
    # This shouldn't happen
    if chunk is None:
        raise AppHTTPException("Could not generate response")
    chunk.choices = accumulated_choices

    return chunk.model_dump()


@celery.task
def save_message_response_pair_task(
    chat_completion_dict: dict[str, Any],
    *,
    conversation_id: UUID,
    user_message_id: UUID,  # optimistic ID: i.e, before the record exists in DB
    assistant_message_id: UUID,  # optimistic ID: i.e, before the record exists in DB
    user_account_dict: dict[str, Any],
    msg_create_dict: dict[str, Any],
    msg_create_timestamp: datetime,
    msg_customizations_dict: dict[str, Any],
):
    user_account = AccountOut.model_validate(user_account_dict)
    message_create = MessageCreate.model_validate(msg_create_dict)
    customizations = MessageCreateCustomizations.model_validate(msg_customizations_dict)

    chat_completion = ChatCompletionResponseStream.model_validate(chat_completion_dict)
    completion_choices = chat_completion.choices
    completion_first_choice = completion_choices[0]

    # This shouldn't happen
    if completion_first_choice.delta.content is None:
        raise AppHTTPException("Could not generate response")
    with SessionLocal() as session:
        account = get_account_by_id(session=session, id=user_account.id)
        ctx = ServiceContext(account=account)

        fmatter = frontmatter.loads(completion_first_choice.delta.content)  # type: ignore
        metadata = cast(dict[str, str], fmatter.metadata)  # type: ignore
        assistant_message_body = fmatter.content

        try:
            conversation = get_conversation_by_id(session=session, ctx=ctx, id=conversation_id)
        except MissingResourceException:
            conversation = create_conversation_service(
                session=session,
                ctx=ctx,
                conversation_id=conversation_id,
                conversation_create=ConversationCreate(
                    subject=metadata.get("topic", "New Conversation"),
                    started_by_id=ctx.user.id,
                ),
            )
        user_message = ConversationMessage(
            body=message_create.body,
            role=ConversationMessageRoleEnum.human,
            response_from_id=None,
            response_to_id=None,
            conversation_id=conversation.id,
        )

        assistant_message = ConversationMessage(
            body=assistant_message_body,
            role=ConversationMessageRoleEnum.robot,
            response_from_id=None,
            response_to_id=None,
            conversation_id=conversation.id,
        )

        user_message.id = user_message_id  # assign optimistic id to the user message
        assistant_message.id = assistant_message_id  # assign optimistic id to the assistant message

        if customizations.quotes and len(customizations.quotes) != 0:
            quoted_messages = (
                session.query(ConversationMessage)
                .filter(ConversationMessage.id.in_(customizations.quotes))
                .all()
            )

            user_message.quoted_messages = quoted_messages

            for quoted_message in quoted_messages:
                quoted_message.quoting_messages.append(user_message)
        else:
            # only set context length to the customized value when no messages are being quoted
            user_message.context_length = customizations.context_length
        user_message.created_at = msg_create_timestamp
        user_message.conversation = conversation
        assistant_message.conversation = conversation
        user_message.response_from_id = assistant_message.id
        assistant_message.response_to_id = user_message.id

        session.add(user_message)
        session.add(assistant_message)
        session.commit()
        session.refresh(user_message)
        session.refresh(assistant_message)

        return (
            ConversationMessageOut.model_validate(user_message).model_dump(),
            ConversationMessageOut.model_validate(assistant_message).model_dump(),
        )
