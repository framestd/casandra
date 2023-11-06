# Standard Library
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

# Third Party
from pydantic import UUID4, EmailStr

# First Party
from app.core.models.account import AccountProviderEnum
from app.core.schemas.connected_services import ConnectedServices
from app.core.schemas.oauth2 import Scopes

# Local Folder
from .base import BaseModel, SchemaBase
from .user import UserCreate

if TYPE_CHECKING:
    # Local Folder
    from .user import User


class AccountBase(BaseModel):
    """Foundational, common attributes"""

    email: EmailStr


class AccountCredentialsOIDCBase(BaseModel):
    """Foundational, common attributes for providing credentials to a  user account using an
    existing OAuth 2.0 client and OpenID Connect (OIDC)
    """

    provider: AccountProviderEnum
    id_token: str
    access_token: str


class AccountCreate(AccountBase):
    """Attributes necessary for creating an Account object"""

    password: str
    user: UserCreate


class AccountCreateOIDC(AccountCredentialsOIDCBase):
    """Attributes necessary for creating an account object using an existing OAuth 2.0 client and
    OpenID Connect (OIDC)
    """

    pass


class AccountCredentialsOIDC(AccountCredentialsOIDCBase):
    """Attributes necessary for signing in to a user account using an existing OAuth 2.0 client
    and OpenID Connect (OIDC)
    """

    pass


class AccountMeta(SchemaBase, Scopes):
    provider: AccountProviderEnum
    provider_account_id: str | None
    account_id: UUID4


class Account(AccountBase, SchemaBase):
    """Account object representation with extra attributes to
    foundational attributes
    """

    active_at: datetime
    verified_at: datetime | None
    user: "User"
    meta: AccountMeta
    connected_services: list[ConnectedServices]


class TokenData(BaseModel):
    account_id: UUID4 | None


class TokenTypeEnum(str, Enum):
    BEARER = "Bearer"


class TokenBase(BaseModel):
    expires_in: float
    expiry: float
    access_token: str
    token_type: TokenTypeEnum


class Token(TokenBase):
    """Token outbound attributes"""

    id: UUID4
    refresh_token: str
