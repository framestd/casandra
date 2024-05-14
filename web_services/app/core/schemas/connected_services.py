# Third Party
from pydantic import UUID4

# First Party
from app.core.models.connected_services import ConnectedServicesProviderEnum
from app.core.schemas.base import BaseModel, SchemaBase
from app.core.schemas.oauth2 import Scopes


class ConnectedServicesCreate(BaseModel):
    code: str
    redirect_uri: str
    scopes: list[str]
    state: str | None = None


class ConnectedServices(SchemaBase, Scopes):
    label: str
    provider: ConnectedServicesProviderEnum
    provider_account_id: str
    access_token: str
    account_id: UUID4
