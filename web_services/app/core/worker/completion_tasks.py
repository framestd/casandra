# Standard Library
from typing import Any

# First Party
from app.core.intelligence.basic import generate_prompt
from app.core.worker.schemas.completion import CompletionTaskIn

# Local Folder
from .celery import celery


@celery.task
def openai_completion(data: dict[str, Any]):
    task_in = CompletionTaskIn(**data)
    message = task_in.message
    prompt = generate_prompt(question=message.body)
    # openai_response = generate_response(prompt=prompt)
    return prompt.__dict__
