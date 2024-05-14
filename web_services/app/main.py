# Standard Library
from contextlib import asynccontextmanager
from typing import Any, Callable

# Third Party
import uvicorn
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse

# First Party
from app.account.handlers import router as account_router
from app.conversation.handlers import router as conversation_router
from app.core.exceptions.http import AppHTTPException, ErrorCode
from app.core.exceptions.http import UnprocessableEntityException
from app.core.logging.logger import get_app_logger
from app.core.redis.client import appredis, appredis_sync
from app.core.schemas.base import ApplicationInfo
from app.core.schemas.response import ErrorAttributes, ErrorResponse
from app.core.settings import settings
from app.message.handlers import router as message_router
from app.user.handlers import router as user_router

logger = get_app_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Opening connection to Redis...")
    await appredis.connect()
    appredis_sync.connect()
    logger.info("Redis connection opened and provided!")

    yield

    logger.info("Disconnecting all Redis connections...")
    await appredis.disconnect(True)
    appredis_sync.disconnect()
    logger.info("Disconnected all Redis connections!")


app = FastAPI(
    title=settings.APP_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    lifespan=lifespan,
)


@app.middleware("http")
async def standard_exception_handler(request: Request, call_next: Callable[[Request], Any]):
    try:
        return await call_next(request)
    except Exception as exc:
        logger.error(f"Unknown error occured: {str(exc)}", exc_info=True)

        error_response = ErrorResponse[AppHTTPException](
            title=AppHTTPException.title,
            message="Oops, an unknown error occured",
            success=False,
            code=ErrorCode.UNKNOWN,
            errors=[],
        )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response.model_dump(mode="json"),
    )


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CLIENT_HOSTS,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_credentials=True,
    allow_headers=["*"],
)


app.include_router(account_router, prefix="/accounts", tags=["Account"])
app.include_router(message_router, prefix="/messages", tags=["Message"])
app.include_router(conversation_router, prefix="/conversations", tags=["Conversation"])
app.include_router(user_router, prefix="/users", tags=["User"])


@app.exception_handler(AppHTTPException)
def app_http_exception_handler(request: Request, exc: AppHTTPException):
    error_attrs = [ErrorAttributes(**error) for error in exc.errors]

    error_response = ErrorResponse[type(exc)](
        title=exc.title,
        message=exc.message,
        success=False,
        code=exc.code,
        errors=error_attrs,
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.model_dump(mode="json"),
    )


@app.exception_handler(RequestValidationError)
def request_validation_exception_handler(request: Request, exc: RequestValidationError):
    error_attrs: list[ErrorAttributes] = [
        ErrorAttributes(
            context={"type": error.get("type"), **(error.get("ctx") or {})},
            path=error.get("loc"),
            message=error.get("msg"),
            value=error.get("input"),
        )
        for error in exc.errors()
    ]

    error_response = ErrorResponse[UnprocessableEntityException](
        title=UnprocessableEntityException.title,
        message=error_attrs[0].message,
        success=False,
        code=ErrorCode.UNPROCESSABLE_ENTITY,
        errors=error_attrs,
    )

    content = error_response.model_dump(mode="json")

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=content,
    )


@app.get("/openapi-3.0.3.json", tags=["Root"], include_in_schema=False)
async def openapi_compat():
    openapi_3_0_3 = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        openapi_version="3.0.3",
        routes=app.routes,
    )

    return openapi_3_0_3


@app.get("/", tags=["Root"], response_model=ApplicationInfo)
async def root():
    """Returns basic information about the application"""

    return ApplicationInfo(
        title=app.title,
        version=app.version,
        description=app.description,
    )


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=settings.PORT, reload=True)  # type: ignore
