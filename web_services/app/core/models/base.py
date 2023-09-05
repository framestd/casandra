# Standard Library
from datetime import datetime
from uuid import UUID, uuid4

# Third Party
from sqlalchemy import DateTime

# from sqlalchemy import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, MappedAsDataclass, declared_attr
from sqlalchemy.orm import mapped_column

# First Party
from app.core.utils import get_utc_time


class Base(DeclarativeBase, MappedAsDataclass):
    @declared_attr  # type: ignore
    def __tablename__(cls) -> str:
        return cls.__name__

    id: Mapped[UUID] = mapped_column(
        name="id",
        init=False,
        primary_key=True,
        index=True,
        default_factory=uuid4,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        name="created_at",
        init=False,
        index=True,
        nullable=False,
        default=get_utc_time(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        name="updated_at",
        init=False,
        index=True,
        nullable=False,
        default=get_utc_time(),
        onupdate=get_utc_time,
    )

    deleted_at: Mapped[datetime] | None = mapped_column(
        DateTime(timezone=True),
        name="deleted_at",
        init=False,
        index=True,
        default=None,
    )
