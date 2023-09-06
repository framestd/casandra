# Standard Library
from datetime import datetime, timedelta
from typing import Any, Generic, TypeVar, cast

# Third Party
from jose import jwt
from pydantic import BaseModel, model_serializer

# First Party
from app.core.settings import settings

T = TypeVar("T", dict[str, Any], dict[str, Any])


def prefix_sub(sub: str, prefix: str = "account_id"):
    """Prefix the subject string in the payload passed to `jwt.encode` with
    a specific `prefix` string.

    :param sub: the jwt subject header

    :paran prefix: the prefix to use on the subject, defaults to `"account_id"`
    """

    return f"{prefix}:{sub}"


def split_prefix_from_sub(sub: str):
    """Split the prefix from the decoded jwt subject header

    :param sub: the decoded jwt subject header
    """

    prefix, subject = sub.split(":")
    return prefix, subject


class JWTRS256Token(Generic[T], BaseModel):
    """This class serves as a convenient representation
    of a JWT RS256 Token, and also a valid Pydantic model
    for representing this type of JWT token.

    The signing algorithm used is an RS256 algorithm with
    asymmetric key-pairs for signing and verifying, or encoding
    and decoding.

    It's safe to pass this object as a FastAPI or Pydantic
    response model. It will be correctly represented as the
    token string it wraps around, since it implements a
    Pydantic model serializer.

    To encode or sign a token from a regular Python data, dict,
    you do not need to create this class object directly—the use
    of `JWTRS256Token.from_data` covers this case.

    The class object itself is used to wrap or represent an
    already signed token string and can be used for decoding
    the wrapped token.
    """

    def __init__(self, token: str) -> None:
        super().__init__()
        self._token = token

    def __repr__(self) -> str:
        return self._token

    def __str__(self) -> str:
        return self._token

    @classmethod
    def from_data(cls, data: T, expires_delta: timedelta | None = None):
        """Create a new `JWTRS256Token` object from a data `T` that expires in `timedelta`.

        Used to construct a `JWTRS256Token` from a given data `T` rather than directly
        calling `JWTRS256Token` which doesn't work on a data `T` but an already encoded
        token.

        :param data: the payload to sign—this payload is passed to `jwt.encode` to be encoded

        :param expires_delta: the timedelta (`T(now) - T(expiry)`) before the token is
            considered expired
        """

        to_encode = data.copy() if type(data) is dict[str, Any] else data

        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(hours=settings.TOKEN_EXPIRY)

        to_encode.update({"exp": expire})

        encoded_jwt = jwt.encode(
            to_encode,
            settings.JWT_RS256_KEY,
            algorithm=settings.JWT_ALGORITHM,
        )

        return cls(token=encoded_jwt)

    def decode(self) -> T:
        """Decode the encoded token and return the original payload of data `T`"""

        decoded = jwt.decode(
            self._token,
            settings.JWT_RS256_PUB_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )

        return cast(T, decoded)

    @model_serializer
    def serialize_model(self):
        return self.__repr__()
