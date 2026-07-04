from dataclasses import dataclass
from uuid import UUID

from app.application.ports import AppUserRepository
from app.domain.entities import AppUser


@dataclass
class EnsureAppUserInput:
    auth_provider: str
    auth_subject: str
    primary_email: str | None = None
    display_name: str | None = None


class EnsureAppUserUseCase:
    def __init__(self, users: AppUserRepository) -> None:
        self._users = users

    async def execute(self, payload: EnsureAppUserInput) -> UUID:
        existing = await self._users.get_by_auth_identity(
            provider=payload.auth_provider,
            subject=payload.auth_subject,
        )
        if existing is not None:
            return existing.id

        app_user = AppUser(
            auth_provider=payload.auth_provider,
            auth_subject=payload.auth_subject,
            primary_email=payload.primary_email,
            display_name=payload.display_name,
        )
        await self._users.add(app_user)
        return app_user.id
