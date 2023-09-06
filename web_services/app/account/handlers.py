# Standard Library
from datetime import timedelta
from typing import Annotated, cast

# Third Party
from fastapi import Depends
from sqlalchemy.orm import Session

# First Party
from app.core.authentication.oauth2 import OAuth2PasswordAndRefreshRequestForm
from app.core.authentication.token import JWTRS256Token
from app.core.deps import get_current_account, get_db
from app.core.logging.logger import get_app_logger
from app.core.schemas.account import Account, AccountCreate, Token, TokenTypeEnum
from app.core.schemas.response import StandardResponse, StatusResponse
from app.core.services.account import authenticate_user_account_service
from app.core.services.account import create_user_account_service
from app.core.services.account import reauthenticate_user_account_service
from app.core.specs.additional_responses import responses
from app.core.utils import tok_payload

# Local Folder
from .router import router

logger = get_app_logger(__name__)


@router.post(
    "/create",
    status_code=201,
    response_model=StatusResponse[Account],
    responses={419: responses.get("o419"), 422: responses.get("o422")},
)
def create_user_account(
    credentials: AccountCreate, db: Session = Depends(get_db)
) -> StatusResponse[Account]:
    """Create a user account"""

    account = create_user_account_service(session=db, credentials=credentials)
    response = StatusResponse[Account](
        data=cast(Account, account),
        message="User account created successfully",
        success=True,
    )

    return response


@router.post(
    "/authenticate", response_model=Token, responses={422: responses.get("o422")}
)
def authenticate_user_account(
    form_data: Annotated[OAuth2PasswordAndRefreshRequestForm, Depends()],
    db: Session = Depends(get_db),
) -> Token:
    """OAuth2 authentication for clients.

    Provides an access and refresh token. The access token can be used to request
    resources requiring authorization, while the refresh token can be used to
    re-authenticate, providing a fresh token when the previous access token expires.

    Request form body takes username and password, essentially, to authenticate;
    where username can be anything, an email address or a "username". In this case
    the application expects it to be an email address.

    A refresh_token is expected in lieu of a username and password, with a grant_type
    of "refresh_token" for a reauthentication request.
    """

    grant_type = form_data.grant_type
    identifier = form_data.username
    password = form_data.password
    refresh_token = form_data.refresh_token

    # debug log:
    logger.debug(f"Authenticating client with grant_type={grant_type}")

    if grant_type == "refresh_token":
        account = reauthenticate_user_account_service(db, refresh_token)
    else:
        account = authenticate_user_account_service(
            db, identifier=identifier, password=password
        )

    access_token = JWTRS256Token.from_data(data=tok_payload(account.id))
    refresh_token = JWTRS256Token.from_data(
        data=tok_payload(account.id),
        expires_delta=timedelta(days=7),
    )

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type=TokenTypeEnum.BEARER,
    )


@router.get("/me", response_model=StandardResponse[Account])
def identify_user_account(
    current_account: Annotated[Account, Depends(get_current_account)]
) -> StandardResponse[Account]:
    """Identify the current user and return the user account"""

    response = StandardResponse[Account](data=current_account)

    return response
