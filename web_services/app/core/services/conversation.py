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
from app.core.schemas.conversation import ConversationFilter, ConversationFilterExtra
from app.core.schemas.pagination import PageOptions
from app.core.services.pagination import PageBuilder

# Local Folder
from .service_object import PagedServiceObject


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
        session.query(ConversationModel).filter(ConversationModel.id == id).one_or_none()
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


def get_conversations(
    *,
    session: Session,
    ctx: ServiceContext,
    filter: ConversationFilter,
    page: PageOptions,
    sorts: list[str]
):
    pagebuilder = PageBuilder[ConversationModel, ConversationFilterExtra]()

    after = page.page_cursor if page.page_forward else None
    before = page.page_cursor if not page.page_forward else None

    filter_extra = ConversationFilterExtra(
        started_by_id=ctx.user.id,
        **filter.model_dump(exclude_defaults=True),
    )

    pages = (
        pagebuilder.setup(session, ConversationModel)
        .go_to_edge_after(after)
        .go_to_edge_before(before)
        .skim_through(filter_extra)
        .sort(sorts)
        .build()
    )

    result = PagedServiceObject(
        pages.read(page.page_size),
        cursors=pages.cursors(),
        page_size=pages.read_size,
        total_pages=pages.total_size,
        has_next=pages.has_next(),
        has_prev=pages.has_previous(),
    )

    return result
