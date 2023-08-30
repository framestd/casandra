# Third Party
from pydantic import UUID4

# Local Folder
from .base import BaseModel, SchemaBase


class UserBase(BaseModel):
    first_name: str
    last_name: str
    username: str


class UserCreate(UserBase):
    pass


class User(UserBase, SchemaBase):
    account_id: UUID4
