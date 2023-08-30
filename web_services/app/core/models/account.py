# Standard Library
from datetime import datetime
from typing import TYPE_CHECKING

# Third Party
from sqlalchemy import DateTime, Index, String
from sqlalchemy.dialects.postgresql import CITEXT
from sqlalchemy.orm import Mapped, mapped_column, relationship

# First Party
from core.utils import get_utc_time

# Local Folder
from .base import Base


if TYPE_CHECKING:
    # Local Folder
    from .user import User


class Account(Base):
    """The user account: this will mostly just be used
    to store credentials and authentication data and other
    user account related stuff
    """

    __tablename__ = "account"

    email: Mapped[str] = mapped_column(CITEXT, name="email", nullable=False)
    password: Mapped[str] = mapped_column(String, name="password", nullable=False)

    active_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        name="active_at",
        default=get_utc_time(),
    )

    verified_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        name="verified_at",
        nullable=True,
        default=None,
    )

    user: Mapped["User"] = relationship(
        "User",
        # back_populates="account",
        cascade="all",
        default=None,
    )

    # partial index: useful for soft delete
    __table_args__ = (
        Index(
            "IDX_Account_email_UNIQUE",
            email,
            unique=True,
            postgresql_where=Base.deleted_at.is_(None),  # type: ignore
        ),
    )
