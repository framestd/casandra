# Standard Library
from typing import Any, Generator, cast

# Third Party
import openai

# First Party
from app.core.schemas.openai import ChatCompletionResponseStream


class Prompt(object):
    system: str
    user: str

    def __init__(self, *, system: str, user: str):
        self.system = system
        self.user = user


def generate_prompt(question: str) -> Prompt:
    """Generate a prompt from a give question or message,
    a background information for the personality which is predefined
    and set by an enum of `PersonalityBackground`

    """
    system = f"You are a savage assistant, with great humor and sarcasm"

    return Prompt(system=system, user=question)


def generate_response(
    prompt: Prompt,
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

    response = openai.ChatCompletion.create(  # type: ignore
        model="gpt-3.5-turbo",
        temperature=temperature,
        max_tokens=max_tokens,
        messages=[
            {"role": "system", "content": prompt.system},
            {"role": "user", "content": prompt.user},
        ],
        stream=True,
    )

    for chunk in response:  # type: ignore
        yield cast(ChatCompletionResponseStream, chunk)

    # return cast(ChatCompletionResponseBody, response)
    return None
