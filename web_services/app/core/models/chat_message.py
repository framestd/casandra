# Standard Library
import enum
from typing import TYPE_CHECKING
from uuid import UUID

# Third Party
from sqlalchemy import Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

# Local Folder
from .base import Base

if TYPE_CHECKING:
    # Local Folder
    from .conversation import Conversation


class ChatMessageRoleEnum(str, enum.Enum):
    human = "human"
    robot = "robot"


class ChatMessage(Base):
    """Chat messages belonging to a single conversation"""

    body: Mapped[str] = mapped_column(nullable=False)
    role: Mapped[ChatMessageRoleEnum] = mapped_column(Enum(ChatMessageRoleEnum), nullable=False)

    response_to_id: Mapped[UUID | None] = mapped_column(
        ForeignKey(
            "ChatMessage.id",
            name="ChatMessage_response_to_id_fkey",
            ondelete="CASACDE",
        ),
        unique=True,
    )

    response_from_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("ChatMessage.id", name="ChatMessage_response_from_id_fkey"),
        unique=True,
    )

    conversation_id: Mapped[UUID] = mapped_column(
        ForeignKey(
            "Conversation.id",
            name="ChatMessages_conversation_id_fkey",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    conversation: Mapped["Conversation"] = relationship(
        "Conversation",
        back_populates="chat_messages",
        init=False,
        lazy="joined",
        # Make more efficient using an innerjoin since references cannot be null, as specified in
        # the foreign key above, for a many-to-one.
        # https://docs.sqlalchemy.org/en/20/orm/queryguide/relationships.html#joined-eager-loading
        innerjoin=True,
    )

    _dangling: Mapped[bool] = mapped_column(nullable=False, default=False)
