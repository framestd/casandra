# Standard Library
from typing import TYPE_CHECKING
from uuid import UUID

# Third Party
from sqlalchemy import ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import CITEXT
from sqlalchemy.orm import Mapped, mapped_column

# Local Folder
from .base import Base


if TYPE_CHECKING:
    # Local Folder
    # from .account import Account
    pass


class User(Base):
    """The account user: this will mostly just be used
    to store information about the user like name, age,
    address, etc.
    """

    __tablename__ = "user"

    first_name: Mapped[str] = mapped_column(String)
    last_name: Mapped[str] = mapped_column(String)
    username: Mapped[str] = mapped_column(CITEXT)

    account_id: Mapped[UUID] = mapped_column(
        ForeignKey("account.id", name="user_account_id_fkey"),
        init=False,
        unique=True,
    )

    # account: Mapped["Account"] = relationship("Account", back_populates="user", init=False)

    # partial index: useful for soft delete
    __table_args__ = (
        Index(
            "IDX_User_username_UNIQUE",
            username,
            unique=True,
            postgresql_where=Base.deleted_at.is_(None),  # type: ignore
        ),
    )
