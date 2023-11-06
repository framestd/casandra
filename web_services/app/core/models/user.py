# Standard Library
from typing import TYPE_CHECKING
from uuid import UUID

# Third Party
from sqlalchemy import ForeignKey, Index, and_
from sqlalchemy.dialects.postgresql import CITEXT
from sqlalchemy.orm import Mapped, mapped_column, relationship

# Local Folder
from .base import Base

if TYPE_CHECKING:
    # Local Folder
    from .account import AccountInDB
    from .conversation import ConversationInDB


class UserInDB(Base):
    """The account user: this will mostly just be used
    to store information about the user like name, age,
    address, etc.
    """

    first_name: Mapped[str] = mapped_column(nullable=False)
    last_name: Mapped[str] = mapped_column(nullable=False)
    username: Mapped[str | None] = mapped_column(CITEXT, nullable=True, default=None)

    account_id: Mapped[UUID] = mapped_column(
        ForeignKey("Account.id", name="User_account_id_fkey", ondelete="CASCADE"),
        init=False,
        unique=True,
        nullable=False,
    )

    account: Mapped["AccountInDB"] = relationship(back_populates="user", init=False)

    conversations: Mapped[list["ConversationInDB"]] = relationship(
        back_populates="started_by",
        cascade="delete, delete-orphan",
        init=False,
        lazy="selectin",
    )

    """Username is nullable for the purpose of third party OAuth 2.0 and OpenID connect users.
    They can pick a username later after account creation, moreover a username is not so
    essential to this application.

    Also enusres partial index: useful for soft delete, when it only uniquely indexes records that
    have their `deleted_at` field unset.
    """
    __table_args__ = (
        Index(
            "IDX_User_username_UNIQUE",
            username,
            unique=True,
            postgresql_where=and_(username.is_not(None), Base.deleted_at.is_(None)),  # type: ignore
        ),
    )
