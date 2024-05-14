# Third Party
from pydantic import UUID4, computed_field

# Local Folder
from .base import BaseModel, SchemaBase


class UserBase(BaseModel):
    """Foundational, common, attributes"""

    first_name: str
    last_name: str

    @computed_field
    @property
    def fullname(self) -> str:
        return f"{self.first_name} {self.last_name}"


class UserCreate(UserBase):
    """Attributes necessary for creating a User object"""

    username: str


class User(UserBase, SchemaBase):
    """User outbound attributes"""

    __name__ = "User"

    username: str | None
    account_id: UUID4
