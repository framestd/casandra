# Standard Library
from datetime import datetime
from enum import Enum
from typing import Generic, Literal, TypeVar

# Third Party
from pydantic import Field

# First Party
from app.core.utils import get_utc_time

# Local Folder
from .base import BaseModel

DataT = TypeVar("DataT")


class StreamTypeEnum(str, Enum):
    signal = "signal"
    data = "data"
    status = "status"
    message = "message"


class StreamSignalEnum(str, Enum):
    begin = "begin"
    end = "end"


class Stream(BaseModel):
    type: StreamTypeEnum
    channel: str
    message: str | None = None
    timestamp: datetime = Field(default_factory=get_utc_time)


class MessageStream(Stream):
    type: Literal[StreamTypeEnum.message] = StreamTypeEnum.message
    message: str


class SignalStream(Stream):
    type: Literal[StreamTypeEnum.signal] = StreamTypeEnum.signal
    signal: StreamSignalEnum


class StatusStream(Stream):
    type: Literal[StreamTypeEnum.status] = StreamTypeEnum.status
    status: str


class DataStream(Stream, Generic[DataT]):
    type: Literal[StreamTypeEnum.data] = StreamTypeEnum.data
    data: DataT
