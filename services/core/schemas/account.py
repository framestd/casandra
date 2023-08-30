# Standard Library
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Any, Optional

# Third Party
from pydantic import UUID4, EmailStr, Field

# First Party
from core.authentication.token import JWTRS256Token

# Local Folder
from .base import BaseModel, SchemaBase
from .user import UserCreate

if TYPE_CHECKING:
    # Local Folder
    from .user import User


class AccountBase(BaseModel):
    email: EmailStr


class AccountCreate(AccountBase):
    password: str
    user: UserCreate


class Account(AccountBase, SchemaBase):
    active_at: datetime
    verified_at: datetime | None
    user: Optional["User"]


class TokenData(BaseModel):
    account_id: UUID4 | None


class TokenTypeEnum(str, Enum):
    BEARER = "Bearer"


class Token(BaseModel):
    access_token: JWTRS256Token[Any] = Field(json_schema_extra={"type": "string"})
    refresh_token: JWTRS256Token[Any] = Field(json_schema_extra={"type": "string"})
    token_type: TokenTypeEnum
