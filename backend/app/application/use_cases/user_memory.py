from datetime import datetime, timezone
from uuid import uuid4

from app.application.ports import UserMemoryRepository
from app.domain.entities import UserMemory


class UpsertUserMemoryUseCase:
    def __init__(self, repository: UserMemoryRepository) -> None:
        self._repository = repository

    async def execute(
        self,
        user_id: str,
        self_description: str | None,
        interests_tags: list[str],
        primary_platforms: list[str],
        target_audience_intents: list[str],
        post_goals: list[str],
    ) -> UserMemory:
        existing = await self._repository.get_by_user_id(user_id)
        now = datetime.now(timezone.utc)

        memory = UserMemory(
            id=existing.id if existing else uuid4(),
            user_id=user_id,
            self_description=self_description,
            interests_tags=interests_tags,
            primary_platforms=primary_platforms,
            target_audience_intents=target_audience_intents,
            post_goals=post_goals,
            created_at=existing.created_at if existing else now,
            updated_at=now,
        )
        await self._repository.upsert(memory)
        return memory


class GetUserMemoryUseCase:
    def __init__(self, repository: UserMemoryRepository) -> None:
        self._repository = repository

    async def execute(self, user_id: str) -> UserMemory | None:
        return await self._repository.get_by_user_id(user_id)
