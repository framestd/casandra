# Third Party
import openai

# First Party
from core.settings import settings

openai.api_key = settings.OPENAI_SECRET_KEY
