# Third Party
from pydantic import RedisDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class WorkerSettings(BaseSettings, extra="allow"):
    """Base configurations for the Casandra web services application"""

    model_config = SettingsConfigDict(env_file=".env")

    REDIS_URL: RedisDsn

    CELERY_BROKER_URL: RedisDsn

    CELERY_RESULT_BACKEND: RedisDsn


worker_settings = WorkerSettings()  # type: ignore
