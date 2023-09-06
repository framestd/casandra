# Standard Library
from typing import TYPE_CHECKING

# Third Party
from pydantic import UUID4

# First Party
from app.core.models.chat_message import ChatMessageRoleEnum

# Local Folder
from .base import BaseModel, SchemaBase

if TYPE_CHECKING:
    # Local Folder
    from .conversation import Conversation


class ChatMessageBase(BaseModel):
    """Foundational, common, attributes"""

    body: str


class ChatMessageCreate(ChatMessageBase):
    """Attributes necessary for creating a ChatMessage object"""

    conversation_id: UUID4 | None = None


class ChatMessage(ChatMessageBase, SchemaBase):
    """ChatMessage outbound attributes"""

    conversation_id: UUID4
    conversation: "Conversation"
    role: ChatMessageRoleEnum
    response_from_id: UUID4 | None
    response_to_id: UUID4 | None
    _dangling: bool
