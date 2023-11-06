# Standard Library
from uuid import UUID

# Third Party
import google.auth.exceptions
from sqlalchemy.orm import Session

# First Party
from app.core.authentication.oauth2 import google_id_token_info
from app.core.authentication.oauth2 import google_token_from_authorization_code
from app.core.authentication.oauth2 import google_token_from_refresh_token
from app.core.deps import ServiceContext
from app.core.exceptions.application import MissingResourceException
from app.core.exceptions.code import ErrorContextType
from app.core.logging.logger import get_app_logger
from app.core.models.connected_services import ConnectedServicesInDB
from app.core.models.connected_services import ConnectedServicesProviderEnum
from app.core.schemas.account import TokenBase, TokenTypeEnum

logger = get_app_logger(__name__)


def _disconnect_connected_service(
    session: Session,
    ctx: ServiceContext,
    provider: ConnectedServicesProviderEnum,
    provider_account_id: str,
):
    connected_service = _get_connected_service_by_provider_provider_account_id(
        session=session,
        ctx=ctx,
        provider=provider,
        provider_account_id=provider_account_id,
    )

    session.delete(connected_service)
    session.commit()
    return True


def _get_connected_service_by_provider_provider_account_id(
    *,
    session: Session,
    ctx: ServiceContext,
    provider: ConnectedServicesProviderEnum,
    provider_account_id: str,
):
    connected_service = (
        session.query(ConnectedServicesInDB)
        .filter(
            ConnectedServicesInDB.account_id == ctx.account.id,
            ConnectedServicesInDB.provider == provider,
            ConnectedServicesInDB.provider_account_id == provider_account_id,
        )
        .one_or_none()
    )

    if connected_service is None:
        exception = MissingResourceException(
            f"No connected service with the given provider and provider_account_id found"
        )
        exception.add_attributes(
            context={"type": ErrorContextType.details},
            message=exception.message,
            path=("*", "label", "*", "provider"),
            value=[provider, provider_account_id],
        )
        raise exception

    return connected_service


def connect_google_services(
    *,
    session: Session,
    ctx: ServiceContext,
    code: str,
    redirect_uri: str,
    scopes: list[str],
    state: str | None,
):
    provider = ConnectedServicesProviderEnum.google

    """If the user account is an OAuth2/OIDC account then merge their former scopes
    with the new one
    """

    if ctx.account.meta.provider is provider and ctx.account.meta.scopes is not None:
        scopes.extend(ctx.account.meta.scopes.split(" "))
    credentials = google_token_from_authorization_code(
        code=code,
        redirect_uri=redirect_uri,
        scopes=scopes,
        state=state,
    )

    idinfo = google_id_token_info(credentials.id_token)

    # UPSERT
    try:
        """We can't query by provider-label because as Google said, label (email address)
        can change, so it's safer to query by provider-provider_account_id
        """
        connected_service = _get_connected_service_by_provider_provider_account_id(
            session=session,
            ctx=ctx,
            provider=provider,
            provider_account_id=idinfo.sub,
        )
        connected_service.label = idinfo.email
        connected_service.access_token = credentials.token
        connected_service.refresh_token = credentials.refresh_token
        connected_service.scopes = str.join(" ", {*connected_service.scopes.split(" "), *scopes})
        session.commit()
    except MissingResourceException:
        connected_service = ConnectedServicesInDB(
            label=idinfo.email,
            provider=provider,
            provider_account_id=idinfo.sub,
            access_token=credentials.token,
            refresh_token=credentials.refresh_token,
            scopes=str.join(" ", scopes),
            account_id=ctx.account.id,
        )

        session.add(connected_service)
        session.commit()
        session.refresh(connected_service)
    return connected_service


def get_provider_token_for_label_service(
    *,
    session: Session,
    ctx: ServiceContext,
    provider: ConnectedServicesProviderEnum,
    label: str,
):
    connected_service = get_connected_service_by_provider_label_service(
        session=session,
        ctx=ctx,
        provider=provider,
        label=label,
    )

    try:
        credentials = google_token_from_refresh_token(refresh_token=connected_service.refresh_token)
    except google.auth.exceptions.RefreshError as exc:
        _disconnect_connected_service(
            session=session,
            ctx=ctx,
            provider=provider,
            provider_account_id=connected_service.provider_account_id,
        )

        exception = MissingResourceException(
            f"{provider.value.title()} service for {label} not found"
        )
        exception.add_attributes(
            context={"type": ErrorContextType.details},
            message=str(exc),
            path=("*",),
            value=[label, provider],
        )
        exception.add_attributes(
            context={"type": ErrorContextType.help},
            message=f"You may have disconnected this app from your {provider.value.title()} acccount",
            path=("*",),
            value=[label, provider],
        )
        raise exception

    logger.info(credentials.__dict__)

    return TokenBase(
        access_token=credentials.token,
        expiry=credentials.expiry.timestamp(),
        token_type=TokenTypeEnum.BEARER,
        expires_in=0.0,
    )


def get_connected_services_service(*, session: Session, ctx: ServiceContext):
    connected_services = (
        session.query(ConnectedServicesInDB)
        .filter(ConnectedServicesInDB.account_id == ctx.account.id)
        .all()
    )

    return connected_services


def get_connected_service_by_id_service(
    *,
    session: Session,
    ctx: ServiceContext,
    id: UUID,
):
    connected_service = (
        session.query(ConnectedServicesInDB)
        .filter(ConnectedServicesInDB.account_id == ctx.account.id, ConnectedServicesInDB.id == id)
        .one_or_none()
    )

    if connected_service is None:
        exception = MissingResourceException(f"No connected service with the given ID was found")
        exception.add_attributes(
            context={"type": ErrorContextType.details},
            message=exception.message,
            path=("*", "id"),
            value=id,
        )
        raise exception

    return connected_service


def get_connected_service_by_provider_label_service(
    *,
    session: Session,
    ctx: ServiceContext,
    provider: ConnectedServicesProviderEnum,
    label: str,
):
    connected_service = (
        session.query(ConnectedServicesInDB)
        .filter(
            ConnectedServicesInDB.account_id == ctx.account.id,
            ConnectedServicesInDB.provider == provider,
            ConnectedServicesInDB.label == label,
        )
        .one_or_none()
    )

    if connected_service is None:
        exception = MissingResourceException(
            f"No connected service with the given provider and label found"
        )
        exception.add_attributes(
            context={"type": ErrorContextType.details},
            message=exception.message,
            path=("*", "label", "*", "provider"),
            value=[provider, label],
        )
        raise exception

    return connected_service


def get_connected_services_by_provider_service(
    *,
    session: Session,
    ctx: ServiceContext,
    provider: ConnectedServicesProviderEnum,
):
    connected_services = (
        session.query(ConnectedServicesInDB)
        .filter(
            ConnectedServicesInDB.account_id == ctx.account.id,
            ConnectedServicesInDB.provider == provider,
        )
        .all()
    )

    return connected_services
