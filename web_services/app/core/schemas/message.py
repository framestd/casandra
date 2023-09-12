# Standard Library
from typing import TYPE_CHECKING, Annotated

# Third Party
from pydantic import UUID4, Field

# First Party
from app.core.models.chat_message import ChatMessageRoleEnum

# Local Folder
from .base import BaseModel, SchemaBase

if TYPE_CHECKING:
    # Local Folder
    from .conversation import Conversation


class MessageBase(BaseModel):
    """Foundational, common, attributes"""

    body: str


class MessageFilter(BaseModel):
    """Filters available for chat message endpoint"""

    body: Annotated[str | None, Field(None)]
    role: Annotated[ChatMessageRoleEnum | None, Field(None)]
    response_from_id: Annotated[UUID4 | None, Field(None)]
    response_to_id: Annotated[UUID4 | None, Field(None)]


class MessageFilterExtra(MessageFilter):
    """Extra, reserved, filters available for conversation endpoint"""

    conversation_id: UUID4


class MessageCreate(MessageBase):
    """Attributes necessary for creating a ChatMessage object"""

    conversation_id: UUID4 | None = None


class Message(MessageBase, SchemaBase):
    """ChatMessage outbound attributes"""

    conversation_id: UUID4
    conversation: "Conversation"
    role: ChatMessageRoleEnum
    response_from_id: UUID4 | None
    response_to_id: UUID4 | None
    _dangling: bool
