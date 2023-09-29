# Standard Library
from typing import Annotated, cast

# Third Party
from fastapi import Depends
from pydantic import UUID4
from sqlalchemy.orm import Session

# First Party
from app.core.deps import get_db
from app.core.schemas.response import StandardResponse
from app.core.schemas.user import UserOut
from app.core.services.user import get_user_by_id, get_user_by_username
from app.core.specs.additional_responses import responses

# Local Folder
from .router import router


@router.get(
    "/by_username",
    response_model=StandardResponse[UserOut],
    response_model_exclude_none=True,
    responses={422: responses.get("o422")},
)
def find_user_by_username(username: str, db: Annotated[Session, Depends(get_db)]):
    user = get_user_by_username(session=db, username=username)
    response = StandardResponse[UserOut](data=cast(UserOut, user))

    return response


@router.get(
    "/{id}",
    response_model=StandardResponse[UserOut],
    response_model_exclude_none=True,
    responses={422: responses.get("o422")},
)
def find_user_by_id(id: UUID4, db: Annotated[Session, Depends(get_db)]):
    user = get_user_by_id(session=db, id=id)
    response = StandardResponse[UserOut](data=cast(UserOut, user))

    return response
