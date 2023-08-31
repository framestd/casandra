# Third Party
from pydantic import UUID4
from sqlalchemy.orm import Session

# First Party
from app.core.exceptions.application import MissingResourceException
from app.core.logging.logger import get_app_logger
from app.core.models.user import User as UserModel

logger = get_app_logger(__name__)


def get_user_by_id(session: Session, id: UUID4):
    """Find a user by ID

    :param session: the database session to use
    :param id: the unique user identifier to use to retrieve the user

    :raises MissingResourceException:
        if no user with the specified identifier or ID is found
    """

    user = session.query(UserModel).filter(UserModel.id == id).one_or_none()

    if not user:
        # info log:
        logger.info(f"User with id {id} does not exist")

        exception = MissingResourceException(f"User with ID **{id}** not found")

        exception.add_attributes(
            context=None,
            path=("*", "id"),
            value=id,
            message=exception.message,
        )

        raise exception

    return user


def get_user_by_username(session: Session, username: str):
    """Find a user by username

    :param session: the database session to use
    :param username: the unique username to use to retrieve the user

    :raises MissingResourceException:
        if no user that goes by a username is found
    """

    user = session.query(UserModel).filter(UserModel.username == username).one_or_none()

    if not user:
        # info log:
        logger.info(f"User with username {username} does not exist")

        exception = MissingResourceException(
            f"User with username **{username}** not found"
        )

        exception.add_attributes(
            context=None,
            path=("*", "username"),
            value=username,
            message=exception.message,
        )

        raise exception

    return user
