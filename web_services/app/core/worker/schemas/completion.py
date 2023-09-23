# First Party
from app.core.schemas.base import BaseModel
from app.core.schemas.message import Message


class CompletionTaskIn(BaseModel):
    message: Message
    ...


class CompletionTaskOut(BaseModel):
    ...
