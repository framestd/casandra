# Standard Library
from typing import Annotated, cast

# Third Party
from fastapi import Depends, Response
from pydantic import UUID4
from sqlalchemy.orm import Session

# First Party
from app.core.deps import ServiceContext, get_db, get_service_context
from app.core.deps import preprocess_sort_param
from app.core.logging.logger import get_app_logger
from app.core.schemas.message import Message, MessageCreate, MessageFilter
from app.core.schemas.pagination import PageInfo, PageOptions
from app.core.schemas.response import ResponseMetadata, StandardPaginatedResponse
from app.core.schemas.response import StandardResponse, StatusResponse
from app.core.services.message import get_message_by_id
from app.core.services.message import get_messages_by_conversation_id, handle_message
from app.core.specs.additional_responses import responses

# Local Folder
from .router import router

logger = get_app_logger(__name__)


@router.post(
    "/",
    response_model=StatusResponse[Message],
    responses={401: responses.get("o401"), 422: responses.get("o422")},
)
async def publish_message(
    response: Response,
    message: MessageCreate,
    ctx: Annotated[ServiceContext, Depends(get_service_context)],
    db: Annotated[Session, Depends(get_db)],
) -> StatusResponse[Message]:
    """
    Publish a prompt message to be handled by various connecting services.

    Pre-listen on a websocket connection with the conversation id of the published
    prompt message for a response stream to the prompt message itself.
    """

    chat_message = await handle_message(session=db, ctx=ctx, message=message)

    return StatusResponse[Message](
        data=cast(Message, chat_message),
        message="Message understood",
        success=True,
    )


@router.get(
    "/{id}",
    response_model=StandardResponse[Message],
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

    response = StandardResponse[Message](data=cast(Message, chat_message))

    return response


@router.get(
    "/",
    response_model=StandardPaginatedResponse[Message],
    responses={
        401: responses.get("o401"),
        403: responses.get("o403"),
        422: responses.get("o422"),
    },
)
def read_chat_messages_by_conversation_id(
    *,
    conversation_id: UUID4,
    sort: Annotated[list[str], Depends(preprocess_sort_param(Message))],
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
        data=cast(list[Message], message.obj),
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
