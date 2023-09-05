# Standard Library
from typing import Any, Generic, TypedDict, TypeVar

# First Party
from app.core.exceptions.application import MissingResourceException
from app.core.exceptions.http import ConflictException, ForbiddenRequestException
from app.core.exceptions.http import ServiceUnavailableException, UnauthorizedException
from app.core.exceptions.http import UnprocessableEntityException
from app.core.schemas.response import ErrorResponse

Model = TypeVar("Model", bound=type[ErrorResponse[Any]])


class OpenAPIResponseDetails(TypedDict, Generic[Model]):
    model: Model
    description: str


class OpenAPIResponses(TypedDict):
    o401: dict[str, Any]
    o403: dict[str, Any]
    o404: dict[str, Any]
    o419: dict[str, Any]
    o422: dict[str, Any]
    o503: dict[str, Any]


responses = OpenAPIResponses(
    o401={
        "model": ErrorResponse[UnauthorizedException],
        "description": "No Valid Authorization Provided",
    },
    o403={
        "model": ErrorResponse[ForbiddenRequestException],
        "description": "Not Enough Access Right to Resource",
    },
    o404={
        "model": ErrorResponse[MissingResourceException],
        "description": "Requested Resource Not Found",
    },
    o419={
        "model": ErrorResponse[ConflictException],
        "description": "Conflicting Request",
    },
    o422={
        "model": ErrorResponse[UnprocessableEntityException],
        "description": "Invalid Data Contained in Request",
    },
    o503={
        "model": ErrorResponse[ServiceUnavailableException],
        "description": "Service Unavailable",
    },
)
