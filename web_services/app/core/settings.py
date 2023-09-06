# Standard Library
from typing import Literal

# Third Party
from pydantic import Field, RedisDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


def get_default_description(app_name: str) -> str:
    return f"{app_name} is a chatbot that can be utilized for lead generation in the field of digital marketing."


class Settings(BaseSettings):
    """Base configurations for the Casandra web services application"""

    model_config = SettingsConfigDict(env_file=".env")

    APP_NAME: str = ""
    APP_CODE_NAME: str
    PORT: int

    DESCRIPTION: str = Field(
        validation_alias="APP_DESC",
        default=get_default_description(APP_NAME),
    )

    CLIENT_HOSTS: list[str]

    JWT_ALGORITHM: Literal["RS256"] = "RS256"
    JWT_RS256_KEY: str
    JWT_RS256_PUB_KEY: str
    TOKEN_EXPIRY: int

    VERSION: Literal["1.0"] = "1.0"

    REDIS_URL: RedisDsn

    POSTGRES_PORT: int
    POSTGRES_HOST: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str

    OPENAI_SECRET_KEY: str

    WS_ACCESS_TOKEN_KEY: str = "ws_a_t"


settings = Settings()  # type: ignore
