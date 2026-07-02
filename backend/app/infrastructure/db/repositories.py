from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.ports import AiExecutionRepository, DraftRepository, FileRepository
from app.domain.entities import AiExecution, Draft, UploadedFile
from app.domain.value_objects import ImageContentType, Platform
from app.infrastructure.db.models import AiExecutionModel, DraftModel, UploadedFileModel


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
        created_after: datetime | None = None,
        created_before: datetime | None = None,
    ) -> list[AiExecution]:
        stmt = select(AiExecutionModel)
        if kind is not None:
            stmt = stmt.where(AiExecutionModel.kind == kind)
        if status is not None:
            stmt = stmt.where(AiExecutionModel.status == status)
        if created_after is not None:
            stmt = stmt.where(AiExecutionModel.created_at >= created_after)
        if created_before is not None:
            stmt = stmt.where(AiExecutionModel.created_at <= created_before)
        result = await self._session.execute(
            stmt.order_by(AiExecutionModel.created_at.desc()).limit(limit)
        )
        return [self._to_entity(model) for model in result.scalars().all()]

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

