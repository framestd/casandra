# Standard Library
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any, Callable, Iterator, TypeVar
from uuid import UUID

# Third Party
from pydantic import ValidationError

# First Party
from app.core.authentication.token import prefix_sub

if TYPE_CHECKING:
    # First Party
    from app.core.schemas.base import BaseModel

ModelT = TypeVar("ModelT", bound="BaseModel")

iso_format_date: Callable[[datetime], str] = lambda x: x.strftime("%Y-%m-%dT%H:%M:%S.%fZ")


def get_utc_time():
    """Get the current UTC time with timezone information"""
    return datetime.now(tz=timezone.utc)


def is_recursion_validation_error(exc: ValidationError) -> bool:
    errors = exc.errors()
    return len(errors) == 1 and errors[0]["type"] == "recursion_loop"


@contextmanager
def suppress_recursion_validation_error() -> Iterator[None]:
    try:
        yield
    except ValidationError as exc:
        if not is_recursion_validation_error(exc):
            raise exc


def tok_payload(
    sub: UUID,
    *,
    iss: Any | None = None,
    aud: Any | None = None,
    **extras: Any,
) -> dict[str, Any]:
    payload = {"sub": prefix_sub(sub.hex)}

    if iss is not None:
        payload.update({"iss": iss})
    if aud is not None:
        payload.update({"aud": aud})

    for key, value in extras.items():
        if value is not None:
            payload.update({key: value})

    return payload


def describe_field(model: type[ModelT], example: str = "(e.g, id:asc)") -> str:
    columns = model.__fields__.keys()
    return (", ".join(columns) + " " + example).strip()


def split_field(sort: str, delimiter: str = ","):
    return list(filter(lambda v: bool(v), sort.split(delimiter)))
