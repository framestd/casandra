# Standard Library
from typing import TYPE_CHECKING, Annotated

# Third Party
from pydantic import UUID4, Field

# Local Folder
from .base import BaseModel, SchemaBase

if TYPE_CHECKING:
    # Local Folder
    from .user import User


class ConversationBase(BaseModel):
    """Foundational, common attributes"""

    subject: str
    started_by_id: UUID4


class ConversationFilter(BaseModel):
    """Filters available for conversation endpoint"""

    subject: Annotated[str | None, Field(None, description="Filter by the conversation subject")]


class ConversationFilterExtra(ConversationFilter):
    """Extra, reserved, filters available for conversation endpoint"""

    started_by_id: UUID4


class ConversationCreate(ConversationBase):
    """Attributes necessary for creating a Conversation object"""

    pass


class Conversation(ConversationBase, SchemaBase):
    """Conversation outbound attributes"""

    started_by: "User"
