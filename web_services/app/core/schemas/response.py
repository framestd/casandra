# Standard Library
import re
from typing import Any, Generic, Tuple, Type, TypeVar

# Third Party
from pydantic import computed_field

# First Party
from app.core.exceptions.code import ErrorCode
from app.core.exceptions.http import AppHTTPException
from app.core.schemas.pagination import PageInfo

# Local Folder
from .base import BaseModel

DataT = TypeVar("DataT")
ErrorT = TypeVar("ErrorT", bound=AppHTTPException)


class ResponseBase(BaseModel):
    @classmethod
    def model_parametrized_name(cls, params: Tuple[Type[Any], ...]) -> str:
        return f"{params[0].__name__}Response"

    @computed_field
    @property
    def typename(self) -> str:
        type_name = type(self).__name__

        return re.sub(r"(?:Response)$", "", type_name)


class ResponseMetadata(BaseModel):
    total_objects: int
    page_info: PageInfo


class DataResponseBase(ResponseBase, Generic[DataT]):
    data: DataT


class StatusResponseBase(ResponseBase):
    message: str = "Completed successfully 😁"
    success: bool = True


class StatusResponse(DataResponseBase[DataT], StatusResponseBase):
    ...


class StandardResponse(DataResponseBase[DataT]):
    ...


class StandardPaginatedResponse(StandardResponse[list[DataT]]):
    metadata: ResponseMetadata


class ErrorAttributes(BaseModel):
    context: dict[str, Any] | None
    path: tuple[str | int, ...]
    message: str
    value: Any


class ErrorResponse(StatusResponseBase, Generic[ErrorT]):
    title: str
    message: str = "Oops, failed to complete request 😔"
    code: ErrorCode
    success: bool = False
    errors: list[ErrorAttributes]
