# Standard Library
from typing import Annotated, TypeVar
from uuid import uuid4

# Third Party
from fastapi import Cookie, Depends, Query, WebSocket, WebSocketException, status
from redis.asyncio import StrictRedis
from sqlalchemy.orm import Session

# First Party
from app.core.authentication.oauth2 import oauth2_scheme
from app.core.exceptions.http import UnauthorizedException
from app.core.logging.logger import get_app_logger
from app.core.models.account import Account
from app.core.redis.client import appredis
from app.core.schemas.base import BaseModel
from app.core.services.account import get_account_by_token
from app.core.settings import settings
from app.core.utils import describe_field, split_field

# Local Folder
from .database.engine import SessionLocal

__all__ = (
    "ServiceContext",
    "get_db",
    "get_redis_db",
    "get_current_account",
    "get_ws_current_account",
    "get_service_context",
    "get_ws_service_context",
    "preprocess_sort_param",
)

logger = get_app_logger(__name__)

SchemaT = TypeVar("SchemaT", bound=BaseModel)


class ServiceContext:
    def __init__(self, *, account: Account, rdb: "StrictRedis[str]"):
        self.user = account.user
        self.account = account
        self.rdb = rdb


async def get_db():
    session_id = uuid4()
    logger.info(f"Opening a database session (Session ID: {session_id})...")
    db = SessionLocal()

    try:
        logger.info(f"Database session  (Session ID: {session_id}) opened and provided!")
        yield db
    except Exception:
        db.rollback()
    finally:
        logger.info(f"Closing the database session  (Session ID: {session_id})...")
        db.close()
        logger.info(f"Database session  (Session ID: {session_id}) closed!")


async def get_redis_db():
    redis = appredis.get_cleint()
    return redis


async def get_ws_current_account(
    websocket: WebSocket,
    token: Annotated[str | None, Cookie(alias=settings.WS_ACCESS_TOKEN_KEY)] = None,
    db: Session = Depends(get_db),
):
    await websocket.accept()

    if token is None:
        message = f"Required cookie, {settings.WS_ACCESS_TOKEN_KEY}, but none found"

        # debug log:
        logger.debug(message)
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION, reason=message)

    logger.debug("Loading current user account using cookie token")

    try:
        account = get_account_by_token(db, token)
    except UnauthorizedException as exc:
        logger.debug(str(exc), exc_info=True)
        raise WebSocketException(code=status.WS_1008_POLICY_VIOLATION, reason=str(exc))

    return account


def get_current_account(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db),
):
    # debug log:
    logger.debug("Loading current user account using oauth2_scheme token")

    account = get_account_by_token(db, token)

    return account


def get_service_context(
    current_account: Annotated[Account, Depends(get_current_account)],
    rdb: Annotated["StrictRedis[str]", Depends(get_redis_db)],
):
    return ServiceContext(account=current_account, rdb=rdb)


def get_ws_service_context(
    current_account: Annotated[Account, Depends(get_ws_current_account)],
    rdb: Annotated["StrictRedis[str]", Depends(get_redis_db)],
):
    return ServiceContext(account=current_account, rdb=rdb)


def preprocess_sort_param(schema: type[SchemaT]):
    def preprocessor(sort: Annotated[str | None, Query(description=describe_field(schema))] = None):
        default: list[str] = []
        if sort is None:
            return default
        return split_field(sort, delimiter=",")

    return preprocessor
