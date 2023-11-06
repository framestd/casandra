# Standard Library
import enum
from uuid import UUID

# Third Party
from sqlalchemy import Enum as SA_Enum
from sqlalchemy import ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column

# First Party
from app.core.models.base import Base

__all__ = (
    "ConnectedServicesProviderEnum",
    "ConnectedServicesInDB",
)


class ConnectedServicesProviderEnum(str, enum.Enum):
    google = "google"
    dropbox = "dropbox"
    box = "box"


class ConnectedServicesInDB(Base):
    """The services and third-party APIs connected to a user's account"""

    label: Mapped[str] = mapped_column(nullable=False)

    provider: Mapped[ConnectedServicesProviderEnum] = mapped_column(
        SA_Enum(ConnectedServicesProviderEnum),
        nullable=False,
    )

    scopes: Mapped[str] = mapped_column(nullable=True)

    access_token: Mapped[str] = mapped_column(nullable=False)
    refresh_token: Mapped[str] = mapped_column(nullable=False)

    provider_account_id: Mapped[str] = mapped_column(nullable=False)

    account_id: Mapped[UUID] = mapped_column(
        ForeignKey("Account.id", name="ConnectedServices_account_id_fkey", ondelete="CASCADE"),
        nullable=False,
    )

    """Index ConnectedServicesInDB.provider and ConnectedServicesInDB.provider_account_id to be
    mutually unique, and ConnectedServicesInDB.provider and ConnectedServicesInDB.label also"""
    __table_args__ = (
        Index(
            "IDX_ConnectedServices_provider_provider_account_id_UNIQUE",
            provider,
            provider_account_id,
            unique=True,
            postgresql_where=Base.deleted_at.is_(None),  # type: ignore
        ),
        Index(
            "IDX_ConnectedServices_provider_label_UNIQUE",
            provider,
            label,
            unique=True,
            postgresql_where=Base.deleted_at.is_(None),  # type: ignore
        ),
    )
