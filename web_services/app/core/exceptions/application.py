# Standard Library
from typing import Literal

# Third Party
from fastapi import status

# First Party
from core.exceptions.code import ErrorCode
from core.exceptions.http import AppHTTPException


class MissingResourceException(AppHTTPException):
    code: Literal[ErrorCode.INVALID_CREDENTIALS] = ErrorCode.INVALID_CREDENTIALS

    def __init__(self, message: str, *, headers: dict[str, str] | None = None):
        super().__init__(
            message,
            status_code=status.HTTP_200_OK,
            code=ErrorCode.MISSING_RESOURCE,
            headers=headers,
        )


class CredentialsException(AppHTTPException):
    code: Literal[ErrorCode.INVALID_CREDENTIALS] = ErrorCode.INVALID_CREDENTIALS

    def __init__(self, message: str, *, headers: dict[str, str] | None = None):
        super().__init__(
            message,
            status_code=status.HTTP_200_OK,
            code=ErrorCode.INVALID_CREDENTIALS,
            headers=headers,
        )
