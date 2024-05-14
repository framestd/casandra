# Standard Library
from typing import Annotated, cast

# Third Party
from fastapi import Depends
from fastapi.responses import StreamingResponse
from pydantic import UUID4
from sqlalchemy.orm import Session

# First Party
from app.core.deps import ServiceContext, get_db, get_service_context
from app.core.deps import preprocess_sort_param
from app.core.logging.logger import get_app_logger
from app.core.schemas.message import ConversationMessage, MessageCreate
from app.core.schemas.message import MessageCreateCustomizations, MessageFilter
from app.core.schemas.pagination import PageInfo, PageOptions
from app.core.schemas.response import ResponseMetadata, StandardPaginatedResponse
from app.core.schemas.response import StandardResponse
from app.core.services.message import get_message_by_id
from app.core.services.message import get_messages_by_conversation_id
from app.core.services.message import message_completion_streamer
from app.core.specs.additional_responses import responses

# Local Folder
from .router import router

logger = get_app_logger(__name__)


@router.post(
    "/",
    responses={401: responses.get("o401"), 422: responses.get("o422")},
)
async def publish_message(
    message: MessageCreate,
    customizations: MessageCreateCustomizations,
    ctx: Annotated[ServiceContext, Depends(get_service_context)],
    db: Annotated[Session, Depends(get_db)],
) -> StreamingResponse:
    """
    Publish a prompt message to be handled by various connecting services.

    Pre-listen on a websocket connection with the conversation id of the published
    prompt message for a response stream to the prompt message itself.
    """

    message_completion_stremer_context = message_completion_streamer(
        session=db,
        ctx=ctx,
        message_create=message,
        customizations=customizations,
    )

    async with message_completion_stremer_context as streamer:
        response = StreamingResponse(streamer(), media_type="text/event-stream")
        response.headers.append("X-Accel-Buffering", "no")  # https://stackoverflow.com/a/27960243

        return response


@router.get(
    "/{id}",
    response_model=StandardResponse[ConversationMessage],
    responses={
        401: responses.get("o401"),
        403: responses.get("o403"),
        422: responses.get("o422"),
    },
)
def read_chat_message_by_id(
    id: UUID4,
    ctx: Annotated[ServiceContext, Depends(get_service_context)],
    db: Annotated[Session, Depends(get_db)],
):
    """Read a message by a given id."""

    chat_message = get_message_by_id(session=db, ctx=ctx, id=id)

    response = StandardResponse[ConversationMessage](data=cast(ConversationMessage, chat_message))

    return response


@router.get(
    "/",
    response_model=StandardPaginatedResponse[ConversationMessage],
    responses={
        401: responses.get("o401"),
        403: responses.get("o403"),
        422: responses.get("o422"),
    },
)
def read_chat_messages_by_conversation_id(
    *,
    conversation_id: UUID4,
    sort: Annotated[list[str], Depends(preprocess_sort_param(ConversationMessage))],
    filter: Annotated[MessageFilter, Depends()],
    page: Annotated[PageOptions, Depends()],
    ctx: Annotated[ServiceContext, Depends(get_service_context)],
    db: Annotated[Session, Depends(get_db)],
):
    message = get_messages_by_conversation_id(
        session=db,
        ctx=ctx,
        conversation_id=conversation_id,
        filter=filter,
        sorts=sort,
        page_opts=page,
    )

    start_cursor, end_cursor = message.cursors
    has_prev, has_next = message.has_prev, message.has_next

    response = StandardPaginatedResponse(
        data=cast(list[ConversationMessage], message.edges),
        metadata=ResponseMetadata(
            total_objects=message.total_pages,
            page_info=PageInfo(
                top_cursor=start_cursor,
                bottom_cursor=end_cursor,
                has_prev=has_prev,
                has_next=has_next,
            ),
        ),
    )

    return response
