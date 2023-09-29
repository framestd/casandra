# Standard Library
from uuid import UUID

CONVERSATIONS = "chnnl:cnvrsatn"


def get_conversation_channel_for(conversation_id: UUID):
    return f"{CONVERSATIONS}:{conversation_id}"
