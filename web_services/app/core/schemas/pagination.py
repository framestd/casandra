# Standard Library
from typing import Annotated

# Third Party
from pydantic import Field

# Local Folder
from .base import BaseModel


class PageOptions(BaseModel):
    page_cursor: Annotated[str | None, Field(None)] = None
    page_size: Annotated[int, Field(100, gt=0, le=100)] = 100
    page_forward: Annotated[bool, Field(True)] = True


class PageInfo(BaseModel):
    top_cursor: str | None = Field(None, json_schema_extra={"format": "base64"})
    bottom_cursor: str | None = Field(None, json_schema_extra={"format": "base64"})
    has_next: bool = Field(False)
    has_prev: bool = Field(False)
