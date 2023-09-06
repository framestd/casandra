# Standard Library
from typing import Annotated, Union

# Third Party
from fastapi import Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

__all__ = (
    "AUTHENTICATION_TOKEN_URL",
    "oauth2_scheme",
    "OAuth2PasswordAndRefreshRequestForm",
)

AUTHENTICATION_TOKEN_URL = "/accounts/authenticate"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=AUTHENTICATION_TOKEN_URL)


class OAuth2PasswordAndRefreshRequestForm(OAuth2PasswordRequestForm):
    """Modified from fastapi.security.OAuth2PasswordRequestForm"""

    def __init__(
        self,
        *,
        grant_type: Annotated[
            Union[str, None], Form(pattern="password|refresh_token")
        ] = None,
        username: Annotated[str, Form()],
        password: Annotated[str, Form()] = "",
        refresh_token: Annotated[str, Form()] = "",
        scope: Annotated[str, Form()] = "",
        client_id: Annotated[Union[str, None], Form()] = None,
        client_secret: Annotated[Union[str, None], Form()] = None,
    ):
        super().__init__(
            grant_type=grant_type,
            username=username,
            password=password,
            client_id=client_id,
            client_secret=client_secret,
            scope=scope,
        )

        self.grant_type = grant_type
        self.username = username
        self.password = password
        self.refresh_token = refresh_token
        self.scopes = scope.split()
        self.client_id = client_id
        self.client_secret = client_secret
