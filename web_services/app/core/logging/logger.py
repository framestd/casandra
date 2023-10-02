# Standard Library
import logging
import logging.config
import sys
from time import gmtime

# Third Party
from colorlog import ColoredFormatter

logging.Formatter.converter = gmtime

_fmt = "%(asctime)s,%(msecs)03d - %(levelname)s (%(process)d) [%(name)s:%(lineno)d] %(message)s"
_datefmt = "%Y-%m-%dT%H:%M:%S"


class AppLogger(object):
    _console_handler = logging.StreamHandler(sys.stdout)
    _colored_formatter = ColoredFormatter(
        fmt="%(log_color)s{}".format(_fmt),
        datefmt=_datefmt,
        log_colors={
            "DEBUG": "cyan",
            "INFO": "green",
            "WARNING": "yellow",
            "ERROR": "red",
            "CRITICAL": "red,bg_yellow",
        },
    )

    def __init__(self, context: str, level: int = logging.INFO) -> None:
        self.context = context
        self.level = level
        self._logger = logging.getLogger(context)

        self._logger.propagate = False

        AppLogger._console_handler.setFormatter(AppLogger._colored_formatter)
        AppLogger._console_handler.setLevel(level)

        self._logger.setLevel(logging.DEBUG)
        self._logger.addHandler(AppLogger._console_handler)

    def get_logger(self):
        return self._logger


def get_app_logger(context: str, level: int = logging.DEBUG) -> logging.Logger:
    app_logger = AppLogger(context=context, level=level)
    logger = app_logger.get_logger()

    return logger
