# Standard Library
from typing import Any, Generic, TypedDict, TypeVar

# First Party
from core.exceptions.application import MissingResourceException
from core.exceptions.http import ConflictException, ServiceUnavailableException
from core.exceptions.http import UnauthorizedException, UnprocessableEntityException
from core.schemas.response import ErrorResponse

Model = TypeVar("Model", bound=type[ErrorResponse[Any]])


class OpenAPIResponseDetails(TypedDict, Generic[Model]):
    model: Model
    description: str


class OpenAPIResponses(TypedDict):
    o401: dict[str, Any]
    o404: dict[str, Any]
    o419: dict[str, Any]
    o422: dict[str, Any]
    o503: dict[str, Any]


responses = OpenAPIResponses(
    o401={
        "model": ErrorResponse[UnauthorizedException],
        "description": "No valid authorization provided",
    },
    o404={
        "model": ErrorResponse[MissingResourceException],
        "description": "Requested resource not found",
    },
    o419={
        "model": ErrorResponse[ConflictException],
        "description": "Conflicting request",
    },
    o422={
        "model": ErrorResponse[UnprocessableEntityException],
        "description": "Invalid data contained in request",
    },
    o503={
        "model": ErrorResponse[ServiceUnavailableException],
        "description": "Service Unavailable",
    },
)

# Model = TypeVar("Model", bound=type[ErrorResponse[Any]])


# class OpenAPIResponseDetails(TypedDict, Generic[Model]):
#     model: Model
#     description: str


# class OpenAPIResponses(TypedDict):
#     o401: OpenAPIResponseDetails[type[ErrorResponse[Any]]]
#     o404: OpenAPIResponseDetails[type[ErrorResponse[Any]]]
#     o419: OpenAPIResponseDetails[type[ErrorResponse[Any]]]
#     o422: OpenAPIResponseDetails[type[ErrorResponse[Any]]]
#     o503: OpenAPIResponseDetails[type[ErrorResponse[Any]]]


# responses = OpenAPIResponses(
#     o401=OpenAPIResponseDetails(
#         model=ErrorResponse[UnauthorizedException],
#         description="No valid authorization provided",
#     ),
#     o404=OpenAPIResponseDetails(
#         model=ErrorResponse[MissingResourceException],
#         description="Requested resource not found",
#     ),
#     o419=OpenAPIResponseDetails(
#         model=ErrorResponse[ConflictException],
#         description="Conflicting request",
#     ),
#     o422=OpenAPIResponseDetails(
#         model=ErrorResponse[UnprocessableEntityException],
#         description="Invalid data contained in request",
#     ),
#     o503=OpenAPIResponseDetails(
#         model=ErrorResponse[ServiceUnavailableException],
#         description="Service Unavailable",
#     ),
# )


# responses: OpenAPIResponses = {
#     o401: {
#         "model": ErrorResponse[UnauthorizedException],
#         "description": "No valid authorization provided",
#     },
# 404: {
#     "model": ErrorResponse[MissingResourceException],
#     "description": "Requested resource not found",
# },
# 422: {
#     "model": ErrorResponse[UnprocessableEntityException],
#     "description": "Invalid data contained in request",
# },
# 503: {
#     "model": ErrorResponse[ServiceUnavailableException],
#     "description": "Service Unavailable",
# }
# }
