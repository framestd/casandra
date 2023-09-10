# Standard Library
from typing import Annotated, cast

# Third Party
from fastapi import Depends, Query
from pydantic import UUID4
from sqlalchemy.orm import Session

# First Party
from app.core.deps import ServiceContext, get_db, get_service_context
from app.core.logging.logger import get_app_logger
from app.core.schemas.conversation import Conversation, ConversationFilter
from app.core.schemas.pagination import PageInfo, PageOptions
from app.core.schemas.response import ResponseMetadata, StandardPaginatedResponse
from app.core.schemas.response import StandardResponse
from app.core.services.conversation import get_conversation_by_id, get_conversations
from app.core.specs.additional_responses import responses
from app.core.utils import describe_field

# Local Folder
from .router import router

logger = get_app_logger(__name__)


@router.get(
    "/{id}",
    response_model=StandardResponse[Conversation],
    responses={
        401: responses.get("o401"),
        403: responses.get("o403"),
        422: responses.get("o422"),
    },
)
def read_conversation_by_id(
    id: UUID4,
    ctx: Annotated[ServiceContext, Depends(get_service_context)],
    db: Annotated[Session, Depends(get_db)],
) -> StandardResponse[Conversation]:
    """Read a conversation by a given id."""

    conversation = get_conversation_by_id(session=db, ctx=ctx, id=id)

    response = StandardResponse[Conversation](data=cast(Conversation, conversation))

    return response


@router.get(
    "/",
    response_model=StandardPaginatedResponse[Conversation],
    responses={
        401: responses.get("o401"),
        422: responses.get("o422"),
    },
)
def read_conversations(
    *,
    sort: Annotated[str, Query(description=describe_field(Conversation))] = "",
    filter: Annotated[ConversationFilter, Depends()],
    page: Annotated[PageOptions, Depends()],
    ctx: Annotated[ServiceContext, Depends(get_service_context)],
    db: Annotated[Session, Depends(get_db)],
) -> StandardPaginatedResponse[Conversation]:
    result = get_conversations(
        session=db,
        ctx=ctx,
        filter=filter,
        sorts=sort.split(","),
        page=page,
    )

    start_cursor, end_cursor = result.cursors
    has_prev, has_next = result.has_prev, result.has_next

    response = StandardPaginatedResponse(
        data=cast(list[Conversation], result.obj),
        metadata=ResponseMetadata(
            total_objects=result.total_pages,
            page_info=PageInfo(
                top_cursor=start_cursor,
                bottom_cursor=end_cursor,
                has_prev=has_prev,
                has_next=has_next,
            ),
        ),
    )

    return response
