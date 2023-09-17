# Third Party
from redis.asyncio import StrictRedis

# First Party
from app.core.logging.logger import get_app_logger

logger = get_app_logger(__name__)


async def publisher(rdb: "StrictRedis[str]", channel: str, json_message: str):
    subscribers_count = await rdb.publish(channel=channel, message=json_message)

    logger.info(f"Published message {json_message} to {channel}")

    if subscribers_count == 0:
        logger.info(f'There are currently no subscribers on "{channel}" channel')
        logger.info(f'Queueing message to "{channel}" list')
        await rdb.lpush(channel, json_message)
