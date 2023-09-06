# Standard Library
from datetime import UTC, datetime, timedelta
from typing import Annotated, cast

# Third Party
from fastapi import Depends, Response, WebSocket, WebSocketDisconnect, status
from pydantic import UUID4
from sqlalchemy.orm import Session

# First Party
from app.core.authentication.token import JWTRS256Token
from app.core.deps import ServiceContext, get_db, get_service_context
from app.core.deps import get_ws_service_context
from app.core.exceptions.http import ServiceUnavailableException
from app.core.logging.logger import get_app_logger
from app.core.schemas.chat_message import ChatMessage, ChatMessageCreate
from app.core.schemas.response import StandardResponse, StatusResponse
from app.core.services.chat_message import get_chat_message_by_id, handle_message
from app.core.services.chat_message import message_reply_stream
from app.core.settings import settings
from app.core.specs.additional_responses import responses
from app.core.utils import tok_payload

# Local Folder
from .router import router

logger = get_app_logger(__name__)


@router.post(
    "/message",
    response_model=StatusResponse[ChatMessage],
    responses={401: responses.get("o401"), 422: responses.get("o422")},
)
async def publish_message(
    response: Response,
    message: ChatMessageCreate,
    ctx: Annotated[ServiceContext, Depends(get_service_context)],
    db: Session = Depends(get_db),
) -> StatusResponse[ChatMessage]:
    """
    Publish a prompt message to be handled by various connecting services.

    Pre-listen on a websocket connection with the conversation id of the published
    prompt message for a response stream to the prompt message itself.
    """

    chat_message = await handle_message(session=db, ctx=ctx, message=message)

    expiry = timedelta(minutes=60)

    websocket_access_token = JWTRS256Token.from_data(
        data=tok_payload(ctx.account.id),
        expires_delta=expiry,
    )

    response.set_cookie(
        key=settings.WEBSOCKET_ACCESS_TOKEN_KEY,
        value=str(websocket_access_token),
        expires=(datetime.utcnow() + expiry).astimezone(tz=UTC),
        path="/chats/message/ws",
    )

    return StatusResponse[ChatMessage](
        data=cast(ChatMessage, chat_message),
        message="Message understood",
        success=True,
    )


@router.get(
    "/message/{id}",
    response_model=StandardResponse[ChatMessage],
    responses={
        401: responses.get("o401"),
        403: responses.get("o403"),
        422: responses.get("o422"),
    },
)
def read_chat_message_by_id(
    id: UUID4,
    ctx: Annotated[ServiceContext, Depends(get_service_context)],
    db: Session = Depends(get_db),
):
    """Read a message by a given id."""

    chat_message = get_chat_message_by_id(session=db, ctx=ctx, id=id)

    response = StandardResponse[ChatMessage](data=cast(ChatMessage, chat_message))

    return response


@router.websocket("/message/ws")
async def recieve_message_reply_stream(
    *,
    conversation_id: UUID4,
    websocket: WebSocket,
    ctx: Annotated[ServiceContext, Depends(get_ws_service_context)],
    db: Session = Depends(get_db),
):
    """Stream prompt message response back to connected clients
    just after they publish a message and it has been processed.
    """

    try:
        await websocket.accept()

        async for res in message_reply_stream(db, ctx, conversation_id):
            data = ChatMessage.model_validate(res).model_dump(mode="json")

            await websocket.send_json(data=data, mode="text")
    except WebSocketDisconnect:
        await websocket.close(status.WS_1000_NORMAL_CLOSURE)
    except ServiceUnavailableException as exc:
        # error log:
        logger.error(f"{str(exc)}", exc_info=True)

        await websocket.close(status.WS_1013_TRY_AGAIN_LATER)
    except Exception as exc:
        # error log:
        logger.error(
            f"Error occured while streaming response: {str(exc)}", exc_info=True
        )

        await websocket.close(status.WS_1011_INTERNAL_ERROR)
