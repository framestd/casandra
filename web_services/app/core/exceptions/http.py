# Standard Library
from typing import Any, Literal, TypedDict, Unpack

# Third Party
from fastapi import HTTPException, status

# First Party
from app.core.utils import create_error

# Local Folder
from .code import ErrorCode


class ErrorAttributesDict(TypedDict):
    context: dict[str, Any] | None
    path: tuple[str, ...]
    value: Any
    message: str


class AppHTTPException(HTTPException):
    def __init__(
        self,
        message: str,
        status_code: int,
        *,
        code: ErrorCode,
        headers: dict[str, str] | None = None,
    ):
        super().__init__(
            status_code=status_code,
            detail=create_error(message=message),
            headers=headers,
        )

        self.message = message
        self.code = code
        self.errors: list[ErrorAttributesDict] = []

    def add_attributes(self, **kwargs: Unpack[ErrorAttributesDict]):
        self.errors.append(kwargs)
        return self


class BadRequestException(AppHTTPException):
    code: Literal[ErrorCode.INVALID_REQUEST] = ErrorCode.INVALID_REQUEST

    def __init__(self, message: str, *, headers: dict[str, str] | None = None):
        super().__init__(
            message,
            status_code=status.HTTP_400_BAD_REQUEST,
            code=ErrorCode.INVALID_REQUEST,
            headers=headers,
        )


class UnauthorizedException(AppHTTPException):
    code: Literal[ErrorCode.UNAUTHORIZED] = ErrorCode.UNAUTHORIZED

    def __init__(self, message: str, *, headers: dict[str, str] | None = None):
        super().__init__(
            message,
            status_code=status.HTTP_401_UNAUTHORIZED,
            code=ErrorCode.UNAUTHORIZED,
            headers=headers,
        )


class ForbiddenRequestException(AppHTTPException):
    code: Literal[ErrorCode.FORBIDDEN_REQUEST] = ErrorCode.FORBIDDEN_REQUEST

    def __init__(self, message: str, *, headers: dict[str, str] | None = None):
        super().__init__(
            message,
            status_code=status.HTTP_403_FORBIDDEN,
            code=ErrorCode.FORBIDDEN_REQUEST,
            headers=headers,
        )


class ConflictException(AppHTTPException):
    code: Literal[ErrorCode.CONFLICT] = ErrorCode.CONFLICT

    def __init__(self, message: str, *, headers: dict[str, str] | None = None):
        super().__init__(
            message,
            status_code=status.HTTP_409_CONFLICT,
            code=ErrorCode.CONFLICT,
            headers=headers,
        )


class UnprocessableEntityException(AppHTTPException):
    code: Literal[ErrorCode.UNPROCESSABLE_ENTITY] = ErrorCode.UNPROCESSABLE_ENTITY

    def __init__(self, message: str, *, headers: dict[str, str] | None = None):
        super().__init__(
            message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            code=ErrorCode.UNPROCESSABLE_ENTITY,
            headers=headers,
        )


class ServiceUnavailableException(AppHTTPException):
    code: Literal[ErrorCode.SERVICE_UNAVAILABLE] = ErrorCode.SERVICE_UNAVAILABLE

    def __init__(self, message: str, *, headers: dict[str, str] | None = None):
        super().__init__(
            message,
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            code=ErrorCode.SERVICE_UNAVAILABLE,
            headers=headers,
        )
