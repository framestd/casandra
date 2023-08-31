# Standard Library
from typing import Annotated

# Third Party
import openai
from fastapi import Depends

# First Party
from app.core.deps import get_current_account
from app.core.exceptions.http import ServiceUnavailableException
from app.core.intelligence.basic import PersonalityBackground, generate_prompt
from app.core.intelligence.basic import generate_response
from app.core.logging.logger import get_app_logger
from app.core.models.account import Account
from app.core.schemas.chat import MessageCreate
from app.core.schemas.openai import ChatCompletionResponse
from app.core.schemas.response import StatusResponse
from app.core.specs.additional_responses import responses

# Local Folder
from .router import router


logger = get_app_logger(__name__)


@router.post(
    "/message",
    response_model=StatusResponse[ChatCompletionResponse],
    responses={
        401: responses.get("o401"),
        422: responses.get("o422"),
        503: responses.get("o503"),
    },
)
def create_message(
    message: MessageCreate,
    current_account: Annotated[Account, Depends(get_current_account)],
) -> StatusResponse[ChatCompletionResponse]:
    """
    An endpoint to post messages and expect a response. The messages are reconstructed into a
    valuable prompt and sent over to OpenAI's API which most likely responds with a message.

    :param message: The message object containing the message body to send

    :raises ServiceUnavailableException:
        when it fails to establish a successful communication with third party API
    """

    prompt = generate_prompt(
        question=message.message_body,
        background_type=PersonalityBackground.SIMPLE,
    )

    try:
        response = generate_response(prompt=prompt)
    except openai.OpenAIError:
        logger.error("Failed to generate message response from OpenAI", exc_info=True)

        raise ServiceUnavailableException(
            message="Failed to establish outbound communication"
        )

    return StatusResponse[ChatCompletionResponse](
        data=ChatCompletionResponse(response=response),
        message="Message understood",
        success=True,
    )
