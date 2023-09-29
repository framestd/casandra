# Standard Library
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Any

# Third Party
from pydantic import UUID4, EmailStr, Field

# First Party
from app.core.authentication.token import JWTRS256Token

# Local Folder
from .base import BaseModel, SchemaBase
from .user import UserCreate

if TYPE_CHECKING:
    # Local Folder
    from .user import UserOut


class AccountBase(BaseModel):
    """Foundational, common attributes"""

    email: EmailStr


class AccountCreate(AccountBase):
    """Attributes necessary for creating an Account object"""

    password: str
    user: UserCreate


class AccountOut(AccountBase, SchemaBase):
    """Account object representation with extra attributes to
    foundational attributes
    """

    active_at: datetime
    verified_at: datetime | None
    user: "UserOut"


class TokenData(BaseModel):
    account_id: UUID4 | None


class TokenTypeEnum(str, Enum):
    BEARER = "Bearer"


class Token(BaseModel):
    """Token outbound attributes"""

    access_token: JWTRS256Token[Any] = Field(json_schema_extra={"type": "string"})
    refresh_token: JWTRS256Token[Any] = Field(json_schema_extra={"type": "string"})
    token_type: TokenTypeEnum
