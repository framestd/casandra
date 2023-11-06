# Standard Library
from typing import Any, TypeVar
from typing import cast as nativecast

# Third Party
from pydantic import BaseModel

# Local Folder
from .account import Account
from .conversation import Conversation
from .message import ConversationMessage
from .user import User

User.model_rebuild()
Account.model_rebuild()
Conversation.model_rebuild()
ConversationMessage.model_rebuild()

CastT = TypeVar("CastT", bound=BaseModel)


def cast(typ: type[CastT], val: Any) -> CastT:
    return nativecast(typ, val)


def iter_cast(typ: type[CastT], val: list[Any]) -> list[CastT]:
    return list(map(lambda x: cast(typ, x), val))
