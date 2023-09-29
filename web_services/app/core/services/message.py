# Standard Library
import asyncio
import json
from contextlib import asynccontextmanager
from typing import Any, cast
from uuid import UUID, uuid4

# Third Party
from celery.result import AsyncResult
from sqlalchemy import and_
from sqlalchemy.orm import Session

# First Party
from app.core.deps import ServiceContext
from app.core.exceptions.application import MissingResourceException
from app.core.exceptions.code import ErrorContextType
from app.core.exceptions.http import AppHTTPException, ForbiddenRequestException
from app.core.intelligence.basic import create_aggregate_prompts
from app.core.intelligence.basic import create_openai_message_prompt
from app.core.logging.logger import get_app_logger
from app.core.models.conversation import Conversation
from app.core.models.message import ConversationMessage, ConversationMessageRoleEnum
from app.core.redis.channels import get_conversation_channel_for
from app.core.redis.publisher import publisher
from app.core.redis.types import PubSubMessageDict
from app.core.schemas.account import AccountOut
from app.core.schemas.message import ConversationMessageOut, ConversationMessagePartial
from app.core.schemas.message import MessageCreate, MessageCreateCustomizations
from app.core.schemas.message import MessageFilter, MessageFilterExtra
from app.core.schemas.pagination import PageOptions
from app.core.schemas.websocket import DataStream, SignalStream, StreamSignalEnum
from app.core.utils import get_utc_time
from app.core.worker.completion_tasks import MessageBuffDict, openai_completion_task
from app.core.worker.completion_tasks import save_message_response_pair_task

# Local Folder
from .conversation import get_conversation_by_id
from .pagination import PageBuilder
from .service_object import PagedServiceObject

__all__ = (
    "get_message_by_id",
    "get_messages_by_conversation_id",
    "message_completion_streamer",
    "open_message_reply_stream",
)

logger = get_app_logger(__name__)


def get_message_by_id(session: Session, ctx: ServiceContext, id: UUID):
    """Get a conversation message by ID

    :params session: the database session to use to create a new account

    :params ctx: the service context necessary for running the service

    :params id: the identifier to use to find the conversation message

    :raises MissingResourceException:
        when no message by the giving resource identifier could be found

    :raises ForbiddenRequestException:
        when the user trying to read a message doesn't have enough access privileges
        to do so.
    """

    message = session.query(ConversationMessage).filter(ConversationMessage.id == id).one_or_none()

    if message is None:
        exception = MissingResourceException(f"There's no chat message with id {id}")

        exception.add_attributes(
            context=None,
            message=exception.message,
            path=("*", "id"),
            value=id,
        )

        raise exception

    # TODO: revise when the feature to share conversations have been implemented
    if message.conversation.started_by.id != ctx.user.id:
        raise ForbiddenRequestException("You are not allowed to read this message")

    return message


def get_messages_by_conversation_id(
    *,
    session: Session,
    ctx: ServiceContext,
    conversation_id: UUID,
    filter: MessageFilter = MessageFilter(),
    sorts: list[str],
    page_opts: PageOptions,
):
    """Get messages in a given conversation by the conversation ID as a paged service object
    reading not more than 100 messages per session.

    :params session: the database session to use to create a new account

    :params ctx: the service context necessary for running the service

    :params conversation_id: the ID of the conversation to read messages from

    :raises MissingResourceException:
        when no conversation by the giving resource identifier could be found

    :raises ForbiddenRequestException:
        when the user trying to read messages from a conversation doesn't have enough access
        privileges to do so.
    """

    conversation = get_conversation_by_id(session=session, ctx=ctx, id=conversation_id)

    # # TODO: revise when the feature to share conversations have been implemented
    # if conversation.started_by_id != ctx.user.id:
    #     raise ForbiddenRequestException(
    #         "You are not allowed to read messages from this conversation"
    #     )

    page_builder = PageBuilder[ConversationMessage, MessageFilterExtra]()

    after = page_opts.page_cursor if page_opts.page_forward else None
    before = page_opts.page_cursor if not page_opts.page_forward else None

    filter_extra = MessageFilterExtra(
        conversation_id=conversation.id,
        **filter.model_dump(exclude_defaults=True),
    )

    page = (
        page_builder.setup(session=session, model=ConversationMessage)
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


@asynccontextmanager
async def message_completion_streamer(
    *,
    session: Session,
    ctx: ServiceContext,
    message_create: MessageCreate,
    customizations: MessageCreateCustomizations,
):
    body = message_create.body
    conversation_id = message_create.conversation_id or uuid4()
    user_message_id = uuid4()
    assistant_message_id = uuid4()
    role = ConversationMessageRoleEnum.human

    channel = get_conversation_channel_for(conversation_id=conversation_id)

    if message_create.conversation_id is None:
        context_messages = []
    else:
        """Load up contexts for this new message to be sent to OpenAI API for processing.

        The way the context is loaded is based on the set customizations. The context length
        specifies the amount of most recent previous messages to include in the prompt as context.

        If quoted messages are present, the quoted messages are loaded by their IDs and sent as
        context rather than loading (a max number x) most recent previous messages.
        """

        _context_size = customizations.context_length
        filters = [
            # Ensure the conversation was started or belongs to the user context
            Conversation.started_by_id == ctx.user.id,
            # Match only messages in the conversation specified by its ID
            ConversationMessage.conversation_id == message_create.conversation_id,
        ]

        # If quoted message IDs are provided, load messages where their IDs are in the
        # set of quoted message IDs provided
        if customizations.quotes and len(customizations.quotes) != 0:
            filters.append(ConversationMessage.id.in_(customizations.quotes))
            # reassign:
            _context_size = len(customizations.quotes)

        # sort ascending to restore order of messages (or reverse)
        context_messages = sorted(
            # sort desc to enusre the most recent are selected
            session.query(ConversationMessage)
            .join(Conversation)  # we need a join irrespective of SQLAlchemy loading strategy
            .filter(and_(*filters))
            .order_by(ConversationMessage.created_at.desc())
            .limit(_context_size)
            .all(),
            key=lambda x: x.created_at,
        )

        # check that all the quoted messages were matched, if not, then fail fast
        if customizations.quotes and len(customizations.quotes) != len(context_messages):
            found_ids = map(lambda x: x.id, context_messages)
            missing_ids = list(filter(lambda x: x not in found_ids, customizations.quotes))

            exception = MissingResourceException("Some or all of the quoted contexts are missing")
            exception.add_attributes(
                context={"type": ErrorContextType.details},
                path=("body", "quotes"),
                value=missing_ids,
                message=f"Missing qouted messages with ID: [{', '.join(map(str, missing_ids))}]",
            )
            raise exception

    message_prompts = [
        create_openai_message_prompt(role=x.role, body=x.body) for x in context_messages
    ]

    message_prompts.append(create_openai_message_prompt(role=role, body=body))

    aggregate_prompts = create_aggregate_prompts(prompts=message_prompts)

    async def run_celery_task():
        root_task_signature = openai_completion_task.s(
            conversation_id=conversation_id,
            prompts=aggregate_prompts,
            with_metadata=message_create.conversation_id is None,
        )

        child_task_signature = save_message_response_pair_task.s(
            conversation_id=conversation_id,
            user_message_id=user_message_id,
            assistant_message_id=assistant_message_id,
            msg_create_dict=message_create.model_dump(),
            msg_create_timestamp=get_utc_time(),
            msg_customizations_dict=customizations.model_dump(),
            user_account_dict=AccountOut.model_validate(ctx.account).model_dump(),
        )

        task = root_task_signature.apply_async(link=child_task_signature)

        # task.get(...) is a blocking call so check that task is ready, first.
        # If the task is ready, then task.get(...) can return fast enough, and
        # other statements can be executed.
        # Otherwise, await a coroutine (sleep) to give the event loop chance
        # to do something else.
        while not task.ready():
            await asyncio.sleep(0)
        task.get(propagate=True)

        if task.children is None:
            raise AppHTTPException("`save_message_response_pair_task` unresolved")
        child_task = cast("AsyncResult[list[dict[str, Any]]]", task.children[0])

        while not child_task.ready():
            await asyncio.sleep(0)
        child_result = child_task.get(propagate=True)

        user_message, assistant_message = child_result

        result = (
            ConversationMessageOut(**user_message).model_dump(mode="json"),
            ConversationMessageOut(**assistant_message).model_dump(mode="json"),
        )

        await asyncio.create_task(publisher(ctx.rdb, channel, json.dumps(result)))

    async def streamer():
        try:
            open_message_reply_stream_context = open_message_reply_stream(
                ctx=ctx,
                conversation_id=conversation_id,
                user_message_id=user_message_id,
                assistant_message_id=assistant_message_id,
            )

            async with open_message_reply_stream_context as message_reply_stream:
                asyncio.create_task(run_celery_task())
                async for stream in message_reply_stream():
                    yield stream.model_dump_json().encode()
                    yield b"\x0A"  # EOL
        except asyncio.CancelledError:
            logger.error("Error occured while streaming", exc_info=True)

    yield streamer


@asynccontextmanager
async def open_message_reply_stream(
    *,
    ctx: ServiceContext,
    conversation_id: UUID,
    user_message_id: UUID,
    assistant_message_id: UUID,
):
    pubsub = ctx.rdb.pubsub()  # type: ignore
    channel = get_conversation_channel_for(conversation_id)

    logger.info(f"Subscribing to {channel} channel...")

    await pubsub.subscribe(channel)  # type: ignore

    logger.info(f"Subscribed to {channel} channel!")

    stream_begin_signal = SignalStream(
        channel=channel,
        message="Data stream begins",
        signal=StreamSignalEnum.begin,
    )

    stream_end_signal = SignalStream(
        channel=channel,
        message="Data stream ends",
        signal=StreamSignalEnum.end,
    )

    initial_data_stream = DataStream[ConversationMessagePartial](
        channel=channel,
        message="Streaming data...",
        data=ConversationMessagePartial(
            id=assistant_message_id,
            body="",
            conversation_id=conversation_id,
            role=ConversationMessageRoleEnum.robot,
            response_to_id=user_message_id
        ),
    )

    async def message_reply_stream():
        yield stream_begin_signal
        yield initial_data_stream

        # This is a blocking code block, so every chance we get, we call await asyncio.sleep(delay)
        # This ensures that the blocking LOCs can return control to the event loop to handle other
        # tasks, hence prevents it from blocking till it completes.
        # Could be soon, could be late—God knows when!
        while True:
            pubsub_msg = cast(PubSubMessageDict | None, await pubsub.get_message())  # type: ignore

            # if the published message is not of type "pmessage" or "message"
            if pubsub_msg is None or not pubsub_msg.get("type").endswith("message"):
                # Return control to the event loop giving it time to do something else
                await asyncio.sleep(0)
                continue
            else:
                data: MessageBuffDict | list[dict[str, Any]] = json.loads(pubsub_msg.get("data"))

                if isinstance(data, list):
                    try:
                        for d in data:
                            data_stream = DataStream[ConversationMessageOut](
                                channel=channel,
                                message="Streaming resulting data",
                                data=ConversationMessageOut(**d),
                            )

                            yield data_stream
                        yield stream_end_signal
                        break
                    except:
                        pass
                else:
                    content = data.get("content")
                    data_stream = DataStream[ConversationMessagePartial](
                        channel=channel,
                        message="Streaming data...",
                        data=ConversationMessagePartial(
                            id=assistant_message_id,
                            body=content,
                            conversation_id=conversation_id,
                            role=ConversationMessageRoleEnum.robot,
                        ),
                    )
                    yield data_stream
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
