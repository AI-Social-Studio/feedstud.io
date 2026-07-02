import logging
from dataclasses import dataclass
from typing import Any
from uuid import UUID

from app.application.dto import ErrorView, GenerateJobAcceptedView, GenerateJobView
from app.application.ports import FileRepository, GenerateJobQueue, GenerateJobRepository
from app.application.use_cases.generate_posts import GeneratePostsInput, GeneratePostsUseCase
from app.domain.entities import GenerateJob
from app.domain.error_codes import ErrorCode
from app.domain.exceptions import DomainError, InvalidGenerateInputError
from app.domain.value_objects import Platform

logger = logging.getLogger(__name__)


@dataclass
class SubmitGenerateJobInput:
    raw_text: str
    platforms: list[Platform]
    file_ids: list[UUID]
    actor_user_id: str | None = None


class SubmitGenerateJobUseCase:
    def __init__(
        self,
        jobs: GenerateJobRepository,
        queue: GenerateJobQueue,
        files: FileRepository,
    ) -> None:
        self._jobs = jobs
        self._queue = queue
        self._files = files

    async def execute(self, payload: SubmitGenerateJobInput) -> GenerateJobAcceptedView:
        _validate_generate_input(payload.raw_text, payload.platforms, payload.file_ids)
        for file_id in payload.file_ids:
            if await self._files.get(file_id) is None:
                raise InvalidGenerateInputError(f"Plik '{file_id}' nie istnieje")

        job = GenerateJob(
            raw_text=payload.raw_text,
            selected_platforms=payload.platforms,
            file_ids=payload.file_ids,
            actor_user_id=payload.actor_user_id,
        )
        await self._jobs.add(job)
        try:
            await self._queue.publish(job.id)
        except Exception:
            await self._jobs.fail(
                job.id,
                from_status="queued",
                code=ErrorCode.INTERNAL_SERVER_ERROR.value,
                detail="Failed to enqueue generate job",
            )
            raise
        return GenerateJobAcceptedView(job_id=job.id, status=job.status)


class GetGenerateJobUseCase:
    def __init__(self, jobs: GenerateJobRepository) -> None:
        self._jobs = jobs

    async def execute(self, job_id: UUID) -> GenerateJobView | None:
        job = await self._jobs.get(job_id)
        if job is None:
            return None
        return _to_job_view(job)


class ProcessGenerateJobUseCase:
    def __init__(self, jobs: GenerateJobRepository, generator: GeneratePostsUseCase) -> None:
        self._jobs = jobs
        self._generator = generator

    async def execute(self, job_id: UUID) -> None:
        job = await self._jobs.get(job_id)
        if job is None or job.status == "completed":
            return
        if not await self._jobs.mark_processing(job_id):
            return

        try:
            result = await self._generator.execute(
                GeneratePostsInput(
                    raw_text=job.raw_text,
                    platforms=job.selected_platforms,
                    file_ids=job.file_ids,
                    actor_user_id=job.actor_user_id,
                )
            )
        except DomainError as exc:
            await self._jobs.fail(
                job_id,
                from_status="processing",
                code=exc.code.value,
                detail=exc.public_message,
                meta=_json_meta(exc.meta),
            )
            return
        except Exception:
            logger.exception("Generate job execution failed", extra={"job_id": str(job_id)})
            await self._jobs.fail(
                job_id,
                from_status="processing",
                code=ErrorCode.INTERNAL_SERVER_ERROR.value,
                detail="Internal server error",
            )
            return

        await self._jobs.complete(
            job_id,
            from_status="processing",
            posts=result.posts,
            errors={
                platform: {
                    "code": error.code.value,
                    "detail": error.detail,
                    "meta": error.meta,
                }
                for platform, error in result.errors.items()
            },
        )


def _validate_generate_input(raw_text: str, platforms: list[Platform], file_ids: list[UUID]) -> None:
    if not platforms:
        raise InvalidGenerateInputError("Wybierz przynajmniej jedną platformę")
    if not raw_text.strip() and not file_ids:
        raise InvalidGenerateInputError("Podaj treść brudnopisu lub załącz pliki")


def _to_job_view(job: GenerateJob) -> GenerateJobView:
    return GenerateJobView(
        job_id=job.id,
        actor_user_id=job.actor_user_id,
        status=job.status,
        posts=job.posts,
        errors={
            platform: ErrorView(
                code=ErrorCode(payload["code"]),
                detail=str(payload["detail"]),
                meta=payload.get("meta") if isinstance(payload.get("meta"), dict) else None,
            )
            for platform, payload in job.errors.items()
            if isinstance(payload, dict) and isinstance(payload.get("code"), str)
        },
        error=(
            ErrorView(
                code=ErrorCode(job.error_code),
                detail=job.error_detail,
                meta=job.error_meta,
            )
            if job.error_code is not None and job.error_detail is not None
            else None
        ),
        created_at=job.created_at,
        updated_at=job.updated_at,
    )


def _json_meta(meta: dict[str, str | int] | None) -> dict[str, Any] | None:
    return dict(meta) if meta is not None else None
