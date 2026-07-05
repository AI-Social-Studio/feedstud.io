from collections.abc import AsyncIterator
from functools import lru_cache

from fastapi import Depends, Header, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.ports import (
    AiExecutionRepository,
    ContentGenerator,
    DraftRepository,
    FileRepository,
    GenerateJobQueue,
    GenerateJobRepository,
    ObjectStorage,
    UserMemoryRepository,
)
from app.application.use_cases.drafts import GetDraftUseCase, ListDraftsUseCase, SaveDraftUseCase
from app.application.use_cases.admin_ai_usage import (
    GetAiExecutionDetailsUseCase,
    GetAiUsageSummaryUseCase,
    ListAiExecutionsUseCase,
)
from app.application.use_cases.generate_jobs import GetGenerateJobUseCase, SubmitGenerateJobUseCase
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
from app.application.use_cases.user_memory import GetUserMemoryUseCase, UpsertUserMemoryUseCase
from app.core.config import Settings, get_settings
from app.domain.error_codes import ErrorCode
from app.infrastructure.ai.openrouter_client import OpenRouterContentGenerator
from app.infrastructure.db.repositories import (
    SqlAlchemyAiExecutionRepository,
    SqlAlchemyDraftRepository,
    SqlAlchemyFileRepository,
    SqlAlchemyGenerateJobRepository,
    SqlAlchemyUserMemoryRepository,
)
from app.infrastructure.messaging.rabbitmq import RabbitMqGenerateJobQueue
from app.infrastructure.db.session import Database
from app.infrastructure.storage.minio_storage import MinioObjectStorage
from app.interface.errors import api_error


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


def get_generate_job_repository(
    session: AsyncSession = Depends(get_session),
) -> GenerateJobRepository:
    return SqlAlchemyGenerateJobRepository(session)


def get_ai_usage_summary_use_case(
    executions: AiExecutionRepository = Depends(get_ai_execution_repository),
) -> GetAiUsageSummaryUseCase:
    return GetAiUsageSummaryUseCase(executions=executions)


def get_list_ai_executions_use_case(
    executions: AiExecutionRepository = Depends(get_ai_execution_repository),
) -> ListAiExecutionsUseCase:
    return ListAiExecutionsUseCase(executions=executions)


def get_ai_execution_details_use_case(
    executions: AiExecutionRepository = Depends(get_ai_execution_repository),
) -> GetAiExecutionDetailsUseCase:
    return GetAiExecutionDetailsUseCase(executions=executions)


def require_internal_backend_request(
    backend_token: str | None = Header(default=None, alias="X-Backend-Token"),
    settings: Settings = Depends(get_settings),
) -> None:
    if not settings.backend_internal_api_key:
        raise api_error(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            ErrorCode.BACKEND_AUTH_NOT_CONFIGURED,
            "Backend internal auth is not configured",
        )
    if backend_token != settings.backend_internal_api_key:
        raise api_error(
            status.HTTP_401_UNAUTHORIZED,
            ErrorCode.UNAUTHORIZED,
            "Unauthorized",
        )


def get_trusted_actor_user_id(
    _: None = Depends(require_internal_backend_request),
    actor_user_id: str | None = Header(default=None, alias="X-Actor-Id"),
) -> str | None:
    return actor_user_id


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
    return OpenRouterContentGenerator(
        api_key=s.openrouter_api_key,
        model=s.openrouter_model,
        max_tokens=s.openrouter_max_tokens,
        temperature=s.openrouter_temperature,
        site_url=s.openrouter_site_url,
        app_name=s.openrouter_app_name,
    )


def get_content_generator() -> ContentGenerator:
    return _content_generator()


@lru_cache
def _generate_job_queue() -> GenerateJobQueue:
    settings = get_settings()
    return RabbitMqGenerateJobQueue(settings.rabbitmq_url, settings.rabbitmq_generate_queue)


def get_generate_job_queue() -> GenerateJobQueue:
    return _generate_job_queue()


def get_generate_posts_use_case(
    generator: ContentGenerator = Depends(get_content_generator),
    files: FileRepository = Depends(get_file_repository),
    storage: ObjectStorage = Depends(get_object_storage),
    executions: AiExecutionRepository = Depends(get_ai_execution_repository),
) -> GeneratePostsUseCase:
    return GeneratePostsUseCase(
        generator=generator,
        files=files,
        storage=storage,
        executions=executions,
    )


def get_submit_generate_job_use_case(
    jobs: GenerateJobRepository = Depends(get_generate_job_repository),
    queue: GenerateJobQueue = Depends(get_generate_job_queue),
    files: FileRepository = Depends(get_file_repository),
) -> SubmitGenerateJobUseCase:
    return SubmitGenerateJobUseCase(jobs=jobs, queue=queue, files=files)


def get_get_generate_job_use_case(
    jobs: GenerateJobRepository = Depends(get_generate_job_repository),
) -> GetGenerateJobUseCase:
    return GetGenerateJobUseCase(jobs=jobs)


def get_refine_post_use_case(
    generator: ContentGenerator = Depends(get_content_generator),
    executions: AiExecutionRepository = Depends(get_ai_execution_repository),
) -> RefinePostUseCase:
    return RefinePostUseCase(generator=generator, executions=executions)


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


def get_user_memory_repository(
    session: AsyncSession = Depends(get_session),
) -> UserMemoryRepository:
    return SqlAlchemyUserMemoryRepository(session)


def get_upsert_user_memory_use_case(
    repo: UserMemoryRepository = Depends(get_user_memory_repository),
) -> UpsertUserMemoryUseCase:
    return UpsertUserMemoryUseCase(repository=repo)


def get_get_user_memory_use_case(
    repo: UserMemoryRepository = Depends(get_user_memory_repository),
) -> GetUserMemoryUseCase:
    return GetUserMemoryUseCase(repository=repo)
