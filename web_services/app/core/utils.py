# Standard Library
from contextlib import contextmanager
from datetime import datetime
from typing import Any, Iterator
from uuid import UUID

# Third Party
import pytz
from pydantic import ValidationError

# First Party
from app.core.authentication.token import prefix_sub


def get_utc_time():
    """Get the current UTC time with timezone information"""
    return datetime.now(tz=pytz.utc)


def create_error(message: str):
    return {"message": message}


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


def tok_payload(account_id: UUID) -> dict[str, Any]:
    return {"sub": prefix_sub(account_id.hex)}
