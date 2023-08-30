# Third Party
import uvicorn
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# First Party
from account.handlers import router as account_router
from chat.handlers import router as chat_router
from core.exceptions.http import AppHTTPException, ErrorCode
from core.exceptions.http import UnprocessableEntityException
from core.schemas.base import ApplicationInfo
from core.schemas.response import ErrorAttributes, ErrorInfo, ErrorResponse
from core.settings import settings
from user.handlers import router as user_router


app = FastAPI(
    title=settings.APP_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CLIENT_HOSTS,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_credentials=True,
    allow_headers=["*"],
)


app.include_router(account_router, prefix="/accounts", tags=["Account"])
app.include_router(chat_router, prefix="/chats", tags=["Chat"])
app.include_router(user_router, prefix="/users", tags=["User"])


@app.exception_handler(AppHTTPException)
def app_http_exception_handler(request: Request, exc: AppHTTPException):
    error_attrs = [ErrorAttributes(**error) for error in exc.errors]
    error_info = ErrorInfo(code=exc.code, errors=error_attrs)

    error_response = ErrorResponse[type(exc)](
        message=exc.message,
        success=False,
        info=error_info,
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.model_dump(),
    )


@app.exception_handler(RequestValidationError)
def request_validation_exception_handler(request: Request, exc: RequestValidationError):
    error_attrs: list[ErrorAttributes] = [
        ErrorAttributes(
            context={"type": error.get("type"), **error.get("ctx")},
            path=error.get("loc"),
            message=error.get("msg"),
            value=error.get("input"),
        )
        for error in exc.errors()
    ]

    error_info = ErrorInfo(code=ErrorCode.UNPROCESSABLE_ENTITY, errors=error_attrs)

    error_response = ErrorResponse[UnprocessableEntityException](
        message=error_attrs[0].message,
        success=False,
        info=error_info,
    )

    content = error_response.model_dump()

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=content,
    )


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
