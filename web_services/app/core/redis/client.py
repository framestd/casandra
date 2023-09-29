# Third Party
import redis.asyncio.client as aioredis
from redis import ConnectionPool
from redis.client import Redis

# First Party
from app.core.logging.logger import get_app_logger
from app.core.settings import settings

logger = get_app_logger(__name__)


class AppRedisClient:
    def __init__(self) -> None:
        self.host = settings.REDIS_URL.host or "localhost"
        self.port = settings.REDIS_URL.port or 6379
        self.username = settings.REDIS_URL.username
        self.password = settings.REDIS_URL.password

        self._redis: aioredis.Redis[str]

    async def connect(self):
        self._redis = aioredis.Redis(
            host=self.host,
            port=self.port,
            username=self.username,
            password=self.password,
            decode_responses=True,
        )

        await self._redis.ping()

    async def disconnect(self, close_connection_pool: bool | None = None):
        return await self._redis.close(close_connection_pool=close_connection_pool)

    def get_cleint(self):
        return self._redis


class AppRedisClientSync:
    def __init__(self) -> None:
        self.host = settings.REDIS_URL.host or "localhost"
        self.port = settings.REDIS_URL.port or 6379
        self.username = settings.REDIS_URL.username
        self.password = settings.REDIS_URL.password

        self._redis: Redis[str]

    def connect(self, connection_pool: ConnectionPool | None = None):
        self._redis = Redis(
            connection_pool=connection_pool,
            host=self.host,
            port=self.port,
            username=self.username,
            password=self.password,
            decode_responses=True,
        )

        self._redis.ping()

    def disconnect(self):
        return self._redis.close()

    def get_cleint(self):
        return self._redis


appredis = AppRedisClient()
appredis_sync = AppRedisClientSync()
