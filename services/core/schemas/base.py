# Standard Library
from datetime import datetime

# Third Party
from pydantic import UUID4
from pydantic import BaseModel as PyBaseModel
from pydantic import ConfigDict


class BaseModel(PyBaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)


class SchemaBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID4
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None


class ApplicationInfo(BaseModel):
    title: str
    version: str
    description: str
