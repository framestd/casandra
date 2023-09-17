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
from app.core.schemas.conversation import ConversationUpdate
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


def update_conversation_service(
    session: Session,
    ctx: ServiceContext,
    id: UUID,
    conversation_update: ConversationUpdate,
):
    """Update a conversation by a given ID

    :param session: the database session to use to get the conversation

    :param ctx: the service context necessary for running the service

    :param id: the id of the conversation to be fetched

    :param conversation_update: the object containing changes to be made

    :raises MissingResourceException:
        if no conversation with the specified ID is not found

    :raises ForbiddenRequestException:
        if there are not enough access rights to the conversation
    """

    conversation = get_conversation_by_id(session=session, ctx=ctx, id=id)
    update_dict = conversation_update.model_dump(exclude_defaults=True)

    # Still have this check here, even after the check in `get_conversation_by_id`,
    # for future sake, when shared conversations can be read, but not written
    if conversation.started_by.id != ctx.user.id:
        raise ForbiddenRequestException("You are not allowed write access to this conversation")

    for field, value in update_dict.items():
        setattr(conversation, field, value)

    # no need to `session.add` object should still be in the session
    session.commit()
    session.refresh(conversation)
    return conversation


def get_conversation_by_id(session: Session, ctx: ServiceContext, id: UUID):
    """Get a conversation by ID

    :param session: the database session to use to get the conversation

    :param ctx: the service context necessary for running the service

    :param id: the id of the conversation to be fetched

    :raises MissingResourceException:
        if no conversation with the specified ID is not found

    :raises ForbiddenRequestException:
        if there are not enough access rights to the conversation
    """

    conversation = session.query(ConversationModel).filter(ConversationModel.id == id).one_or_none()

    if conversation is None:
        exception = MissingResourceException("Conversation not found!")
        exception.add_attributes(
            context=None,
            path=("*", "id"),
            value=id,
            message=exception.message,
        )
        raise exception

    # TODO: revise when the feature to share conversations have been implemented
    if conversation.started_by.id != ctx.user.id:
        raise ForbiddenRequestException("You are not allowed read access to this conversation")

    return conversation


def get_conversations(
    *,
    session: Session,
    ctx: ServiceContext,
    filter: ConversationFilter,
    page_opts: PageOptions,
    sorts: list[str]
):
    pagebuilder = PageBuilder[ConversationModel, ConversationFilterExtra]()

    after = page_opts.page_cursor if page_opts.page_forward else None
    before = page_opts.page_cursor if not page_opts.page_forward else None

    filter_extra = ConversationFilterExtra(
        started_by_id=ctx.user.id,
        **filter.model_dump(exclude_defaults=True),
    )

    page = (
        pagebuilder.setup(session, ConversationModel)
        .go_to_edge_after(after)
        .go_to_edge_before(before)
        .skim_through(filter_extra)
        .sort(sorts)
        .build()
    )

    result = PagedServiceObject(
        page.read(page_opts.page_size),
        cursors=page.cursors(),
        page_size=page.read_size,
        total_pages=page.total_size,
        has_next=page.has_next(),
        has_prev=page.has_previous(),
    )

    return result
