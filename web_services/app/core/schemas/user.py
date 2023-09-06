# Third Party
from pydantic import UUID4

# Local Folder
from .base import BaseModel, SchemaBase


class UserBase(BaseModel):
    """Foundational, common, attributes"""

    first_name: str
    last_name: str
    username: str


class UserCreate(UserBase):
    """Attributes necessary for creating a User object"""

    pass


class User(UserBase, SchemaBase):
    """User outbound attributes"""

    account_id: UUID4
