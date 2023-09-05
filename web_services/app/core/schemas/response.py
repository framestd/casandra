# Standard Library
import re
from typing import Any, Generic, Tuple, Type, TypeVar

# Third Party
from pydantic import BaseModel, Field, computed_field

# First Party
from app.core.exceptions.code import ErrorCode
from app.core.exceptions.http import AppHTTPException

DataT = TypeVar("DataT")
ErrorT = TypeVar("ErrorT", bound=AppHTTPException)


class ResponseBase(BaseModel, Generic[DataT]):
    data: DataT

    @classmethod
    def model_parametrized_name(cls, params: Tuple[Type[Any], ...]) -> str:
        return f"{params[0].__name__}Response"

    @computed_field
    @property
    def typename(self) -> str:
        type_name = type(self).__name__

        return re.sub(r"(?:Response)$", "", type_name)


class StatusResponse(ResponseBase[DataT], Generic[DataT]):
    message: str = "Completed successfully 😁"
    success: bool = True


class StandardResponse(ResponseBase[DataT], Generic[DataT]):
    ...


class ErrorAttributes(BaseModel):
    context: dict[str, Any] | None
    path: tuple[str | int, ...]
    message: str
    value: Any


class ErrorSpec(BaseModel):
    code: ErrorCode
    errors: list[ErrorAttributes]


class ErrorResponse(StatusResponse[Any], Generic[ErrorT]):
    data: None = Field(default=None)
    success: bool = False
    message: str = "Oops, failed to complete request 😔"
    error: ErrorSpec
