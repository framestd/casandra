# Standard Library
import enum
from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

# Third Party
from sqlalchemy import DateTime
from sqlalchemy import Enum as SA_Enum
from sqlalchemy import ForeignKey, Index, and_
from sqlalchemy.dialects.postgresql import CITEXT
from sqlalchemy.orm import Mapped, mapped_column, relationship

# First Party
from app.core.utils import get_utc_time

# Local Folder
from .base import Base

if TYPE_CHECKING:
    # Local Folder
    from .connected_services import ConnectedServicesInDB
    from .user import UserInDB

__all__ = ("AccountProviderEnum", "AccountInDB", "AccountPasswordInDB", "AccountMetaInDB")


class AccountProviderEnum(str, enum.Enum):
    google = "google"
    apple = "apple"
    self = "self"


class AccountInDB(Base):
    """The user account: this will mostly just be used
    to store credentials and authentication data and other
    user account related stuff
    """

    email: Mapped[str] = mapped_column(CITEXT, nullable=False)

    user: Mapped["UserInDB"] = relationship(
        back_populates="account",
        cascade="all, delete-orphan",
    )

    connected_services: Mapped[list["ConnectedServicesInDB"]] = relationship(
        cascade="all, delete-orphan",
        init=False,
    )

    meta: Mapped["AccountMetaInDB"] = relationship(cascade="all, delete-orphan")
    password: Mapped["AccountPasswordInDB | None"] = relationship(cascade="all, delete-orphan")

    active_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        name="active_at",
        default_factory=get_utc_time,
        nullable=False,
    )

    verified_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        name="verified_at",
        nullable=True,
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


class AccountPasswordInDB(Base):
    account_id: Mapped[UUID] = mapped_column(
        ForeignKey("Account.id", name="AccountPassword_account_id_fkey", ondelete="CASCADE"),
        init=False,
        unique=True,
        nullable=False,
    )

    hashed: Mapped[str] = mapped_column(nullable=False)


class AccountMetaInDB(Base):
    provider: Mapped[AccountProviderEnum] = mapped_column(
        SA_Enum(AccountProviderEnum),
        nullable=False,
        default=AccountProviderEnum.self,
    )

    scopes: Mapped[str | None] = mapped_column(nullable=True, default=None)

    provider_account_id: Mapped[str | None] = mapped_column(nullable=True, default=None)

    account_id: Mapped[UUID] = mapped_column(
        ForeignKey("Account.id", name="AccountMeta_account_id_fkey", ondelete="CASCADE"),
        init=False,
        unique=True,
        nullable=False,
    )

    """Index AccountMetaInDB.provider and AccountMetaInDB.provider_account_id to be mutually unique"""
    __table_args__ = (
        Index(
            "IDX_AccountMeta_provider_provider_account_id_UNIQUE",
            provider,
            provider_account_id,
            unique=True,
            postgresql_where=and_(
                provider != AccountProviderEnum.self,
                Base.deleted_at.is_(None),  # type: ignore
            ),
        ),
    )
