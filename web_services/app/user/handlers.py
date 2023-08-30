# Third Party
from fastapi import Depends
from pydantic import UUID4
from sqlalchemy.orm import Session

# First Party
from core.deps import get_db
from core.schemas.response import StandardResponse
from core.schemas.user import User
from core.services.user import get_user_by_id, get_user_by_username
from core.specs.additional_responses import responses

# Local Folder
from .router import router


@router.get(
    "/by_username",
    response_model=StandardResponse[User],
    response_model_exclude_none=True,
    responses={422: responses.get("o422")},
)
def find_user_by_username(username: str, db: Session = Depends(get_db)):
    user = get_user_by_username(session=db, username=username)
    response = StandardResponse[User](data=user)  # type: ignore

    return response


@router.get(
    "/{id}",
    response_model=StandardResponse[User],
    response_model_exclude_none=True,
    responses={422: responses.get("o422")},
)
def find_user_by_id(id: UUID4, db: Session = Depends(get_db)):
    user = get_user_by_id(session=db, id=id)
    response = StandardResponse[User](data=user)  # type: ignore

    return response
