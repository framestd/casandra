# Standard Library
from enum import Enum
from typing import Literal

# Third Party
from pydantic import ConfigDict, Field

# Local Folder
from .base import BaseModel


class CompletionBaseModel(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=False)


class CompletionRoleEnum(str, Enum):
    """An enumeration of possible entities engaged in an
    OpenAI chat completion dialogue"""

    system = "system"
    assistant = "assistant"
    user = "user"


class CompletionObjectEnum(str, Enum):
    """An enumeration of possible types OpenAI engagements
    objects we make use of"""

    CHAT_COMPLETION = "chat.completion"
    CHAT_COMPLETION_CHUNK = "chat.completion.chunk"


class CompletionChoiceMessage(CompletionBaseModel):
    """This is a representation of the buffered message content of an
    OpenAI chat completion response.

    Message in `content` is a whole response rather than being just chunks
    of the whole response.
    """

    role: CompletionRoleEnum = Field(default=CompletionRoleEnum.assistant)
    content: str


class CompletionChoiceDelta(CompletionBaseModel):
    """This is a representation of the streamed message content of an
    OpenAI chat completion response.

    Message in `content` is a chunked response rather than being the whole response.

    Note: These attributes are not always present. Before there's a content response,
    a chunk containing just the `role` attribute might be received at first, then
    subsequent chunks with a `content` attribute but not a `role` attribute are
    received. After all the chunks have been completely received, both `role` and `content`
    attributes may not be present, leaving just an object without any attributes
    """

    role: CompletionRoleEnum | None = Field(default=CompletionRoleEnum.assistant)
    content: str | None = Field(None)


class ChatCompletionChoiceBase(CompletionBaseModel):
    """Foundational, common, attributes"""

    index: int
    finish_reason: str | None = Field(None)


class ChatCompletionChoice(ChatCompletionChoiceBase):
    """A specific chat completion response amidst other alternative responses"""

    message: CompletionChoiceMessage


class ChatCompletionChoiceChunk(ChatCompletionChoiceBase):
    """A specific chat completion chunk response amidst other alternative
    chunk responses"""

    delta: CompletionChoiceDelta


class ChatCompletionUsage(CompletionBaseModel):
    """Meta attributes about the prompt and response or completion"""

    prompt_tokens: int
    completion_tokens: int
    total_tokens: int


class ChatCompletionResponseBodyBase(CompletionBaseModel):
    """Foundational, common, attributes"""

    id: str
    object: CompletionObjectEnum
    created: int
    model: str


class ChatCompletionResponseStream(ChatCompletionResponseBodyBase):
    """The chat completion streamed response attributes"""

    choices: list[ChatCompletionChoiceChunk]
    object: Literal[CompletionObjectEnum.CHAT_COMPLETION_CHUNK]


class ChatCompletionResponseBody(ChatCompletionResponseBodyBase):
    """The chat completion buffered response attributes"""

    choices: list[ChatCompletionChoice]
    object: Literal[CompletionObjectEnum.CHAT_COMPLETION]
    usage: ChatCompletionUsage
