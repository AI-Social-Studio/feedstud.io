from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import case, delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.application.ports import (
    AiExecutionRepository,
    DraftRepository,
    FileRepository,
    GenerateJobRepository,
    UserMemoryRepository,
)
from app.domain.entities import AiExecution, Draft, GenerateJob, UploadedFile, UserMemory
from app.domain.value_objects import ImageContentType, Platform
from app.infrastructure.db.models import AiExecutionModel, DraftModel, GenerateJobModel, UploadedFileModel, UserMemoryModel

STALE_JOB_TIMEOUT = timedelta(minutes=15)


class SqlAlchemyFileRepository(FileRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def add(self, file: UploadedFile) -> None:
        assert file.content_type is not None
        model = UploadedFileModel(
            id=file.id,
            original_filename=file.original_filename,
            storage_key=file.storage_key,
            content_type=file.content_type.value,
            extension=file.content_type.extension,
            size_bytes=file.size_bytes,
            created_at=file.created_at,
        )
        self._session.add(model)
        await self._session.commit()

    async def get(self, file_id: UUID) -> UploadedFile | None:
        result = await self._session.execute(
            select(UploadedFileModel).where(UploadedFileModel.id == file_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def list_recent(self, limit: int = 50) -> list[UploadedFile]:
        result = await self._session.execute(
            select(UploadedFileModel)
            .order_by(UploadedFileModel.created_at.desc())
            .limit(limit)
        )
        return [self._to_entity(m) for m in result.scalars().all()]

    async def delete(self, file_id: UUID) -> bool:
        result = await self._session.execute(
            delete(UploadedFileModel).where(UploadedFileModel.id == file_id)
        )
        await self._session.commit()
        return result.rowcount > 0

    @staticmethod
    def _to_entity(model: UploadedFileModel) -> UploadedFile:
        return UploadedFile(
            id=model.id,
            original_filename=model.original_filename,
            storage_key=model.storage_key,
            content_type=ImageContentType(value=model.content_type, extension=model.extension),
            size_bytes=model.size_bytes,
            created_at=model.created_at,
        )


class SqlAlchemyDraftRepository(DraftRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def add(self, draft: Draft) -> None:
        self._session.add(self._to_model(draft))
        await self._session.commit()

    async def update(self, draft: Draft) -> bool:
        model = await self._session.get(DraftModel, draft.id)
        if model is None:
            return False

        model.title = draft.title
        model.raw_text = draft.raw_text
        model.selected_platforms = [platform.value for platform in draft.selected_platforms]
        model.posts = {platform.value: text for platform, text in draft.posts.items()}
        model.file_ids = [str(file_id) for file_id in draft.file_ids]
        model.updated_at = datetime.now(timezone.utc)
        await self._session.commit()
        return True

    async def get(self, draft_id: UUID) -> Draft | None:
        model = await self._session.get(DraftModel, draft_id)
        return self._to_draft(model) if model else None

    async def list_recent(self, limit: int = 50) -> list[Draft]:
        result = await self._session.execute(
            select(DraftModel).order_by(DraftModel.updated_at.desc()).limit(limit)
        )
        return [self._to_draft(model) for model in result.scalars().all()]

    @staticmethod
    def _to_model(draft: Draft) -> DraftModel:
        return DraftModel(
            id=draft.id,
            title=draft.title,
            raw_text=draft.raw_text,
            selected_platforms=[platform.value for platform in draft.selected_platforms],
            posts={platform.value: text for platform, text in draft.posts.items()},
            file_ids=[str(file_id) for file_id in draft.file_ids],
            created_at=draft.created_at,
            updated_at=draft.updated_at,
        )

    @staticmethod
    def _to_draft(model: DraftModel) -> Draft:
        return Draft(
            id=model.id,
            title=model.title,
            raw_text=model.raw_text,
            selected_platforms=[Platform(platform) for platform in model.selected_platforms],
            posts={Platform(platform): text for platform, text in model.posts.items()},
            file_ids=[UUID(file_id) for file_id in model.file_ids],
            created_at=model.created_at,
            updated_at=model.updated_at,
        )


class SqlAlchemyAiExecutionRepository(AiExecutionRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def add(self, execution: AiExecution) -> None:
        self._session.add(self._to_model(execution))
        await self._session.commit()

    async def update_enrichment(self, execution_id: UUID, enrichment: AiExecution) -> bool:
        model = await self._session.get(AiExecutionModel, execution_id)
        if model is None:
            return False

        model.generation_request_id = enrichment.generation_request_id
        model.generation_upstream_id = enrichment.generation_upstream_id
        model.generation_latency_ms = enrichment.generation_latency_ms
        model.generation_time_ms = enrichment.generation_time_ms
        model.generation_tokens_prompt = enrichment.generation_tokens_prompt
        model.generation_tokens_completion = enrichment.generation_tokens_completion
        model.generation_native_tokens_prompt = enrichment.generation_native_tokens_prompt
        model.generation_native_tokens_completion = enrichment.generation_native_tokens_completion
        model.generation_native_tokens_reasoning = enrichment.generation_native_tokens_reasoning
        model.generation_native_tokens_cached = enrichment.generation_native_tokens_cached
        model.generation_total_cost = enrichment.generation_total_cost
        model.generation_provider_name = enrichment.generation_provider_name
        model.generation_origin = enrichment.generation_origin
        model.generation_data_region = enrichment.generation_data_region
        model.generation_provider_responses_json = enrichment.generation_provider_responses_json
        model.raw_generation_response_json = enrichment.raw_generation_response_json
        await self._session.commit()
        return True

    async def get(self, execution_id: UUID) -> AiExecution | None:
        model = await self._session.get(AiExecutionModel, execution_id)
        return self._to_entity(model) if model else None

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
    ) -> list[AiExecution]:
        stmt = self._apply_filters(
            select(AiExecutionModel),
            kind=kind,
            status=status,
            platform=platform,
            action=action,
            model=model,
            user_id=user_id,
            created_after=created_after,
            created_before=created_before,
        )
        result = await self._session.execute(
            stmt.order_by(AiExecutionModel.created_at.desc()).offset(offset).limit(limit)
        )
        return [self._to_entity(model) for model in result.scalars().all()]

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
    ) -> dict[str, float | int]:
        stmt = self._apply_filters(
            select(
                func.count().label("total_requests"),
                func.sum(case((AiExecutionModel.status == "success", 1), else_=0)).label(
                    "success_requests"
                ),
                func.sum(case((AiExecutionModel.status == "error", 1), else_=0)).label(
                    "error_requests"
                ),
                func.coalesce(func.sum(AiExecutionModel.usage_cost), 0.0).label("total_cost"),
                func.coalesce(func.sum(AiExecutionModel.usage_prompt_tokens), 0).label(
                    "total_prompt_tokens"
                ),
                func.coalesce(func.sum(AiExecutionModel.usage_completion_tokens), 0).label(
                    "total_completion_tokens"
                ),
                func.coalesce(func.sum(AiExecutionModel.usage_total_tokens), 0).label(
                    "total_tokens"
                ),
                func.coalesce(func.sum(AiExecutionModel.usage_cached_tokens), 0).label(
                    "total_cached_tokens"
                ),
                func.coalesce(func.sum(AiExecutionModel.usage_reasoning_tokens), 0).label(
                    "total_reasoning_tokens"
                ),
            ),
            kind=kind,
            status=status,
            platform=platform,
            action=action,
            model=model,
            user_id=user_id,
            created_after=created_after,
            created_before=created_before,
        )
        result = (await self._session.execute(stmt)).one()
        total_requests = int(result.total_requests or 0)
        total_cost = float(result.total_cost or 0.0)
        return {
            "total_requests": total_requests,
            "success_requests": int(result.success_requests or 0),
            "error_requests": int(result.error_requests or 0),
            "total_cost": total_cost,
            "total_prompt_tokens": int(result.total_prompt_tokens or 0),
            "total_completion_tokens": int(result.total_completion_tokens or 0),
            "total_tokens": int(result.total_tokens or 0),
            "total_cached_tokens": int(result.total_cached_tokens or 0),
            "total_reasoning_tokens": int(result.total_reasoning_tokens or 0),
            "average_cost_per_request": total_cost / total_requests if total_requests else 0.0,
        }

    async def delete_older_than(self, cutoff: datetime) -> int:
        result = await self._session.execute(
            delete(AiExecutionModel).where(AiExecutionModel.created_at < cutoff)
        )
        await self._session.commit()
        return int(result.rowcount or 0)

    @staticmethod
    def _apply_filters(
        stmt,
        *,
        kind: str | None,
        status: str | None,
        platform: str | None,
        action: str | None,
        model: str | None,
        user_id: str | None,
        created_after: datetime | None,
        created_before: datetime | None,
    ):
        if kind is not None:
            stmt = stmt.where(AiExecutionModel.kind == kind)
        if status is not None:
            stmt = stmt.where(AiExecutionModel.status == status)
        if platform is not None:
            stmt = stmt.where(AiExecutionModel.platform == platform)
        if action is not None:
            stmt = stmt.where(AiExecutionModel.action == action)
        if model is not None:
            stmt = stmt.where(AiExecutionModel.requested_model == model)
        if user_id is not None:
            stmt = stmt.where(AiExecutionModel.user_id == user_id)
        if created_after is not None:
            stmt = stmt.where(AiExecutionModel.created_at >= created_after)
        if created_before is not None:
            stmt = stmt.where(AiExecutionModel.created_at <= created_before)
        return stmt

    @staticmethod
    def _to_model(execution: AiExecution) -> AiExecutionModel:
        return AiExecutionModel(
            id=execution.id,
            provider=execution.provider,
            requested_model=execution.requested_model,
            kind=execution.kind,
            status=execution.status,
            system_prompt=execution.system_prompt,
            user_prompt=execution.user_prompt,
            messages_json=execution.messages_json,
            user_id=execution.user_id,
            draft_id=execution.draft_id,
            platform=execution.platform,
            action=execution.action,
            openrouter_generation_id=execution.openrouter_generation_id,
            generation_request_id=execution.generation_request_id,
            generation_upstream_id=execution.generation_upstream_id,
            resolved_model=execution.resolved_model,
            resolved_provider=execution.resolved_provider,
            response_text=execution.response_text,
            response_reasoning=execution.response_reasoning,
            response_reasoning_details_json=execution.response_reasoning_details_json,
            finish_reason=execution.finish_reason,
            native_finish_reason=execution.native_finish_reason,
            usage_prompt_tokens=execution.usage_prompt_tokens,
            usage_completion_tokens=execution.usage_completion_tokens,
            usage_total_tokens=execution.usage_total_tokens,
            usage_cost=execution.usage_cost,
            usage_is_byok=execution.usage_is_byok,
            usage_cached_tokens=execution.usage_cached_tokens,
            usage_cache_write_tokens=execution.usage_cache_write_tokens,
            usage_reasoning_tokens=execution.usage_reasoning_tokens,
            usage_prompt_cost=execution.usage_prompt_cost,
            usage_completion_cost=execution.usage_completion_cost,
            usage_total_upstream_cost=execution.usage_total_upstream_cost,
            generation_latency_ms=execution.generation_latency_ms,
            generation_time_ms=execution.generation_time_ms,
            generation_tokens_prompt=execution.generation_tokens_prompt,
            generation_tokens_completion=execution.generation_tokens_completion,
            generation_native_tokens_prompt=execution.generation_native_tokens_prompt,
            generation_native_tokens_completion=execution.generation_native_tokens_completion,
            generation_native_tokens_reasoning=execution.generation_native_tokens_reasoning,
            generation_native_tokens_cached=execution.generation_native_tokens_cached,
            generation_total_cost=execution.generation_total_cost,
            generation_provider_name=execution.generation_provider_name,
            generation_origin=execution.generation_origin,
            generation_data_region=execution.generation_data_region,
            generation_provider_responses_json=execution.generation_provider_responses_json,
            raw_completion_response_json=execution.raw_completion_response_json,
            raw_generation_response_json=execution.raw_generation_response_json,
            error_message=execution.error_message,
            error_json=execution.error_json,
            created_at=execution.created_at,
        )

    @staticmethod
    def _to_entity(model: AiExecutionModel) -> AiExecution:
        return AiExecution(
            id=model.id,
            provider=model.provider,
            requested_model=model.requested_model,
            kind=model.kind,
            status=model.status,
            system_prompt=model.system_prompt,
            user_prompt=model.user_prompt,
            messages_json=model.messages_json,
            user_id=model.user_id,
            draft_id=model.draft_id,
            platform=model.platform,
            action=model.action,
            openrouter_generation_id=model.openrouter_generation_id,
            generation_request_id=model.generation_request_id,
            generation_upstream_id=model.generation_upstream_id,
            resolved_model=model.resolved_model,
            resolved_provider=model.resolved_provider,
            response_text=model.response_text,
            response_reasoning=model.response_reasoning,
            response_reasoning_details_json=model.response_reasoning_details_json,
            finish_reason=model.finish_reason,
            native_finish_reason=model.native_finish_reason,
            usage_prompt_tokens=model.usage_prompt_tokens,
            usage_completion_tokens=model.usage_completion_tokens,
            usage_total_tokens=model.usage_total_tokens,
            usage_cost=model.usage_cost,
            usage_is_byok=model.usage_is_byok,
            usage_cached_tokens=model.usage_cached_tokens,
            usage_cache_write_tokens=model.usage_cache_write_tokens,
            usage_reasoning_tokens=model.usage_reasoning_tokens,
            usage_prompt_cost=model.usage_prompt_cost,
            usage_completion_cost=model.usage_completion_cost,
            usage_total_upstream_cost=model.usage_total_upstream_cost,
            generation_latency_ms=model.generation_latency_ms,
            generation_time_ms=model.generation_time_ms,
            generation_tokens_prompt=model.generation_tokens_prompt,
            generation_tokens_completion=model.generation_tokens_completion,
            generation_native_tokens_prompt=model.generation_native_tokens_prompt,
            generation_native_tokens_completion=model.generation_native_tokens_completion,
            generation_native_tokens_reasoning=model.generation_native_tokens_reasoning,
            generation_native_tokens_cached=model.generation_native_tokens_cached,
            generation_total_cost=model.generation_total_cost,
            generation_provider_name=model.generation_provider_name,
            generation_origin=model.generation_origin,
            generation_data_region=model.generation_data_region,
            generation_provider_responses_json=model.generation_provider_responses_json,
            raw_completion_response_json=model.raw_completion_response_json,
            raw_generation_response_json=model.raw_generation_response_json,
            error_message=model.error_message,
            error_json=model.error_json,
            created_at=model.created_at,
        )


class SqlAlchemyGenerateJobRepository(GenerateJobRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def add(self, job: GenerateJob) -> None:
        self._session.add(self._to_model(job))
        await self._session.commit()

    async def get(self, job_id: UUID) -> GenerateJob | None:
        model = await self._session.get(GenerateJobModel, job_id)
        return self._to_entity(model) if model else None

    async def mark_processing(self, job_id: UUID) -> bool:
        now = datetime.now(timezone.utc)
        stale_cutoff = now - STALE_JOB_TIMEOUT
        result = await self._session.execute(
            update(GenerateJobModel)
            .where(GenerateJobModel.id == job_id)
            .where(
                (GenerateJobModel.status == "queued")
                | (
                    (GenerateJobModel.status == "processing")
                    & (GenerateJobModel.updated_at < stale_cutoff)
                )
            )
            .values(status="processing", updated_at=now)
        )
        await self._session.commit()
        return result.rowcount == 1

    async def complete(
        self,
        job_id: UUID,
        *,
        from_status: str,
        posts: dict[str, str],
        errors: dict[str, dict[str, object]],
    ) -> bool:
        result = await self._session.execute(
            update(GenerateJobModel)
            .where(
                GenerateJobModel.id == job_id,
                GenerateJobModel.status == from_status,
            )
            .values(
                status="completed",
                posts=posts,
                errors=errors,
                error_code=None,
                error_detail=None,
                error_meta=None,
                updated_at=datetime.now(timezone.utc),
            )
        )
        await self._session.commit()
        return result.rowcount == 1

    async def fail(
        self,
        job_id: UUID,
        *,
        from_status: str,
        code: str,
        detail: str,
        meta: dict[str, object] | None = None,
    ) -> bool:
        result = await self._session.execute(
            update(GenerateJobModel)
            .where(
                GenerateJobModel.id == job_id,
                GenerateJobModel.status == from_status,
            )
            .values(
                status="failed",
                error_code=code,
                error_detail=detail,
                error_meta=meta,
                updated_at=datetime.now(timezone.utc),
            )
        )
        await self._session.commit()
        return result.rowcount == 1

    @staticmethod
    def _to_model(job: GenerateJob) -> GenerateJobModel:
        return GenerateJobModel(
            id=job.id,
            raw_text=job.raw_text,
            selected_platforms=[platform.value for platform in job.selected_platforms],
            file_ids=[str(file_id) for file_id in job.file_ids],
            actor_user_id=job.actor_user_id,
            status=job.status,
            posts=job.posts,
            errors=job.errors,
            error_code=job.error_code,
            error_detail=job.error_detail,
            error_meta=job.error_meta,
            created_at=job.created_at,
            updated_at=job.updated_at,
        )

    @staticmethod
    def _to_entity(model: GenerateJobModel) -> GenerateJob:
        return GenerateJob(
            id=model.id,
            raw_text=model.raw_text,
            selected_platforms=[Platform(platform) for platform in model.selected_platforms],
            file_ids=[UUID(file_id) for file_id in model.file_ids],
            actor_user_id=model.actor_user_id,
            status=model.status,
            posts=model.posts,
            errors=model.errors,
            error_code=model.error_code,
            error_detail=model.error_detail,
            error_meta=model.error_meta,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )


class SqlAlchemyUserMemoryRepository(UserMemoryRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def upsert(self, memory: UserMemory) -> None:
        stmt = (
            pg_insert(UserMemoryModel)
            .values(
                id=memory.id,
                user_id=memory.user_id,
                self_description=memory.self_description,
                interests_tags=memory.interests_tags,
                primary_platforms=memory.primary_platforms,
                target_audience_intents=memory.target_audience_intents,
                post_goals=memory.post_goals,
                created_at=memory.created_at,
                updated_at=memory.updated_at,
            )
            .on_conflict_do_update(
                index_elements=["user_id"],
                set_={
                    "self_description": memory.self_description,
                    "interests_tags": memory.interests_tags,
                    "primary_platforms": memory.primary_platforms,
                    "target_audience_intents": memory.target_audience_intents,
                    "post_goals": memory.post_goals,
                    "updated_at": memory.updated_at,
                },
            )
        )
        await self._session.execute(stmt)
        await self._session.commit()

    async def get_by_user_id(self, user_id: str) -> UserMemory | None:
        result = await self._session.execute(
            select(UserMemoryModel).where(UserMemoryModel.user_id == user_id)
        )
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    @staticmethod
    def _to_entity(model: UserMemoryModel) -> UserMemory:
        return UserMemory(
            id=model.id,
            user_id=model.user_id,
            self_description=model.self_description,
            interests_tags=model.interests_tags,
            primary_platforms=model.primary_platforms,
            target_audience_intents=model.target_audience_intents,
            post_goals=model.post_goals,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
