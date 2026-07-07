from datetime import datetime, timezone
from uuid import UUID, uuid4

from app.application.dto import UserMemoryView
from app.application.ports import UserMemoryRepository
from app.domain.entities import UserMemory


class UpsertUserMemoryUseCase:
    def __init__(self, repository: UserMemoryRepository) -> None:
        self._repository = repository

    async def execute(
        self,
        *,
        app_user_id: UUID,
        self_description: str | None,
        interests_tags: list[str],
        primary_platforms: list[str],
        target_audience_intents: list[str],
        post_goals: list[str],
    ) -> UserMemoryView:
        existing = await self._repository.get_by_app_user_id(app_user_id)
        now = datetime.now(timezone.utc)
        memory = UserMemory(
            id=existing.id if existing else uuid4(),
            app_user_id=app_user_id,
            self_description=self_description,
            interests_tags=interests_tags,
            primary_platforms=primary_platforms,
            target_audience_intents=target_audience_intents,
            post_goals=post_goals,
            created_at=existing.created_at if existing else now,
            updated_at=now,
        )
        await self._repository.upsert(memory)
        return _to_view(memory)


class GetUserMemoryUseCase:
    def __init__(self, repository: UserMemoryRepository) -> None:
        self._repository = repository

    async def execute(self, *, app_user_id: UUID) -> UserMemoryView | None:
        memory = await self._repository.get_by_app_user_id(app_user_id)
        return _to_view(memory) if memory is not None else None


def _to_view(memory: UserMemory) -> UserMemoryView:
    return UserMemoryView(
        id=memory.id,
        app_user_id=memory.app_user_id,
        self_description=memory.self_description,
        interests_tags=memory.interests_tags,
        primary_platforms=memory.primary_platforms,
        target_audience_intents=memory.target_audience_intents,
        post_goals=memory.post_goals,
        created_at=memory.created_at,
        updated_at=memory.updated_at,
    )
