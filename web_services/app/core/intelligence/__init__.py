# Third Party
import openai

# First Party
from app.core.settings import settings

openai.api_key = settings.OPENAI_SECRET_KEY
