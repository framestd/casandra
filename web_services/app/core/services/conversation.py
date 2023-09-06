# Standard Library
from uuid import UUID

# Third Party
from sqlalchemy.orm import Session

# First Party
from app.core.deps import ServiceContext
from app.core.exceptions.application import MissingResourceException
from app.core.exceptions.http import ForbiddenRequestException
from app.core.models.conversation import Conversation as ConversationModel
from app.core.schemas import conversation as schema


def create_conversation_service(
    session: Session,
    conversation_create: schema.ConversationCreate,
):
    subject = conversation_create.subject
    user_id = conversation_create.started_by_id

    conversation = ConversationModel(
        subject=subject,
        started_by_id=user_id,
        chat_messages=[],
    )

    session.add(conversation)
    session.commit()
    session.refresh(conversation)

    return conversation


def get_conversation_by_id(session: Session, ctx: ServiceContext, id: UUID):
    converstation = (
        session.query(ConversationModel)
        .filter(ConversationModel.id == id)
        .one_or_none()
    )

    if converstation is None:
        exception = MissingResourceException("Conversation not found!")
        exception.add_attributes(
            context=None,
            path=("*", "id"),
            value=id,
            message=exception.message,
        )
        raise exception

    # TODO: revise when the feature to share conversations have been implemented
    if converstation.started_by.id != ctx.user.id:
        raise ForbiddenRequestException("You are not allowed to read this conversation")

    return converstation
