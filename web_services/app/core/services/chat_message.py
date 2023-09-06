# Standard Library
import json
from typing import Any, Generator, cast
from uuid import UUID, uuid4

# Third Party
import openai
from broadcaster import Event  # type: ignore
from sqlalchemy.orm import Session

# First Party
from app.core.broadcaster import broadcast
from app.core.deps import ServiceContext
from app.core.exceptions.application import MissingResourceException
from app.core.exceptions.http import ForbiddenRequestException
from app.core.exceptions.http import ServiceUnavailableException
from app.core.intelligence.basic import generate_prompt, generate_response
from app.core.logging.logger import get_app_logger
from app.core.models.chat_message import ChatMessage as ChatMessageModel
from app.core.models.chat_message import ChatMessageRoleEnum
from app.core.schemas import chat_message as schema
from app.core.schemas.conversation import ConversationCreate
from app.core.schemas.openai import ChatCompletionResponseStream

# Local Folder
from .conversation import create_conversation_service, get_conversation_by_id

__all__ = (
    "handle_message",
    "message_reply_stream",
    "save_chat_message_pair_service",
    "get_chat_message_by_id",
)

logger = get_app_logger(__name__)


async def handle_message(
    session: Session,
    ctx: ServiceContext,
    message: schema.ChatMessageCreate,
):
    body = message.body
    conversation_id = message.conversation_id
    role = ChatMessageRoleEnum.human

    # create a new conversation if no existing conversation was provided
    if conversation_id is None:
        conversation = create_conversation_service(
            session=session,
            conversation_create=ConversationCreate(
                subject="New Conversation",
                started_by_id=ctx.user.id,
            ),
        )

        # reassign
        conversation_id = conversation.id
    else:
        conversation = get_conversation_by_id(
            session=session, ctx=ctx, id=conversation_id
        )

    modeled_message = ChatMessageModel(
        body=body,
        conversation_id=conversation_id,
        response_to_id=None,
        response_from_id=None,
        role=role,
        _dangling=True,  # object has not been commited to db
    )

    modeled_message.conversation = conversation

    json_message = schema.ChatMessage.model_validate(modeled_message).model_dump_json()

    result = await broadcast.publish(
        f"conversation:{conversation_id}", message=json_message
    )

    # debug log:
    logger.debug(result)

    return modeled_message


async def message_reply_stream(
    session: Session,
    ctx: ServiceContext,
    conversation_id: UUID,
):
    async with broadcast.subscribe(f"conversation:{conversation_id}") as sub:  # type: ignore
        async for event in cast(Any, sub):
            evt = cast(Event, event)
            data = cast(dict[str, Any], json.loads(evt.message))

            parsed_message = schema.ChatMessage.model_validate(data)

            conversation = get_conversation_by_id(
                session=session,
                ctx=ctx,
                id=parsed_message.conversation_id,
            )

            prompt = generate_prompt(question=parsed_message.body)

            openai_response: Generator[ChatCompletionResponseStream, Any, None]

            try:
                # reassign
                openai_response = generate_response(prompt=prompt)
            except openai.OpenAIError:
                logger.error("Failed to get completion from OpenAI", exc_info=True)

                raise ServiceUnavailableException(
                    message="Failed to establish outbound communication"
                )

            completion = ""
            chunk_id = uuid4()

            for chunk in openai_response:
                delta = chunk.choices[0].delta
                content = delta.content if hasattr(delta, "content") else None

                if content is None:
                    continue

                completion += content

                response_chunk = ChatMessageModel(
                    body=completion,
                    role=ChatMessageRoleEnum.robot,
                    conversation_id=parsed_message.conversation_id,
                    response_to_id=parsed_message.id,
                    response_from_id=None,
                    _dangling=True,
                )

                response_chunk.id = chunk_id
                response_chunk.conversation = conversation

                yield response_chunk

            message = ChatMessageModel(
                body=parsed_message.body,
                conversation_id=parsed_message.conversation_id,
                response_from_id=parsed_message.response_from_id,
                response_to_id=parsed_message.response_to_id,
                role=parsed_message.role,
                _dangling=False,
            )

            response = ChatMessageModel(
                body=completion,
                conversation_id=message.conversation_id,
                response_from_id=None,
                response_to_id=None,
                role=ChatMessageRoleEnum.robot,
                _dangling=False,
            )

            response.id = chunk_id

            message.response_from_id = response.id
            response.response_to_id = message.id

            _, saved_response = save_chat_message_pair_service(
                session=session,
                ctx=ctx,
                message_pair=(message, response),
            )

            yield saved_response
    return


def save_chat_message_pair_service(
    session: Session,
    ctx: ServiceContext,
    message_pair: tuple[ChatMessageModel, ChatMessageModel],
):
    """Create a new chat message and attach it to a conversation. If no conversation
    exists, yet, create a new conversation to attach the dangling message to

    :param session: the database session to use to create a new account
    :param ctx: the service context containing contextual data necessary for running
        the service
    :param chat_message_create: the data to use to create a new message
    """

    message, response = message_pair

    session.add(message)
    session.add(response)
    session.commit()
    session.refresh(message)
    session.refresh(response)

    return (message, response)


def get_chat_message_by_id(session: Session, ctx: ServiceContext, id: UUID):
    """Get a chat message by ID

    :params session: the database session to use to create a new account

    :params ctx: the service context containing contextual data necessary for running
        the service

    :params id: the identifier to use to find the chat message

    :raises MissingResourceException:
        when no message by the giving resource identifier could be found

    :raises ForbiddenRequestException:
        when the user trying to read a message doesn't have enough access privileges
        to do so.
    """

    chat_message = (
        session.query(ChatMessageModel).filter(ChatMessageModel.id == id).one_or_none()
    )

    if chat_message is None:
        exception = MissingResourceException(f"There's no chat message with id {id}")

        exception.add_attributes(
            context=None,
            message=exception.message,
            path=("*", "id"),
            value=id,
        )

        raise exception

    # TODO: revise when the feature to share conversations have been implemented
    if chat_message.conversation.started_by.id != ctx.user.id:
        raise ForbiddenRequestException("You are not allowed to read this message")

    return chat_message
