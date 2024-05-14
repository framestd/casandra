# Standard Library
from typing import Annotated
from uuid import UUID

# Third Party
from fastapi import Depends
from sqlalchemy.orm import Session

# First Party
from app.core.deps import ServiceContext, get_db, get_service_context
from app.core.logging.logger import get_app_logger
from app.core.models.connected_services import ConnectedServicesProviderEnum
from app.core.schemas import cast, iter_cast
from app.core.schemas.account import TokenBase
from app.core.schemas.connected_services import ConnectedServices
from app.core.schemas.connected_services import ConnectedServicesCreate
from app.core.schemas.response import StandardResponse, StatusResponse
from app.core.services.connected_services import connect_google_services
from app.core.services.connected_services import get_connected_service_by_id_service
from app.core.services.connected_services import get_connected_service_by_provider_label_service
from app.core.services.connected_services import get_connected_services_by_provider_service
from app.core.services.connected_services import get_connected_services_service
from app.core.services.connected_services import get_provider_token_for_label_service
from app.core.specs.additional_responses import responses

# Local Folder
from .router import router

logger = get_app_logger(__name__)


@router.put(
    "/oauth/google",
    response_model=StatusResponse[ConnectedServices],
    responses={
        401: responses.get("o401"),
        422: responses.get("o422"),
    },
)
def connect_google_oauth(
    *,
    connected_services_create: ConnectedServicesCreate,
    ctx: Annotated[ServiceContext, Depends(get_service_context)],
    db: Annotated[Session, Depends(get_db)]
):
    """Connect with GoogleAPIs and services using an OAuth 2 flow.

    :param code: The authorization code from Google
    :param redirect_uri: The original authorization redirect_uri
    :param scopes: The original authorization scopes requested
    :param state: The authorization state to prevent CSRF
    """

    connected_service = connect_google_services(
        session=db,
        ctx=ctx,
        code=connected_services_create.code,
        redirect_uri=connected_services_create.redirect_uri,
        scopes=connected_services_create.scopes,
        state=connected_services_create.state,
    )

    response = StatusResponse[ConnectedServices](
        message="Connected successfully",
        data=cast(ConnectedServices, connected_service),
        success=True,
    )

    return response


@router.get(
    "/oauth/{provider}/{label}/token",
    response_model=TokenBase,
    responses={
        401: responses.get("o401"),
        422: responses.get("o422"),
    },
)
def get_provider_token_for_label(
    *,
    provider: ConnectedServicesProviderEnum,
    label: str,
    ctx: Annotated[ServiceContext, Depends(get_service_context)],
    db: Annotated[Session, Depends(get_db)]
):
    token = get_provider_token_for_label_service(
        session=db, ctx=ctx, provider=provider, label=label
    )

    return token


@router.get(
    "/",
    response_model=StandardResponse[list[ConnectedServices]],
    responses={
        401: responses.get("o401"),
        422: responses.get("o422"),
    },
)
def get_connected_services(
    *,
    ctx: Annotated[ServiceContext, Depends(get_service_context)],
    db: Annotated[Session, Depends(get_db)]
):
    connected_services = get_connected_services_service(session=db, ctx=ctx)
    response = StandardResponse[list[ConnectedServices]](
        data=iter_cast(ConnectedServices, connected_services)
    )

    return response


@router.get(
    "/by_provider",
    response_model=StandardResponse[list[ConnectedServices]],
    responses={
        401: responses.get("o401"),
        422: responses.get("o422"),
    },
)
def get_connected_services_by_provider(
    *,
    provider: ConnectedServicesProviderEnum,
    ctx: Annotated[ServiceContext, Depends(get_service_context)],
    db: Annotated[Session, Depends(get_db)]
):
    connected_services = get_connected_services_by_provider_service(
        session=db, ctx=ctx, provider=provider
    )
    response = StandardResponse[list[ConnectedServices]](
        data=iter_cast(ConnectedServices, connected_services)
    )

    return response


@router.get(
    "/by_provider_label",
    response_model=StandardResponse[ConnectedServices],
    responses={
        401: responses.get("o401"),
        422: responses.get("o422"),
    },
)
def get_connected_services_by_provider_label(
    *,
    provider: ConnectedServicesProviderEnum,
    label: str,
    ctx: Annotated[ServiceContext, Depends(get_service_context)],
    db: Annotated[Session, Depends(get_db)]
):
    connected_service = get_connected_service_by_provider_label_service(
        session=db,
        ctx=ctx,
        provider=provider,
        label=label,
    )
    response = StandardResponse[ConnectedServices](data=cast(ConnectedServices, connected_service))

    return response


@router.get(
    "/{id}",
    response_model=StandardResponse[ConnectedServices],
    responses={
        401: responses.get("o401"),
        422: responses.get("o422"),
    },
)
def get_connected_services_by_id(
    *,
    id: UUID,
    ctx: Annotated[ServiceContext, Depends(get_service_context)],
    db: Annotated[Session, Depends(get_db)]
):
    connected_service = get_connected_service_by_id_service(session=db, ctx=ctx, id=id)
    response = StandardResponse[ConnectedServices](data=cast(ConnectedServices, connected_service))

    return response
