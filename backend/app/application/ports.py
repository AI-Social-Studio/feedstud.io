from abc import ABC, abstractmethod
from datetime import datetime
from typing import BinaryIO
from uuid import UUID

from app.application.dto import (
    PreparedSocialAssetData,
    PublishedPostData,
    SocialOAuthConnectionData,
    SocialOAuthProfileData,
)
from app.domain.entities import (
    AppUser,
    AiExecution,
    Draft,
    GenerateJob,
    GeneratedPostResult,
    Publication,
    PublicationAsset,
    SocialConnection,
    UploadedFile,
    UserMemory,
)
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
    async def get(self, key: str) -> bytes: ...

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


class SocialConnectionRepository(ABC):
    @abstractmethod
    async def add(self, connection: SocialConnection) -> None: ...

    @abstractmethod
    async def update(self, connection: SocialConnection) -> bool: ...

    @abstractmethod
    async def get(
        self, connection_id: UUID, *, app_user_id: UUID | None = None
    ) -> SocialConnection | None: ...

    @abstractmethod
    async def get_by_provider_account(
        self, *, provider: str, provider_account_id: str
    ) -> SocialConnection | None: ...

    @abstractmethod
    async def list_by_user(self, *, app_user_id: UUID) -> list[SocialConnection]: ...

    @abstractmethod
    async def delete(self, connection_id: UUID, *, app_user_id: UUID | None = None) -> bool: ...


class SecretCipher(ABC):
    @abstractmethod
    def encrypt(self, value: str) -> str: ...

    @abstractmethod
    def decrypt(self, value: str) -> str: ...


class SocialOAuthClient(ABC):
    @abstractmethod
    async def get_authorization_url(self, *, redirect_uri: str, app_user_id: UUID) -> str: ...

    @abstractmethod
    async def complete_authorization(
        self,
        *,
        code: str,
        state: str,
        redirect_uri: str,
        app_user_id: UUID,
    ) -> SocialOAuthConnectionData: ...

    @abstractmethod
    async def get_profile(self, *, access_token: str) -> SocialOAuthProfileData: ...


class PublicationRepository(ABC):
    @abstractmethod
    async def add(self, publication: Publication) -> None: ...

    @abstractmethod
    async def get(
        self, publication_id: UUID, *, app_user_id: UUID | None = None
    ) -> Publication | None: ...

    @abstractmethod
    async def list_by_draft(self, *, draft_id: UUID, app_user_id: UUID) -> list[Publication]: ...

    @abstractmethod
    async def claim_due_scheduled(self, *, now: datetime, limit: int) -> list[Publication]: ...

    @abstractmethod
    async def restore_scheduled(self, publication_id: UUID) -> bool: ...

    @abstractmethod
    async def cancel_scheduled(
        self,
        publication_id: UUID,
        *,
        app_user_id: UUID,
        now: datetime,
    ) -> Publication | None: ...

    @abstractmethod
    async def reschedule(
        self,
        publication_id: UUID,
        *,
        app_user_id: UUID,
        scheduled_for: datetime,
        now: datetime,
    ) -> Publication | None: ...

    @abstractmethod
    async def mark_processing(self, publication_id: UUID) -> bool: ...

    @abstractmethod
    async def update_assets(self, publication_id: UUID, assets: list[PublicationAsset]) -> bool: ...

    @abstractmethod
    async def complete(
        self,
        publication_id: UUID,
        *,
        from_status: str,
        external_post_id: str,
        external_post_urn: str,
        external_post_url: str | None,
        published_at: datetime | None,
    ) -> bool: ...

    @abstractmethod
    async def fail(
        self,
        publication_id: UUID,
        *,
        from_status: str,
        code: str,
        detail: str,
    ) -> bool: ...


class PublicationJobQueue(ABC):
    @abstractmethod
    async def publish(self, publication_id: UUID) -> None: ...


class SocialAssetPreparer(ABC):
    @abstractmethod
    async def prepare_image(
        self,
        *,
        access_token: str,
        author_urn: str,
        file: UploadedFile,
        data: bytes,
    ) -> PreparedSocialAssetData: ...


class SocialPublisher(ABC):
    @abstractmethod
    async def publish_post(
        self,
        *,
        access_token: str,
        author_urn: str,
        text: str,
        assets: list[PublicationAsset],
    ) -> PublishedPostData: ...


class ContentGenerator(ABC):
    @abstractmethod
    async def generate(
        self,
        platform: Platform,
        raw_text: str,
        image_urls: list[str],
        memory_context: str = "",
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


class UserMemoryRepository(ABC):
    @abstractmethod
    async def upsert(self, memory: UserMemory) -> None: ...

    @abstractmethod
    async def get_by_app_user_id(self, app_user_id: UUID) -> UserMemory | None: ...
