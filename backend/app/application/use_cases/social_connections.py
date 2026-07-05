from dataclasses import dataclass
from datetime import datetime, timezone
from uuid import UUID

from app.application.dto import SocialConnectionStartView, SocialConnectionView
from app.application.ports import SecretCipher, SocialConnectionRepository, SocialOAuthClient
from app.domain.entities import SocialConnection
from app.domain.error_codes import ErrorCode
from app.domain.exceptions import DomainError


@dataclass
class StartLinkedInConnectInput:
    app_user_id: UUID
    redirect_uri: str


@dataclass
class CompleteLinkedInConnectInput:
    app_user_id: UUID
    code: str
    state: str
    redirect_uri: str


class StartLinkedInConnectUseCase:
    def __init__(self, oauth_client: SocialOAuthClient) -> None:
        self._oauth_client = oauth_client

    async def execute(self, payload: StartLinkedInConnectInput) -> SocialConnectionStartView:
        authorization_url = await self._oauth_client.get_authorization_url(
            redirect_uri=payload.redirect_uri,
            app_user_id=payload.app_user_id,
        )
        return SocialConnectionStartView(authorization_url=authorization_url)


class CompleteLinkedInConnectUseCase:
    def __init__(
        self,
        oauth_client: SocialOAuthClient,
        connections: SocialConnectionRepository,
        cipher: SecretCipher,
    ) -> None:
        self._oauth_client = oauth_client
        self._connections = connections
        self._cipher = cipher

    async def execute(self, payload: CompleteLinkedInConnectInput) -> SocialConnectionView:
        resolved = await self._oauth_client.complete_authorization(
            code=payload.code,
            state=payload.state,
            redirect_uri=payload.redirect_uri,
            app_user_id=payload.app_user_id,
        )
        existing = await self._connections.get_by_provider_account(
            provider=resolved.provider,
            provider_account_id=resolved.provider_account_id,
        )
        if existing is not None and existing.app_user_id != payload.app_user_id:
            raise DomainError(
                "Social account already connected to another user",
                code=ErrorCode.SOCIAL_CONNECTION_CONFLICT,
                public_message="Social account is already connected",
            )

        encrypted_access_token = self._cipher.encrypt(resolved.access_token)
        encrypted_refresh_token = (
            self._cipher.encrypt(resolved.refresh_token) if resolved.refresh_token else None
        )

        if existing is None:
            connection = SocialConnection(
                app_user_id=payload.app_user_id,
                provider=resolved.provider,
                provider_account_id=resolved.provider_account_id,
                provider_account_urn=resolved.provider_account_urn,
                provider_account_name=resolved.provider_account_name,
                access_token_encrypted=encrypted_access_token,
                refresh_token_encrypted=encrypted_refresh_token,
                expires_at=resolved.expires_at,
                scopes=resolved.scopes,
            )
            await self._connections.add(connection)
            return _to_view(connection)

        existing.provider_account_urn = resolved.provider_account_urn
        existing.provider_account_name = resolved.provider_account_name
        existing.access_token_encrypted = encrypted_access_token
        if encrypted_refresh_token is not None:
            existing.refresh_token_encrypted = encrypted_refresh_token
        existing.expires_at = resolved.expires_at
        existing.scopes = resolved.scopes
        existing.status = "active"
        existing.updated_at = datetime.now(timezone.utc)
        await self._connections.update(existing)
        return _to_view(existing)


class ListSocialConnectionsUseCase:
    def __init__(self, connections: SocialConnectionRepository) -> None:
        self._connections = connections

    async def execute(self, *, app_user_id: UUID) -> list[SocialConnectionView]:
        return [_to_view(connection) for connection in await self._connections.list_by_user(app_user_id=app_user_id)]


class DisconnectSocialConnectionUseCase:
    def __init__(self, connections: SocialConnectionRepository) -> None:
        self._connections = connections

    async def execute(self, *, connection_id: UUID, app_user_id: UUID) -> bool:
        return await self._connections.delete(connection_id, app_user_id=app_user_id)


def _to_view(connection: SocialConnection) -> SocialConnectionView:
    return SocialConnectionView(
        id=connection.id,
        provider=connection.provider,
        provider_account_id=connection.provider_account_id,
        provider_account_urn=connection.provider_account_urn,
        provider_account_name=connection.provider_account_name,
        expires_at=connection.expires_at,
        scopes=connection.scopes,
        status=connection.status,
        created_at=connection.created_at,
        updated_at=connection.updated_at,
    )
