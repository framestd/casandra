# Standard Library
from typing import Any

# Third Party
import redis.asyncio as aioredis
from redis.client import Redis

# First Party
from app.core.logging.logger import get_app_logger

logger = get_app_logger(__name__)


def truncate(text: str, fraction: float = 0.25, threshold: int = 15):
    msg_len = len(text)
    fraction = msg_len // 4
    return f"""{text[:fraction]}{"." * 8}{text[fraction*3:]}""" if msg_len > threshold else text


async def publisher(rdb: "aioredis.Redis[Any]", channel: str, json_message: str):
    subscribers_count = await rdb.publish(channel=channel, message=json_message)

    # log 0 - 1/4, skip 1/4 - 3/4, log 3/4 - 4/4
    trucated = truncate(json_message)

    logger.debug(f"Published message {trucated} to {channel} ({subscribers_count} subscribers)")

    if subscribers_count == 0:
        logger.info(f'There are currently no subscribers on "{channel}" channel')


def publisher_sync(rdb: "Redis[Any]", channel: str, json_message: str):
    subscribers_count = rdb.publish(channel=channel, message=json_message)

    # log 0 - 1/4, skip 1/4 - 3/4, log 3/4 - 4/4
    trucated = truncate(json_message)

    logger.debug(f"Published message {trucated} to {channel} ({subscribers_count} subscribers)")

    if subscribers_count == 0:
        logger.info(f'There are currently no subscribers on "{channel}" channel')
