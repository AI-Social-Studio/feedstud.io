from abc import ABC, abstractmethod
from datetime import datetime
from typing import BinaryIO
from uuid import UUID

from app.domain.entities import AppUser, AiExecution, Draft, GenerateJob, GeneratedPostResult, UploadedFile
from app.domain.value_objects import Platform, RefineAction


class ObjectStorage(ABC):
    @abstractmethod
    async def put(
        self,
        key: str,
        data: BinaryIO,
        size: int,
        content_type: str,
    ) -> None: ...

    @abstractmethod
    async def presigned_get_url(self, key: str, expires_seconds: int = 3600) -> str: ...

    @abstractmethod
    async def delete(self, key: str) -> None: ...


class FileRepository(ABC):
    @abstractmethod
    async def add(self, file: UploadedFile) -> None: ...

    @abstractmethod
    async def get(self, file_id: UUID, *, app_user_id: UUID | None = None) -> UploadedFile | None: ...

    @abstractmethod
    async def list_recent(
        self, limit: int = 50, *, app_user_id: UUID | None = None
    ) -> list[UploadedFile]: ...

    @abstractmethod
    async def delete(self, file_id: UUID, *, app_user_id: UUID | None = None) -> bool: ...


class AppUserRepository(ABC):
    @abstractmethod
    async def get_by_auth_identity(self, *, provider: str, subject: str) -> AppUser | None: ...

    @abstractmethod
    async def add(self, app_user: AppUser) -> None: ...


class ContentGenerator(ABC):
    @abstractmethod
    async def generate(
        self,
        platform: Platform,
        raw_text: str,
        image_urls: list[str],
    ) -> GeneratedPostResult: ...

    @abstractmethod
    async def refine(
        self,
        platform: Platform,
        text: str,
        action: RefineAction,
    ) -> GeneratedPostResult: ...


class AiExecutionRepository(ABC):
    @abstractmethod
    async def add(self, execution: AiExecution) -> None: ...

    @abstractmethod
    async def update_enrichment(self, execution_id: UUID, enrichment: AiExecution) -> bool: ...

    @abstractmethod
    async def get(self, execution_id: UUID) -> AiExecution | None: ...

    @abstractmethod
    async def list_recent(
        self,
        limit: int = 50,
        *,
        kind: str | None = None,
        status: str | None = None,
        platform: str | None = None,
        action: str | None = None,
        model: str | None = None,
        user_id: str | None = None,
        offset: int = 0,
        created_after: datetime | None = None,
        created_before: datetime | None = None,
    ) -> list[AiExecution]: ...

    @abstractmethod
    async def get_summary(
        self,
        *,
        kind: str | None = None,
        status: str | None = None,
        platform: str | None = None,
        action: str | None = None,
        model: str | None = None,
        user_id: str | None = None,
        created_after: datetime | None = None,
        created_before: datetime | None = None,
    ) -> dict[str, float | int]: ...

    @abstractmethod
    async def delete_older_than(self, cutoff: datetime) -> int: ...


class GenerateJobRepository(ABC):
    @abstractmethod
    async def add(self, job: GenerateJob) -> None: ...

    @abstractmethod
    async def get(self, job_id: UUID) -> GenerateJob | None: ...

    @abstractmethod
    async def mark_processing(self, job_id: UUID) -> bool: ...

    @abstractmethod
    async def complete(
        self,
        job_id: UUID,
        *,
        from_status: str,
        posts: dict[str, str],
        errors: dict[str, dict[str, object]],
    ) -> bool: ...

    @abstractmethod
    async def fail(
        self,
        job_id: UUID,
        *,
        from_status: str,
        code: str,
        detail: str,
        meta: dict[str, object] | None = None,
    ) -> bool: ...


class GenerateJobQueue(ABC):
    @abstractmethod
    async def publish(self, job_id: UUID) -> None: ...


class DraftRepository(ABC):
    @abstractmethod
    async def add(self, draft: Draft) -> None: ...

    @abstractmethod
    async def update(self, draft: Draft) -> bool: ...

    @abstractmethod
    async def get(self, draft_id: UUID, *, app_user_id: UUID | None = None) -> Draft | None: ...

    @abstractmethod
    async def list_recent(self, limit: int = 50, *, app_user_id: UUID | None = None) -> list[Draft]: ...
