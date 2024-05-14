# Standard Library
from typing import Annotated, Any, Literal

# Third Party
from pydantic import BeforeValidator, EmailStr, Field

# First Party
from app.core.models.account import AccountProviderEnum
from app.core.schemas.base import BaseModel


def ensure_list(val: Any):
    if isinstance(val, str):
        return val.split(" ")
    return val


class Scopes(BaseModel):
    scopes: Annotated[list[str], BeforeValidator(ensure_list)]


class GoogleTokenError(BaseModel):
    error: str
    error_description: str


class GoogleIDTokenInfo(BaseModel):
    iss: Literal["https://accounts.google.com"]
    azp: str
    aud: str
    sub: str
    email: EmailStr
    email_verified: bool
    at_hash: str
    name: str
    picture: str
    given_name: str
    family_name: str
    locale: str
    iat: int = Field(strict=False)
    exp: int = Field(strict=False)


class GoogleAccessTokenInfo(BaseModel):
    azp: str
    aud: str
    sub: str
    scope: str
    exp: str
    expires_in: str
    email: EmailStr
    email_verified: bool
    access_type: Literal["online", "offline"] | str


class UnifiedOAuth2ProviderUserInfo(BaseModel):
    account_id: str
    first_name: str
    last_name: str
    email: str
    scope: str
    provider: AccountProviderEnum
