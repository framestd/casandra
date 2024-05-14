# Standard Library
from typing import Any, Generator, Literal, TypedDict, cast

# Third Party
import openai
from openai.openai_object import OpenAIObject

# First Party
from app.core.logging.logger import get_app_logger
from app.core.models.message import ConversationMessageRoleEnum
from app.core.schemas.openai import ChatCompletionResponseStream

logger = get_app_logger(__name__)

METADATA_PROMPT = """Reply to the following message from a user. Also using the markdown front matter format, you'll suggest a topic of not more than 5 to 10 words, and generate a short description of not more than 15 words for the resulting conversation. Then go ahead and respond to the message after suggesting a topic and description.
###
Enusre to format the frontatter accordingly with no extraneous line breaks than is in the desired format. The desired format for suggesting a topic and description is given below:
---
topic: <YOUR SUGGESTED TOPIC>
description: <YOUR SUGGESTED DESCRIPTION>
---
###
<YOUR RESPONSE HERE>
###

Message:
"""

FRONTMATTER_LINE_LENGTH = 4


class OpenAIMessagePromptDict(TypedDict):
    role: Literal["user", "assistant"]
    content: str


class OpenAISystemPromptDict(TypedDict):
    role: Literal["system"]
    content: str


class Prompt(object):
    system: str
    user: str

    def __init__(self, *, system: str, user: str):
        self.system = system
        self.user = user


def create_openai_message_prompt(
    role: ConversationMessageRoleEnum, body: str
) -> OpenAIMessagePromptDict:
    return OpenAIMessagePromptDict(
        role="user" if role is ConversationMessageRoleEnum.human else "assistant",
        content=body,
    )


def create_aggregate_prompts(
    *, prompts: list[OpenAIMessagePromptDict]
) -> tuple[OpenAISystemPromptDict, list[OpenAIMessagePromptDict]]:
    """Generate a prompt from a give question or message,
    a background information for the personality which is predefined
    and set by an enum of `PersonalityBackground`

    """

    system = f"You are a study assistant, with great humor and vast knowledge."

    return (OpenAISystemPromptDict(role="system", content=system), prompts)


def generate_completion_stream(
    aggregate_prompts: tuple[OpenAISystemPromptDict, list[OpenAIMessagePromptDict]],
    with_metadata: bool | None = None,
    max_tokens: int = 500,
    temperature: float = 0.5,
) -> Generator[ChatCompletionResponseStream, Any, None]:
    """Generate a response to an given prompt.
    The prompt is programmed such that the GPT is given a
    personality of its own.
    The prompt that awards this personality to the GPT is in fact
    itself a message with a "system" role while a user and/or assistant
    message follows it.
    """

    system_prompt, message_prompts = aggregate_prompts

    if with_metadata is True:
        end = message_prompts[-1:][0]
        end.update({"content": METADATA_PROMPT + " " + end.get("content")})

    response = openai.ChatCompletion.create(  # type: ignore
        model="gpt-3.5-turbo",
        temperature=temperature,
        max_tokens=max_tokens,
        messages=[system_prompt, *message_prompts],
        stream=True,
    )

    for chunk in response:  # type: ignore
        oai_object = cast(OpenAIObject, chunk)
        oai_object_dict = cast(dict[str, Any], oai_object.to_dict_recursive())

        yield ChatCompletionResponseStream(**oai_object_dict)
    return None
