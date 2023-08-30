# type: ignore

# Standard Library
from typing import Literal

# Third Party
from decouple import config
from pydantic_settings import BaseSettings


def get_default_description(app_name: str) -> str:
    return f"{app_name} is a chatbot that can be utilized for lead generation in the field of digital marketing."


class Settings(BaseSettings):
    """Base configurations for the Casandra web services application"""

    APP_NAME: str = config("APP_NAME", cast=str)
    APP_CODE_NAME: str = config("APP_CODE_NAME", cast=str)
    PORT: int = config("PORT", cast=int)

    DESCRIPTION: str = config(
        "APP_DESC",
        default=get_default_description(APP_NAME),
        cast=str,
    )

    CLIENT_HOSTS: list[str] = config(
        "CLIENT_ADDRESSES",
        cast=lambda x: [v.strip() for v in x.split(",")],
    )

    JWT_ALGORITHM: Literal["RS256"] = "RS256"
    JWT_RS256_KEY: str = config("JWT_RS256_KEY", cast=lambda x: x.replace(r"\n", "\n"))
    JWT_RS256_PUB_KEY: str = config(
        "JWT_RS256_PUB_KEY",
        cast=lambda x: x.replace(r"\n", "\n"),
    )
    TOKEN_EXPIRY: int = config("TOKEN_EXPIRY", cast=int)

    VERSION: Literal["1.0"] = "1.0"

    POSTGRES_PORT: int = config("POSTGRES_PORT", cast=int)
    POSTGRES_HOST: str = config("POSTGRES_HOST", cast=str)
    POSTGRES_USER: str = config("POSTGRES_USER", cast=str)
    POSTGRES_PASSWORD: str = config("POSTGRES_PASSWORD", cast=str)

    OPENAI_SECRET_KEY: str = config("OPENAI_SECRET_KEY", cast=str)


settings = Settings()
