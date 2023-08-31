# Third Party
from passlib.context import CryptContext


class Password(object):
    """A wrapper object around plain password strings to enhance
    fast and easy manipulation of the string.

    Makes it convenient to generate the password hash, and compare
    the plain password with the hashed password
    """

    _context: CryptContext = CryptContext(schemes=["bcrypt"], deprecated="auto")

    def __init__(self, plain: str) -> None:
        """Constructs a new password object

        :param plain_password: the plain text password to wrap in a Password object
        """
        self._plain = plain

    def get_hash(self):
        """Compute the hash of the plain password wrapped with this object"""
        return self._context.hash(self._plain)

    def compare(self, hashed: str):
        """Compare the wrapped plain password with the hashed password supplied
        as an argument to this method.

        :param hashed_password: this is a bcrypt hashed password
        """
        return self._context.verify(self._plain, hashed)
