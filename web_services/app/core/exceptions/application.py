# Standard Library
from typing import Literal

# Third Party
from fastapi import status

# First Party
from app.core.exceptions.code import ErrorCode
from app.core.exceptions.http import AppHTTPException


class MissingResourceException(AppHTTPException):
    code: Literal[ErrorCode.MISSING_RESOURCE] = ErrorCode.MISSING_RESOURCE

    def __init__(self, message: str, *, headers: dict[str, str] | None = None):
        super().__init__(
            message,
            title='Missing Resource',
            status_code=status.HTTP_200_OK,
            code=ErrorCode.MISSING_RESOURCE,
            headers=headers,
        )


class ChallengeFailedException(AppHTTPException):
    code: Literal[ErrorCode.CHALLENGE_FAILED] = ErrorCode.CHALLENGE_FAILED

    def __init__(self, message: str, *, headers: dict[str, str] | None = None):
        super().__init__(
            message,
            title="Challenge Failed",
            status_code=status.HTTP_200_OK,
            code=ErrorCode.CHALLENGE_FAILED,
            headers=headers,
        )
