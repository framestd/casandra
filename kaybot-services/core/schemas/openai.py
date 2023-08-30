# Standard Library
from enum import Enum

# Third Party
from pydantic import Field

# Local Folder
from .base import BaseModel


class ChatCompletionRoleEnum(str, Enum):
    SYSTEM = "system"
    ASSISTANT = "assistant"
    USER = "user"


class ChatCompletionObjectEnum(str, Enum):
    CHAT_COMPLETION = "chat.completion"


class ChatCompletionChoiceMessage(BaseModel):
    role: ChatCompletionRoleEnum = Field(default=ChatCompletionRoleEnum.ASSISTANT)
    content: str


class ChatCompletionChoice(BaseModel):
    index: int
    message: ChatCompletionChoiceMessage
    finish_reason: str


class ChatCompletionUsage(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int


class ChatCompletionResponseBody(BaseModel):
    id: str
    object: ChatCompletionObjectEnum
    created: int
    model: str
    choices: list[ChatCompletionChoice]
    usage: ChatCompletionUsage


class ChatCompletionResponse(BaseModel):
    response: ChatCompletionResponseBody
