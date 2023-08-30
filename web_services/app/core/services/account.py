# Third Party
from jose import JWTError
from pydantic import UUID4, EmailStr
from sqlalchemy.orm import Session

# First Party
from core.authentication.password import Password
from core.authentication.token import JWTRS256Token, split_prefix_from_sub
from core.exceptions.application import CredentialsException, MissingResourceException
from core.exceptions.http import ConflictException, UnauthorizedException
from core.logging.logger import get_app_logger
from core.models.account import Account as AccountModel
from core.models.user import User as UserModel
from core.schemas import account as schema

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

    hashed_password = Password(credentials.password).get_hash()

    user = UserModel(**credentials.user.model_dump())
    account = AccountModel(
        email=credentials.email,
        password=hashed_password,
        user=user,
    )

    existing_account: AccountModel | None = None
    existing_user: UserModel | None = None

    try:
        existing_account = get_account_by_email(
            session,
            email=credentials.email,
        )

        existing_user = get_user_by_username(
            session,
            username=credentials.user.username,
        )
    except MissingResourceException:
        pass

    if not existing_account is None or not existing_user is None:
        exception = ConflictException("Some of the details provied are already in use")

        if not existing_account is None:
            logger.debug(f'Email address "{credentials.email}" is already taken')

            exception.add_attributes(
                context=None,
                message="Email address already in use",
                path=("body", "email"),
                value=credentials.email,
            )

        if not existing_user is None:
            logger.debug(f'Username "{credentials.user.username}" is already taken')

            exception.add_attributes(
                context=None,
                message="Username is already taken",
                path=("body", "user", "username"),
                value=credentials.user.username,
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

    account = get_account_by_email(session, email=identifier)
    password_object = Password(plain_password=password)

    if not password_object.compare(hashed_password=account.password):
        # debug log
        logger.debug(
            f"Access to account with email {identifier} was tried with a wrong password"
        )

        exception = CredentialsException("Incorrect password")

        exception.add_attributes(
            context=None,
            path=("body", "password"),
            value="",
            message=exception.message,
        )

        raise exception

    return account


def reauthenticate_user_account_service(session: Session, refresh_token: str):
    """Reauthenticate a user using a previously provisioned token

    :param session: the database session to use to create a new account

    :param token: the previously provisioned token pairs

    :raises UnauthorizedException:
        when a user account corresponding to the claims in the refresh token couldn't be found
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
        raise credentials_exception

    try:
        account = get_account_by_id(session, id=token_data.account_id)  # type: ignore
    except MissingResourceException:
        raise credentials_exception

    return account


def get_account_by_id(session: Session, id: UUID4):
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
            path=("*", "id"),
            value=id,
            message=exception.message,
        )

        raise exception

    return account


def get_account_by_email(session: Session, email: EmailStr):
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
            f"Account with email address **{email}** not found"
        )

        exception.add_attributes(
            context=None,
            path=("*", "email"),
            value=email,
            message=exception.message,
        )

        raise exception

    return account
