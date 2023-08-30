# Standard Library
from typing import Annotated

# Third Party
from fastapi import Depends
from jose import JWTError
from sqlalchemy.orm import Session

# First Party
from core.authentication.oauth2 import oauth2_scheme
from core.exceptions.application import MissingResourceException
from core.exceptions.http import UnauthorizedException
from core.schemas.account import TokenData
from core.services.account import get_account_by_id

# Local Folder
from .authentication.token import JWTRS256Token, split_prefix_from_sub
from .database.engine import SessionLocal


async def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
    finally:
        db.close()


def get_current_account(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Session = Depends(get_db),
):
    credentials_exception = UnauthorizedException(
        message="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    encoded_token = JWTRS256Token[dict[str, str]](token=token)

    try:
        payload = encoded_token.decode()

        sub = payload.get("sub")

        if sub is None:
            raise credentials_exception

        _, account_id = split_prefix_from_sub(sub)

        token_data = TokenData(account_id=account_id)  # type: ignore

    except JWTError:
        raise credentials_exception

    try:
        account = get_account_by_id(db, id=token_data.account_id)  # type: ignore
    except MissingResourceException:
        raise credentials_exception

    return account
