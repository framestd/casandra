# Standard Library
import asyncio
import json
from contextlib import asynccontextmanager
from typing import Any, Generator, cast
from uuid import UUID, uuid4

# Third Party
import openai
from broadcaster import Event  # type: ignore
from sqlalchemy.orm import Session

# First Party
from app.core.deps import ServiceContext
from app.core.exceptions.application import MissingResourceException
from app.core.exceptions.http import ForbiddenRequestException
from app.core.exceptions.http import ServiceUnavailableException
from app.core.intelligence.basic import generate_prompt, generate_response
from app.core.logging.logger import get_app_logger
from app.core.models.chat_message import ChatMessage as ChatMessageModel
from app.core.models.chat_message import ChatMessageRoleEnum
from app.core.models.conversation import Conversation as ConversationModel
from app.core.redis.channels import get_conversation_channel_for
from app.core.redis.publisher import publisher
from app.core.redis.types import PubSubMessage
from app.core.schemas import message as schema
from app.core.schemas.conversation import ConversationCreate
from app.core.schemas.openai import ChatCompletionResponseStream
from app.core.schemas.pagination import PageOptions
from app.core.schemas.websocket import DataStream, MessageStream, SignalStream
from app.core.schemas.websocket import StreamSignalEnum
from app.core.services.pagination import PageBuilder

# Local Folder
from .conversation import create_conversation_service, get_conversation_by_id
from .service_object import PagedServiceObject

__all__ = (
    "handle_message",
    "open_message_reply_stream",
    "get_message_by_id",
)

logger = get_app_logger(__name__)


def get_message_by_id(session: Session, ctx: ServiceContext, id: UUID):
    """Get a chat message by ID

    :params session: the database session to use to create a new account

    :params ctx: the service context necessary for running the service

    :params id: the identifier to use to find the chat message

    :raises MissingResourceException:
        when no message by the giving resource identifier could be found

    :raises ForbiddenRequestException:
        when the user trying to read a message doesn't have enough access privileges
        to do so.
    """

    chat_message = session.query(ChatMessageModel).filter(ChatMessageModel.id == id).one_or_none()

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


def get_messages_by_conversation_id(
    *,
    session: Session,
    ctx: ServiceContext,
    conversation_id: UUID,
    filter: schema.MessageFilter,
    sorts: list[str],
    page_opts: PageOptions,
):
    conversation = get_conversation_by_id(session=session, ctx=ctx, id=conversation_id)

    # TODO: revise when the feature to share conversations have been implemented
    if conversation.started_by_id != ctx.user.id:
        raise ForbiddenRequestException(
            "You are not allowed to read messages from this conversation"
        )

    page_builder = PageBuilder[ChatMessageModel, schema.MessageFilterExtra]()

    after = page_opts.page_cursor if page_opts.page_forward else None
    before = page_opts.page_cursor if not page_opts.page_forward else None

    filter_extra = schema.MessageFilterExtra(
        conversation_id=conversation_id,
        **filter.model_dump(exclude_defaults=True),
    )

    page = (
        page_builder.setup(session=session, model=ChatMessageModel)
        .go_to_edge_before(before)
        .go_to_edge_after(after)
        .skim_through(filter=filter_extra)
        .sort(sorts)
        .build()
    )

    result = PagedServiceObject(
        page.read(page_opts.page_size),
        cursors=page.cursors(),
        page_size=page.read_size,
        total_pages=page.total_size,
        has_next=page.has_next(),
        has_prev=page.has_previous(),
    )

    return result


async def handle_message(
    session: Session,
    ctx: ServiceContext,
    message: schema.MessageCreate,
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
        conversation = get_conversation_by_id(session=session, ctx=ctx, id=conversation_id)

    session.expunge(conversation)

    modeled_message = ChatMessageModel(
        body=body,
        conversation_id=conversation_id,
        response_to_id=None,
        response_from_id=None,
        role=role,
        _dangling=True,  # object has not been commited to db
    )

    modeled_message.conversation = conversation

    json_message = schema.Message.model_validate(modeled_message).model_dump_json()

    # Only publish if message originally had a conversation attached
    # If not, it was a <noop> message just to get a conversation going.
    if message.conversation_id is not None:
        channel = get_conversation_channel_for(conversation_id)
        asyncio.create_task(publisher(ctx.rdb, channel, json_message))

    return modeled_message


@asynccontextmanager
async def open_message_reply_stream(session: Session, ctx: ServiceContext, conversation_id: UUID):
    pubsub = ctx.rdb.pubsub()  # type: ignore
    channel = get_conversation_channel_for(conversation_id)

    logger.info(f"Subscribing to {channel} channel...")

    await pubsub.subscribe(channel)  # type: ignore

    logger.info(f"Subscribed to {channel} channel!")

    websocket_begin_stream_signal = SignalStream(
        channel=channel,
        message="Data stream begins",
        signal=StreamSignalEnum.begin,
    )

    websocket_end_stream_signal = SignalStream(
        channel=channel,
        message="Data stream ends",
        signal=StreamSignalEnum.end,
    )

    async def message_reply_stream():
        while True:
            message = cast(PubSubMessage | None, await pubsub.get_message())  # type: ignore

            if message is None:
                # Return control to the event loop giving it time to do something else
                await asyncio.sleep(0)
                continue
            elif not message.get("type").endswith("message"):
                websocket_message = MessageStream(channel=channel, message="Subscribed")
                yield websocket_message
            else:
                data = schema.Message.model_validate(json.loads(message.get("data")))

                conversation = get_conversation_by_id(
                    session=session,
                    ctx=ctx,
                    id=data.conversation_id,
                )

                # Do not track changes, detach from the session
                session.expunge(conversation)

                prompt = generate_prompt(question=data.body)

                openai_response: Generator[ChatCompletionResponseStream, Any, None]

                try:
                    # reassign
                    openai_response = generate_response(prompt=prompt)
                except openai.OpenAIError:
                    logger.error("Failed to get completion from OpenAI", exc_info=True)

                    raise ServiceUnavailableException("Failed to establish outbound communication")

                completion = ""
                chunk_id = uuid4()

                yield websocket_begin_stream_signal

                for chunk in openai_response:
                    delta = chunk.choices[0].delta
                    content = delta.content if hasattr(delta, "content") else None

                    if content is None:
                        continue

                    completion += content

                    response_chunk = ChatMessageModel(
                        body=completion,
                        role=ChatMessageRoleEnum.robot,
                        conversation_id=data.conversation_id,
                        response_to_id=data.id,
                        response_from_id=None,
                        _dangling=True,
                    )

                    response_chunk.id = chunk_id
                    response_chunk.conversation = conversation

                    websocket_data = DataStream[schema.Message](
                        channel=channel,
                        message="Streaming data...",
                        data=cast(schema.Message, response_chunk),
                    )

                    yield websocket_data

                    await asyncio.sleep(0)
                yield websocket_end_stream_signal

                _resultant(
                    session=session,
                    ctx=ctx,
                    data=data,
                    conversation=conversation,
                    response_chunk_id=chunk_id,
                    completion=completion,
                )

            # Return control to the event loop giving it time to do something else
            await asyncio.sleep(0)

    try:
        yield message_reply_stream
    except Exception as exc:
        logger.error(f"Error occured while streaming {str(exc)}", exc_info=True)

        raise exc
    finally:
        logger.info(f"Unsubscribing from {channel} channel and closing pubsub connection...")

        await pubsub.unsubscribe(channel)  # type: ignore
        await pubsub.close()

        logger.info(f"Unsubscribed from {channel} channel and closed pubsub connection!")


def _resultant(
    *,
    session: Session,
    ctx: ServiceContext,
    data: schema.Message,
    conversation: ConversationModel,
    response_chunk_id: UUID,
    completion: str,
):
    message = ChatMessageModel(
        body=data.body,
        conversation_id=conversation.id,
        response_from_id=None,
        response_to_id=None,
        role=data.role,
        _dangling=False,
    )

    response = ChatMessageModel(
        body=completion,
        conversation_id=conversation.id,
        response_from_id=None,
        response_to_id=None,
        role=ChatMessageRoleEnum.robot,
        _dangling=False,
    )

    response.id = response_chunk_id

    message.response_from_id = response.id
    response.response_to_id = message.id

    result = _save_message_response_pair_service(
        session=session,
        ctx=ctx,
        conversation=conversation,
        message_pair=(message, response),
    )

    return result


def _save_message_response_pair_service(
    session: Session,
    ctx: ServiceContext,
    conversation: ConversationModel,
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

    # this shouldn't happen
    if conversation.started_by_id != ctx.user.id:
        raise ForbiddenRequestException("Conversation must be started by the current user")

    session.add(message)
    session.add(response)
    session.commit()
    session.refresh(message)
    session.refresh(response)

    return (message, response)
