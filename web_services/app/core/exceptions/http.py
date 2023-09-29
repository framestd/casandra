# Standard Library
from typing import Any, Literal, TypedDict, Unpack

# Third Party
from fastapi import HTTPException, status

# Local Folder
from .code import ErrorCode


class ErrorAttributesDict(TypedDict):
    context: dict[str, Any] | None
    path: tuple[str, ...]
    value: Any
    message: str


class AppHTTPException(HTTPException):
    title: str = "Unexpected Application Error"
    code: ErrorCode = ErrorCode.UNKNOWN

    def __init__(
        self,
        message: str,
        *,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        code: ErrorCode = code,
        title: str = title,
        headers: dict[str, str] | None = None,
    ):
        super().__init__(
            status_code=status_code,
            detail=message,
            headers=headers,
        )

        self.title = title
        self.message = message
        self.code = code
        self.errors: list[ErrorAttributesDict] = []

    def __str__(self) -> str:
        return self.message

    def add_attributes(self, **kwargs: Unpack[ErrorAttributesDict]):
        self.errors.append(kwargs)
        return self


class BadRequestException(AppHTTPException):
    title: str = "Invalid Request"
    code: Literal[ErrorCode.INVALID_REQUEST] = ErrorCode.INVALID_REQUEST

    def __init__(self, message: str, *, headers: dict[str, str] | None = None):
        super().__init__(
            message,
            title=BadRequestException.title,
            status_code=status.HTTP_400_BAD_REQUEST,
            code=BadRequestException.code,
            headers=headers,
        )


class UnauthorizedException(AppHTTPException):
    title: str = "Authorization Error"
    code: Literal[ErrorCode.UNAUTHORIZED] = ErrorCode.UNAUTHORIZED

    def __init__(self, message: str, *, headers: dict[str, str] | None = None):
        super().__init__(
            message,
            title=UnauthorizedException.title,
            status_code=status.HTTP_401_UNAUTHORIZED,
            code=UnauthorizedException.code,
            headers=headers,
        )


class ForbiddenRequestException(AppHTTPException):
    title: str = "Forbidden Request"
    code: Literal[ErrorCode.FORBIDDEN_REQUEST] = ErrorCode.FORBIDDEN_REQUEST

    def __init__(self, message: str, *, headers: dict[str, str] | None = None):
        super().__init__(
            message,
            title=ForbiddenRequestException.title,
            status_code=status.HTTP_403_FORBIDDEN,
            code=ForbiddenRequestException.code,
            headers=headers,
        )


class ConflictException(AppHTTPException):
    title: str = "Conflicting Request"
    code: Literal[ErrorCode.CONFLICT] = ErrorCode.CONFLICT

    def __init__(self, message: str, *, headers: dict[str, str] | None = None):
        super().__init__(
            message,
            title=ConflictException.title,
            status_code=status.HTTP_409_CONFLICT,
            code=ConflictException.code,
            headers=headers,
        )


class UnprocessableEntityException(AppHTTPException):
    title: str = "Unprocessable Request"
    code: Literal[ErrorCode.UNPROCESSABLE_ENTITY] = ErrorCode.UNPROCESSABLE_ENTITY

    def __init__(self, message: str, *, headers: dict[str, str] | None = None):
        super().__init__(
            message,
            title=UnprocessableEntityException.title,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            code=UnprocessableEntityException.code,
            headers=headers,
        )


class ServiceUnavailableException(AppHTTPException):
    title: str = "Service Unavailable"
    code: Literal[ErrorCode.SERVICE_UNAVAILABLE] = ErrorCode.SERVICE_UNAVAILABLE

    def __init__(self, message: str, *, headers: dict[str, str] | None = None):
        super().__init__(
            message,
            title=ServiceUnavailableException.title,
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            code=ServiceUnavailableException.code,
            headers=headers,
        )
