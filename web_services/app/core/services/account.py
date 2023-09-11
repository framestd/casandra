# Standard Library
from uuid import UUID

# Third Party
from jose import JWTError
from sqlalchemy.orm import Session

# First Party
from app.core.authentication.password import Password
from app.core.authentication.token import JWTRS256Token, split_prefix_from_sub
from app.core.exceptions.application import ChallengeFailedException
from app.core.exceptions.application import MissingResourceException
from app.core.exceptions.code import ErrorContextType
from app.core.exceptions.http import AppHTTPException, ConflictException
from app.core.exceptions.http import UnauthorizedException
from app.core.logging.logger import get_app_logger
from app.core.models.account import Account as AccountModel
from app.core.models.user import User as UserModel
from app.core.schemas import account as schema

# Local Folder
from .user import get_user_by_username

logger = get_app_logger(__name__)


def create_user_account_service(session: Session, credentials: schema.AccountCreate):
    """Create a user account that will be used for authentication and will serve
    as the user's identification through the entire system

    :param session: the database session to use to create a new account

    :param credentials: the credentials or data to use to create a new account

    :raises ConflictException:
        - if account with email already exists or,
        - if user with username already exists
    """

    hashed = Password(credentials.password).get_hash()

    user = UserModel(**credentials.user.model_dump())
    account = AccountModel(email=credentials.email, password=hashed, user=user)

    existing_account: AccountModel | None = None
    existing_user: UserModel | None = None

    email, username = credentials.email, credentials.user.username

    try:
        existing_account = get_account_by_email(session, email=email)
        existing_user = get_user_by_username(session, username=username)
    except MissingResourceException:
        pass

    if not existing_account is None or not existing_user is None:
        exception = ConflictException("Some of the details provided are already in use")

        if not existing_account is None:
            # debug log
            logger.debug(f'Email address "{email}" is already taken')

            exception.add_attributes(
                context={"type": ErrorContextType.details},
                message="Email address's already in use",
                path=("body", "email"),
                value=email,
            )

        if not existing_user is None:
            # debug log
            logger.debug(f'Username "{username}" is already taken')

            exception.add_attributes(
                context={"type": ErrorContextType.details},
                message="Username is already taken",
                path=("body", "user", "username"),
                value=username,
            )

        raise exception

    session.add(account)
    session.commit()
    session.refresh(account)

    return account


def authenticate_user_account_service(session: Session, identifier: str, password: str):
    """Authenticate a user using an identifier (in this case an email address only)
    and a password.

    :param session: the database session to use to create a new account

    :param identifier: the user account email address used to retrieve the account

    :param password: the plain text user account password used to confirm access integrity

    :raises MissingResourceException:
        when an account with the identifier or email couldn't be found

    :raises CredentialsException:
        when the plain password supplied doesn't match the hashed password stored.
    """

    try:
        account = get_account_by_email(session, email=identifier)
    except MissingResourceException as exc:  # Modify exception
        # debug log:
        logger.debug(exc.message)

        exception = MissingResourceException(
            "You don not have an account", headers=exc.headers  # type: ignore
        )

        exception.add_attributes(
            context={"type": ErrorContextType.help},
            message="You should create an account first",
            path=("body", "email"),
            value=identifier,
        )

        raise exception

    challenge = Password(plain=password)

    if not challenge.compare(hashed=account.password) is True:
        # debug log:
        logger.debug(
            f"Access to account with email {identifier} was tried with a wrong password"
        )

        exception = ChallengeFailedException("Incorrect password")

        exception.add_attributes(
            context={"type": ErrorContextType.help},
            message="Check the password and try again",
            path=("body", "password"),
            value="********",
        )

        raise exception

    return account


def reauthenticate_user_account_service(session: Session, refresh_token: str):
    """Reauthenticate a user using a previously granted token

    :param session: the database session to use to create a new account

    :param refresh_token: the previously granted refresh token

    :raises UnauthorizedException:
        - when it fails to verify a jwt refresh token
        - when a user account corresponding to the claims in the refresh token couldn't be found
    """

    credentials_exception = UnauthorizedException(
        message="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = JWTRS256Token[dict[str, str]](refresh_token).decode()

        sub = payload.get("sub")

        if sub is None:
            raise credentials_exception

        _, account_id = split_prefix_from_sub(sub)

        token_data = schema.TokenData(account_id=account_id)  # type: ignore
    except JWTError:
        # error log:
        logger.error("Failed to verify refresh token", exc_info=True)

        credentials_exception.add_attributes(
            context={"type": ErrorContextType.details},
            path=("body", "refresh_token"),
            value=refresh_token,
            message="Token has either expired or is invalid",
        )

        raise credentials_exception

    try:
        account = get_account_by_id(session, id=token_data.account_id)  # type: ignore
    except MissingResourceException:
        # debug log:
        logger.debug(f"Account, {token_data.account_id}, no longer exists")

        credentials_exception.add_attributes(
            context={"type": ErrorContextType.details},
            path=("body", "refresh_token"),
            value=token_data.account_id,
            message="User account no longer exists",
        )

        raise credentials_exception

    return account


def get_account_by_id(session: Session, id: UUID):
    """Get a user account by the account ID

    :param session: the database session to use to create a new account

    :param id: the user account id to use to retrieve the account

    :raises MissingResourceException:
        if account with the specified id couldn't be found
    """

    account = session.query(AccountModel).filter(AccountModel.id == id).one_or_none()

    if account is None:
        # debug log:
        logger.debug(f"Account with id {id} does not exist")

        exception = MissingResourceException(f"Account with id **{id}** not found")

        exception.add_attributes(
            context=None,
            message=exception.message,
            path=("*", "id"),
            value=id,
        )

        raise exception

    return account


def get_account_by_email(session: Session, email: str):
    """Get a user account by the account email address

    :param session: the database session to use to create a new account

    :param email: the user account email address to use to retrieve the account

    :raises MissingResourceException:
        if account with the specified email address couldn't be found
    """

    account = (
        session.query(AccountModel).filter(AccountModel.email == email).one_or_none()
    )

    if account is None:
        # debug log:
        logger.debug(f"Account with email address {email} does not exist")

        exception = MissingResourceException(
            f"Account with email address {email} not found"
        )

        exception.add_attributes(
            context=None,
            message=exception.message,
            path=("*", "email"),
            value=email,
        )

        raise exception

    return account


def get_account_by_token(
    session: Session,
    token: str,
    credentials_exception: AppHTTPException | None = None,
):
    if credentials_exception is None:
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

        token_data = schema.TokenData(account_id=account_id)  # type: ignore

    except JWTError as exc:
        # debug log:
        logger.debug(f"Failed to decode JWT token: {str(exc)}", exc_info=True)

        credentials_exception.add_attributes(
            context={"type": ErrorContextType.details},
            path=("*",),
            value=token,
            message="Token has either expired or is invalid",
        )

        raise credentials_exception

    try:
        account = get_account_by_id(session=session, id=token_data.account_id)  # type: ignore
    except MissingResourceException:
        # debug log:
        logger.debug(f"Account, {token_data.account_id}, no longer exists")

        credentials_exception.add_attributes(
            context={"type": ErrorContextType.details},
            path=("*",),
            value=token_data.account_id,
            message="User account no longer exists",
        )
        raise credentials_exception

    return account
