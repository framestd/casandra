# Standard Library
from typing import Annotated, cast

# Third Party
from fastapi import Depends, Path, WebSocket, WebSocketDisconnect, status
from pydantic import UUID4
from sqlalchemy.orm import Session

# First Party
from app.core.deps import ServiceContext, get_db, get_service_context
from app.core.deps import get_ws_service_context, preprocess_sort_param
from app.core.exceptions.http import ServiceUnavailableException
from app.core.logging.logger import get_app_logger
from app.core.schemas.conversation import Conversation, ConversationFilter
from app.core.schemas.message import Message
from app.core.schemas.pagination import PageInfo, PageOptions
from app.core.schemas.response import ResponseMetadata, StandardPaginatedResponse
from app.core.schemas.response import StandardResponse
from app.core.services.conversation import get_conversation_by_id, get_conversations
from app.core.services.message import message_reply_stream
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
    sort: Annotated[list[str], Depends(preprocess_sort_param)],
    filter: Annotated[ConversationFilter, Depends()],
    page: Annotated[PageOptions, Depends()],
    ctx: Annotated[ServiceContext, Depends(get_service_context)],
    db: Annotated[Session, Depends(get_db)],
) -> StandardPaginatedResponse[Conversation]:
    result = get_conversations(
        session=db,
        ctx=ctx,
        filter=filter,
        sorts=sort,
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


@router.websocket("/{id}/ws")
async def recieve_message_reply_stream(
    *,
    conversation_id: Annotated[UUID4, Path(alias="id")],
    websocket: WebSocket,
    ctx: Annotated[ServiceContext, Depends(get_ws_service_context)],
    db: Annotated[Session, Depends(get_db)],
):
    """Stream prompt message response back to connected clients
    just after they publish a message and it has been processed.
    """

    try:
        await websocket.accept()

        async for res in message_reply_stream(db, ctx, conversation_id):
            data = Message.model_validate(res).model_dump(mode="json")

            await websocket.send_json(data=data, mode="text")
    except WebSocketDisconnect as exc:
        # info log:
        logger.info(f"Websocket disconnected {str(exc)}", exc_info=True)
        await websocket.close(status.WS_1000_NORMAL_CLOSURE)
    except ServiceUnavailableException as exc:
        # debug log:
        logger.debug(f"{str(exc)}", exc_info=True)

        await websocket.close(status.WS_1013_TRY_AGAIN_LATER)
    except Exception as exc:
        # error log:
        logger.error(f"Error occured while streaming response: {str(exc)}", exc_info=True)

        await websocket.close(status.WS_1011_INTERNAL_ERROR)
