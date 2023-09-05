# Standard Library
from typing import TYPE_CHECKING
from uuid import UUID

# Third Party
from sqlalchemy import ForeignKey, Index
from sqlalchemy.dialects.postgresql import CITEXT
from sqlalchemy.orm import Mapped, mapped_column, relationship

# Local Folder
from .base import Base

if TYPE_CHECKING:
    # Local Folder
    from .account import Account
    from .conversation import Conversation


class User(Base):
    """The account user: this will mostly just be used
    to store information about the user like name, age,
    address, etc.
    """

    first_name: Mapped[str] = mapped_column(nullable=False)
    last_name: Mapped[str] = mapped_column(nullable=False)
    username: Mapped[str] = mapped_column(CITEXT, nullable=False)

    account_id: Mapped[UUID] = mapped_column(
        ForeignKey("Account.id", name="User_account_id_fkey", ondelete="CASCADE"),
        init=False,
        unique=True,
        nullable=False,
    )

    account: Mapped["Account"] = relationship(
        "Account", back_populates="user", init=False
    )

    conversations: Mapped[list["Conversation"]] = relationship(
        "Conversation",
        back_populates="started_by",
        cascade="delete, delete-orphan",
        init=False,
        lazy="selectin",
    )

    # partial index: useful for soft delete
    __table_args__ = (
        Index(
            "IDX_User_username_UNIQUE",
            username,
            unique=True,
            postgresql_where=Base.deleted_at.is_(None),  # type: ignore
        ),
    )
