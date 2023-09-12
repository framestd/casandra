# Standard Library
from datetime import UTC, datetime, timedelta
from typing import Annotated, cast

# Third Party
from fastapi import Depends, Response
from pydantic import UUID4
from sqlalchemy.orm import Session

# First Party
from app.core.authentication.token import JWTRS256Token
from app.core.deps import ServiceContext, get_db, get_service_context
from app.core.logging.logger import get_app_logger
from app.core.schemas.message import Message, MessageCreate
from app.core.schemas.response import StandardPaginatedResponse, StandardResponse
from app.core.schemas.response import StatusResponse
from app.core.services.message import get_chat_message_by_id, handle_message
from app.core.settings import settings
from app.core.specs.additional_responses import responses
from app.core.utils import tok_payload

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

    expiry = timedelta(minutes=60)

    websocket_access_token = JWTRS256Token.from_data(
        data=tok_payload(ctx.account.id),
        expires_delta=expiry,
    )

    response.set_cookie(
        key=settings.WS_ACCESS_TOKEN_KEY,
        value=str(websocket_access_token),
        expires=(datetime.utcnow() + expiry).astimezone(tz=UTC),
        path="/chats/message/ws",
    )

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

    chat_message = get_chat_message_by_id(session=db, ctx=ctx, id=id)

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
    conversation_id: UUID4,
    ctx: Annotated[ServiceContext, Depends(get_service_context)],
    db: Annotated[Session, Depends(get_db)],
):
    pass
