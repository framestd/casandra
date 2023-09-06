# Standard Library
from typing import Annotated

# Third Party
from fastapi import Cookie, Depends, WebSocketException, status
from sqlalchemy.orm import Session

# First Party
from app.core.authentication.oauth2 import oauth2_scheme
from app.core.exceptions.http import UnauthorizedException
from app.core.logging.logger import get_app_logger
from app.core.models.account import Account
from app.core.services.account import get_account_by_token
from app.core.settings import settings

# Local Folder
from .database.engine import SessionLocal

__all__ = (
    "ServiceContext",
    "get_db",
    "get_current_account",
    "get_ws_current_account",
    "get_service_context",
    "get_ws_service_context",
)

logger = get_app_logger(__name__)


class ServiceContext:
    def __init__(self, account: Account):
        self.user = account.user
        self.account = account


async def get_db():
    logger.info("Opening a database session...")

    db = SessionLocal()

    try:
        logger.info("Database session opened and provided!")

        yield db
    except Exception:
        db.rollback()
    finally:
        logger.info("Closing the database session...")

        db.close()

        logger.info("Database session closed!")


def get_ws_current_account(
    token: Annotated[str | None, Cookie(alias=settings.WS_ACCESS_TOKEN_KEY)] = None,
    db: Session = Depends(get_db),
):
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
    current_account: Annotated[Account, Depends(get_current_account)]
):
    return ServiceContext(current_account)


def get_ws_service_context(
    current_account: Annotated[Account, Depends(get_ws_current_account)]
):
    return ServiceContext(current_account)
