# Standard Library
from typing import TYPE_CHECKING, Annotated

# Third Party
from pydantic import UUID4, Field

# First Party
from app.core.models.message import ConversationMessageRoleEnum

# Local Folder
from .base import BaseModel, SchemaBase

if TYPE_CHECKING:
    # Local Folder
    from .conversation import ConversationOut


class MessageBase(BaseModel):
    """Foundational, common, attributes"""

    body: str


class MessageFilter(BaseModel):
    """Filters available for chat message endpoint"""

    body: Annotated[str | None, Field(None)] = None
    role: Annotated[ConversationMessageRoleEnum | None, Field(None)] = None
    response_from_id: Annotated[UUID4 | None, Field(None)] = None
    response_to_id: Annotated[UUID4 | None, Field(None)] = None


class MessageFilterExtra(MessageFilter):
    """Extra, reserved, filters available for conversation endpoint"""

    conversation_id: UUID4


class MessageCreate(MessageBase):
    """Attributes necessary for creating a ChatMessage object"""

    conversation_id: UUID4 | None = None


class MessageCreateCustomizations(BaseModel):
    """
    A couple of options used to customize message completion.

    Attributes:
        quotes: The IDs of quoted previous messages to include to provide context for the new
        message. Note that "quotes" takes precedence over "context_length" when quotes is provided

        context_length: The number of previous messages to include to provide context for the new
        message
    """

    quotes: Annotated[list[UUID4], Field([], max_items=6)] = []  # type: ignore
    context_length: Annotated[int, Field(2, le=6)] = 2


class ConversationMessagePartial(MessageBase):
    id: UUID4
    conversation_id: UUID4
    role: ConversationMessageRoleEnum


class ConversationMessageOut(MessageBase, SchemaBase):
    """ChatMessage outbound attributes"""

    conversation_id: UUID4
    conversation: "ConversationOut"
    role: ConversationMessageRoleEnum
    response_from_id: UUID4 | None
    response_to_id: UUID4 | None
    quoted_messages: list["ConversationMessageOut"]
    context_length: int
