# Standard Library
import enum
from typing import TYPE_CHECKING, Any, cast
from uuid import UUID

# Third Party
from sqlalchemy import Column, Enum, ForeignKey, Table
from sqlalchemy.orm import Mapped, mapped_column, relationship

# Local Folder
from .base import Base

if TYPE_CHECKING:
    # Local Folder
    from .conversation import ConversationInDB

QuotedMessagesToQuotingMessagesAssocTable = Table(
    "QuotedMessagesToQuotingMessagesAssocTable",
    Base.metadata,
    Column(  # type: ignore
        "quoting_id",
        ForeignKey(
            "ConversationMessage.id",
            name="ConversationMessage_quoting_id_fkey",
        ),
        primary_key=True,
    ),
    Column(  # type: ignore
        "quoted_id",
        ForeignKey(
            "ConversationMessage.id",
            name="ConversationMessage_quoted_id_fkey",
        ),
        primary_key=True,
    ),
)

quoting_id_column = QuotedMessagesToQuotingMessagesAssocTable.columns.get("quoting_id")
quoted_id_column = QuotedMessagesToQuotingMessagesAssocTable.columns.get("quoted_id")


class ConversationMessageRoleEnum(str, enum.Enum):
    human = "human"
    robot = "robot"


class ConversationMessageInDB(Base):
    """Conversation messages belonging to a single conversation"""

    body: Mapped[str] = mapped_column(nullable=False)
    role: Mapped[ConversationMessageRoleEnum] = mapped_column(
        Enum(ConversationMessageRoleEnum), nullable=False
    )

    response_to_id: Mapped[UUID | None] = mapped_column(
        ForeignKey(
            "ConversationMessage.id",
            name="ConversationMessage_response_to_id_fkey",
            ondelete="CASCADE",
        ),
        unique=True,
    )

    response_from_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("ConversationMessage.id", name="ConversationMessage_response_from_id_fkey"),
        unique=True,
    )

    conversation_id: Mapped[UUID] = mapped_column(
        ForeignKey(
            "Conversation.id",
            name="ConversationMessages_conversation_id_fkey",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    conversation: Mapped["ConversationInDB"] = relationship(
        back_populates="messages",
        init=False,
        lazy="joined",
        # Make more efficient using an innerjoin since references cannot be null, as specified in
        # the foreign key above, for a many-to-one.
        # https://docs.sqlalchemy.org/en/20/orm/queryguide/relationships.html#joined-eager-loading
        innerjoin=True,
    )

    # Messages that quoted this message
    quoting_messages: Mapped[list["ConversationMessageInDB"]] = relationship(
        secondary=QuotedMessagesToQuotingMessagesAssocTable,
        foreign_keys=[cast(Column[Any], quoting_id_column)],
        back_populates="quoted_messages",
        lazy="noload",
        init=False,
    )
    """Not loaded: have to manually load in execution options"""

    # Messages that this message qouted
    quoted_messages: Mapped[list["ConversationMessageInDB"]] = relationship(
        secondary=QuotedMessagesToQuotingMessagesAssocTable,
        foreign_keys=[cast(Column[Any], quoted_id_column)],
        back_populates="quoting_messages",
        lazy="noload",
        init=False,
    )
    """Not loaded: have to manually load in execution options"""

    context_length: Mapped[int] = mapped_column(nullable=False, default=0)
