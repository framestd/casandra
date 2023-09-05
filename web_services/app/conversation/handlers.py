# Standard Library
from typing import Annotated, cast

# Third Party
from fastapi import Depends
from pydantic import UUID4
from sqlalchemy.orm import Session

# First Party
from app.core.deps import ServiceContext, get_db, get_service_context
from app.core.schemas.conversation import Conversation
from app.core.schemas.response import StandardResponse
from app.core.services.conversation import get_conversation_by_id
from app.core.specs.additional_responses import responses

# Local Folder
from .router import router


@router.get(
    "/{id}",
    response_model=StandardResponse[Conversation],
    responses={403: responses.get("o403"), 422: responses.get("o422")},
)
def read_conversation(
    id: UUID4,
    ctx: Annotated[ServiceContext, Depends(get_service_context)],
    db: Session = Depends(get_db),
) -> StandardResponse[Conversation]:
    conversation = get_conversation_by_id(session=db, ctx=ctx, id=id)

    response = StandardResponse[Conversation](data=cast(Conversation, conversation))

    return response
