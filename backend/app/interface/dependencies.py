from collections.abc import AsyncIterator
from functools import lru_cache

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.ports import (
    AiExecutionRepository,
    ContentGenerator,
    DraftRepository,
    FileRepository,
    ObjectStorage,
)
from app.application.use_cases.drafts import GetDraftUseCase, ListDraftsUseCase, SaveDraftUseCase
from app.application.use_cases.generate_posts import (
    GeneratePostsUseCase,
    RefinePostUseCase,
)
from app.application.use_cases.upload_files import (
    DeleteFileUseCase,
    GetFileUseCase,
    UploadFilesUseCase,
    UploadLimits,
)
from app.core.config import Settings, get_settings
from app.infrastructure.ai.anthropic_client import AnthropicContentGenerator
from app.infrastructure.ai.openrouter_client import OpenRouterContentGenerator
from app.infrastructure.db.repositories import (
    SqlAlchemyAiExecutionRepository,
    SqlAlchemyDraftRepository,
    SqlAlchemyFileRepository,
)
from app.infrastructure.db.session import Database
from app.infrastructure.storage.minio_storage import MinioObjectStorage


@lru_cache
def _database() -> Database:
    return Database(get_settings().database_url)


@lru_cache
def _storage() -> MinioObjectStorage:
    s = get_settings()
    return MinioObjectStorage(
        endpoint=s.minio_endpoint,
        access_key=s.minio_access_key,
        secret_key=s.minio_secret_key,
        bucket=s.minio_bucket,
        secure=s.minio_secure,
        public_endpoint=s.minio_public_endpoint,
    )


def get_database() -> Database:
    return _database()


def get_object_storage() -> ObjectStorage:
    return _storage()


async def get_session() -> AsyncIterator[AsyncSession]:
    async for session in _database().session():
        yield session


def get_file_repository(session: AsyncSession = Depends(get_session)) -> FileRepository:
    return SqlAlchemyFileRepository(session)


def get_draft_repository(session: AsyncSession = Depends(get_session)) -> DraftRepository:
    return SqlAlchemyDraftRepository(session)


def get_ai_execution_repository(
    session: AsyncSession = Depends(get_session),
) -> AiExecutionRepository:
    return SqlAlchemyAiExecutionRepository(session)


def get_upload_limits(settings: Settings = Depends(get_settings)) -> UploadLimits:
    return UploadLimits(
        max_files=settings.upload_max_files,
        max_file_bytes=settings.upload_max_file_bytes,
    )


def get_upload_use_case(
    storage: ObjectStorage = Depends(get_object_storage),
    repo: FileRepository = Depends(get_file_repository),
    limits: UploadLimits = Depends(get_upload_limits),
) -> UploadFilesUseCase:
    return UploadFilesUseCase(storage=storage, repository=repo, limits=limits)


def get_get_use_case(
    storage: ObjectStorage = Depends(get_object_storage),
    repo: FileRepository = Depends(get_file_repository),
) -> GetFileUseCase:
    return GetFileUseCase(storage=storage, repository=repo)


def get_delete_use_case(
    storage: ObjectStorage = Depends(get_object_storage),
    repo: FileRepository = Depends(get_file_repository),
) -> DeleteFileUseCase:
    return DeleteFileUseCase(storage=storage, repository=repo)


@lru_cache
def _content_generator() -> ContentGenerator:
    s = get_settings()
    if s.ai_provider == "openrouter":
        return OpenRouterContentGenerator(
            api_key=s.openrouter_api_key,
            model=s.openrouter_model,
            max_tokens=s.openrouter_max_tokens,
            temperature=s.openrouter_temperature,
            site_url=s.openrouter_site_url,
            app_name=s.openrouter_app_name,
        )
    return AnthropicContentGenerator(
        api_key=s.anthropic_api_key,
        model=s.anthropic_model,
        max_tokens=s.anthropic_max_tokens,
        temperature=s.anthropic_temperature,
    )


def get_content_generator() -> ContentGenerator:
    return _content_generator()


def get_generate_posts_use_case(
    generator: ContentGenerator = Depends(get_content_generator),
    files: FileRepository = Depends(get_file_repository),
    storage: ObjectStorage = Depends(get_object_storage),
) -> GeneratePostsUseCase:
    return GeneratePostsUseCase(generator=generator, files=files, storage=storage)


def get_refine_post_use_case(
    generator: ContentGenerator = Depends(get_content_generator),
) -> RefinePostUseCase:
    return RefinePostUseCase(generator=generator)


def get_save_draft_use_case(
    drafts: DraftRepository = Depends(get_draft_repository),
) -> SaveDraftUseCase:
    return SaveDraftUseCase(drafts=drafts)


def get_list_drafts_use_case(
    drafts: DraftRepository = Depends(get_draft_repository),
) -> ListDraftsUseCase:
    return ListDraftsUseCase(drafts=drafts)


def get_get_draft_use_case(
    drafts: DraftRepository = Depends(get_draft_repository),
    files: FileRepository = Depends(get_file_repository),
    storage: ObjectStorage = Depends(get_object_storage),
) -> GetDraftUseCase:
    return GetDraftUseCase(drafts=drafts, files=files, storage=storage)
