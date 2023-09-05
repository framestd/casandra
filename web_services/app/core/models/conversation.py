# Standard Library
from typing import TYPE_CHECKING
from uuid import UUID

# Third Party
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

# Local Folder
from .base import Base
from .user import User

if TYPE_CHECKING:
    # Local Folder
    from .chat_message import ChatMessage


class Conversation(Base):
    """A conversation object to which all the messages in a
    particular chat are attached to"""

    subject: Mapped[str] = mapped_column(nullable=False)

    started_by_id: Mapped[UUID] = mapped_column(
        ForeignKey("User.id", name="Conversations_user_id_fkey", ondelete="CASCADE"),
        nullable=False,
    )

    started_by: Mapped["User"] = relationship(
        "User",
        back_populates="conversations",
        init=False,
        lazy="joined",
    )

    chat_messages: Mapped[list["ChatMessage"]] = relationship(
        "ChatMessage",
        back_populates="conversation",
        cascade="all, delete-orphan",
        lazy="selectin",
        single_parent=True,
    )
