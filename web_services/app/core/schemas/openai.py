# Standard Library
from enum import Enum

# Third Party
from pydantic import Field

# Local Folder
from .base import BaseModel


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


class CompletionChoiceMessage(BaseModel):
    """This is a representation of the buffered message content of an
    OpenAI chat completion response.

    Message in `content` is a whole response rather than being just chunks
    of the whole response.
    """

    role: CompletionRoleEnum = Field(default=CompletionRoleEnum.assistant)
    content: str


class CompletionChoiceDelta(BaseModel):
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
    content: str | None


class ChatCompletionChoiceBase(BaseModel):
    """Foundational, common, attributes"""

    index: int
    finish_reason: str


class ChatCompletionChoice(ChatCompletionChoiceBase):
    """A specific chat completion response amidst other alternative responses"""

    message: CompletionChoiceMessage


class ChatCompletionChoiceChunk(ChatCompletionChoiceBase):
    """A specific chat completion chunk response amidst other alternative
    chunk responses"""

    delta: CompletionChoiceDelta


class ChatCompletionUsage(BaseModel):
    """Meta attributes about the prompt and response or completion"""

    prompt_tokens: int
    completion_tokens: int
    total_tokens: int


class ChatCompletionResponseBodyBase(BaseModel):
    """Foundational, common, attributes"""

    id: str
    object: CompletionObjectEnum
    created: int
    model: str
    usage: ChatCompletionUsage


class ChatCompletionResponseStream(ChatCompletionResponseBodyBase):
    """The chat completion streamed response attributes"""

    choices: list[ChatCompletionChoiceChunk]


class ChatCompletionResponseBody(ChatCompletionResponseBodyBase):
    """The chat completion buffered response attributes"""

    choices: list[ChatCompletionChoice]


class ChatCompletionResponse(BaseModel):
    """ChatCompletionResponse inbound attributes"""

    response: ChatCompletionResponseBody
