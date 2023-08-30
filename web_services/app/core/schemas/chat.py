# Third Party
from pydantic import Field, validator

# Local Folder
from .base import BaseModel


class MessageCreate(BaseModel):
    message_body: str = Field(strict=True, min_length=1)

    @validator("message_body")
    def non_empty(cls, v: str):
        if v.strip() == "":
            return None
        return v
