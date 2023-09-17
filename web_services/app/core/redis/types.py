# Standard Library
from enum import Enum
from typing import Literal, TypedDict


class PubSubMessageTypeEnum(str, Enum):
    subscribe = "subscribe"
    unsubscribe = "unsubscribe"
    psubscribe = "psubscribe"
    punsubscribe = "punsubscribe"
    message = "message"
    pmessage = "pmessage"


class PubSubMessage(TypedDict):
    type: Literal["subscribe", "unsubscribe", "psubscribe", "punsubscribe", "message", "pmessage"]
    pattern: str | None
    channel: str
    data: str

