# Third Party
from broadcaster import Broadcast  # type: ignore

# First Party
from app.core.settings import settings

broadcast = Broadcast(settings.REDIS_URL.unicode_string())
