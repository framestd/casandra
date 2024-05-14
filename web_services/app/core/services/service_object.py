# Standard Library
from dataclasses import dataclass, field
from typing import Generic, TypeVar

# First Party
from app.core.models.base import Base

ObjectT = TypeVar("ObjectT", bound=Base)


@dataclass(kw_only=True)
class ServiceObject(Generic[ObjectT]):
    """A data class for representing service objects or results of calling a
    service function.

    Oft-times, it's not just enough to return the retrieved, modeled, data as
    is from the database or from whatever other sources, transformations, etc.
    There's, sometimes, the need to return extra information with the basic
    object returned by a service function.

    This dataclass will serve as a conduit for any other information asides
    the basic object, and together with it is coined the "ServiceObject[T]"

    Note: This is not a Pydantic model
    """

    obj: ObjectT = field(kw_only=False)


@dataclass(kw_only=True)
class PagedServiceObject(Generic[ObjectT]):
    """A data class for representing ServiceObjects with paged objects"""

    edges: list[ObjectT] = field(kw_only=False)
    cursors: tuple[str | None, str | None]
    page_size: int
    total_pages: int
    has_prev: bool = False
    has_next: bool = False
