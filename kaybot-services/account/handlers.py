# Standard Library
from datetime import timedelta
from typing import Annotated

# Third Party
from fastapi import Depends
from sqlalchemy.orm import Session

# First Party
from core.authentication.oauth2 import OAuth2PasswordAndRefreshRequestForm
from core.authentication.token import JWTRS256Token, prefix_sub
from core.deps import get_current_account, get_db
from core.logging.logger import get_app_logger
from core.schemas.account import Account, AccountCreate, Token, TokenTypeEnum
from core.schemas.response import StandardResponse, StatusResponse
from core.services.account import authenticate_user_account_service
from core.services.account import create_user_account_service
from core.services.account import reauthenticate_user_account_service
from core.specs.additional_responses import responses

# Local Folder
from .router import router

logger = get_app_logger(__name__)


@router.post(
    "/create",
    response_model=StatusResponse[Account],
    responses={419: responses.get("o419"), 422: responses.get("o422")},
)
def create_user_account(
    credentials: AccountCreate, db: Session = Depends(get_db)
) -> StatusResponse[Account]:
    account = create_user_account_service(session=db, credentials=credentials)
    response = StatusResponse[Account](
        data=account,  # type: ignore
        message="Account created successfully",
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
    if form_data.grant_type == "refresh_token":
        # info log:
        logger.info(f"Authenticating client with grant_type={form_data.grant_type}")

        refresh_token = form_data.refresh_token
        account = reauthenticate_user_account_service(db, refresh_token)
    else:
        # info log:
        logger.info(f"Authenticating client with grant_type={form_data.grant_type}")

        account = authenticate_user_account_service(
            db,
            identifier=form_data.username,
            password=form_data.password,
        )

    access_token = JWTRS256Token.from_data(data={"sub": prefix_sub(account.id.hex)})
    refresh_token = JWTRS256Token.from_data(
        data={"sub": prefix_sub(account.id.hex)},
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
