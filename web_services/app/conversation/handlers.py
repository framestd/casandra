# Standard Library
import asyncio
from typing import Annotated, cast

# Third Party
from fastapi import Depends, Path, WebSocket, WebSocketDisconnect
from pydantic import UUID4
from sqlalchemy.orm import Session

# First Party
from app.core.deps import ServiceContext, get_db, get_service_context
from app.core.deps import get_ws_service_context, preprocess_sort_param
from app.core.logging.logger import get_app_logger
from app.core.schemas.conversation import Conversation, ConversationFilter
from app.core.schemas.conversation import ConversationUpdate
from app.core.schemas.pagination import PageInfo, PageOptions
from app.core.schemas.response import ResponseMetadata, StandardPaginatedResponse
from app.core.schemas.response import StandardResponse
from app.core.services.conversation import get_conversation_by_id, get_conversations
from app.core.services.conversation import update_conversation_service
from app.core.services.message import open_message_reply_stream
from app.core.specs.additional_responses import responses

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
    """Read a conversation by a given ID."""

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
    sort: Annotated[list[str], Depends(preprocess_sort_param(Conversation))],
    filter: Annotated[ConversationFilter, Depends()],
    page: Annotated[PageOptions, Depends()],
    ctx: Annotated[ServiceContext, Depends(get_service_context)],
    db: Annotated[Session, Depends(get_db)],
) -> StandardPaginatedResponse[Conversation]:
    """Read a page of conversations at any one time, with each page not containing
    more than 100 objects or edges"""

    result = get_conversations(
        session=db,
        ctx=ctx,
        filter=filter,
        sorts=sort,
        page_opts=page,
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


@router.put(
    "/{id}",
    response_model=StandardResponse[Conversation],
    responses={
        401: responses.get("o401"),
        403: responses.get("o403"),
        422: responses.get("o422"),
    },
)
def revise_conversation(
    id: UUID4,
    conversation_update: ConversationUpdate,
    ctx: Annotated[ServiceContext, Depends(get_service_context)],
    db: Annotated[Session, Depends(get_db)],
):
    """Revise a conversation by a given ID, specifying changes to be made"""

    conversation = update_conversation_service(
        session=db, ctx=ctx, id=id, conversation_update=conversation_update
    )

    response = StandardResponse[Conversation](data=cast(Conversation, conversation))

    return response


@router.websocket("/{id}/ws")
async def recieve_message_reply_stream(
    *,
    websocket: WebSocket,
    conversation_id: Annotated[UUID4, Path(alias="id")],
    ctx: Annotated[ServiceContext, Depends(get_ws_service_context)],
    db: Annotated[Session, Depends(get_db)],
):
    """Stream prompt message response back to connected clients
    just after they publish a message and it has been processed.
    """

    async def receiver_task(websocket: WebSocket):
        try:
            while True:
                await websocket.receive_text()
                await asyncio.sleep(0)
        except WebSocketDisconnect as exc:
            logger.info(
                f"Socket disconnected for {websocket.url}"
                f' with code={exc.code}, reason="{exc.reason}"'
            )
            # re-raise to cancel the task
            raise exc

    async def streamer(websocket: WebSocket):
        async with open_message_reply_stream(db, ctx, conversation_id) as message_reply_stream:
            async for stream in message_reply_stream():
                await websocket.send_json(mode="binary", data=stream.model_dump(mode="json"))

    async with asyncio.TaskGroup() as tg:
        tg.create_task(receiver_task(websocket))
        await tg.create_task(streamer(websocket))
