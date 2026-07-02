from datetime import datetime
from uuid import UUID

from app.application.dto import (
    AiExecutionDetailView,
    AiExecutionListItemView,
    AiUsageSummaryView,
    AiUsageView,
)
from app.application.ports import AiExecutionRepository
from app.domain.entities import AiExecution


class GetAiUsageSummaryUseCase:
    def __init__(self, executions: AiExecutionRepository) -> None:
        self._executions = executions

    async def execute(
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
    ) -> AiUsageSummaryView:
        summary = await self._executions.get_summary(
            kind=kind,
            status=status,
            platform=platform,
            action=action,
            model=model,
            user_id=user_id,
            created_after=created_after,
            created_before=created_before,
        )
        return AiUsageSummaryView(**summary)


class ListAiExecutionsUseCase:
    def __init__(self, executions: AiExecutionRepository) -> None:
        self._executions = executions

    async def execute(
        self,
        *,
        limit: int = 50,
        offset: int = 0,
        kind: str | None = None,
        status: str | None = None,
        platform: str | None = None,
        action: str | None = None,
        model: str | None = None,
        user_id: str | None = None,
        created_after: datetime | None = None,
        created_before: datetime | None = None,
    ) -> list[AiExecutionListItemView]:
        rows = await self._executions.list_recent(
            limit=limit,
            offset=offset,
            kind=kind,
            status=status,
            platform=platform,
            action=action,
            model=model,
            user_id=user_id,
            created_after=created_after,
            created_before=created_before,
        )
        return [
            AiExecutionListItemView(
                id=row.id,
                created_at=row.created_at,
                kind=row.kind,
                status=row.status,
                platform=row.platform,
                action=row.action,
                provider=row.provider,
                requested_model=row.requested_model,
                resolved_model=row.resolved_model,
                resolved_provider=row.resolved_provider,
                generation_id=row.openrouter_generation_id,
                request_id=row.generation_request_id,
                finish_reason=row.finish_reason,
                native_finish_reason=row.native_finish_reason,
                prompt_tokens=row.usage_prompt_tokens,
                completion_tokens=row.usage_completion_tokens,
                total_tokens=row.usage_total_tokens,
                cost=row.usage_cost,
                latency_ms=row.generation_latency_ms,
                error_message=row.error_message,
            )
            for row in rows
        ]


class GetAiExecutionDetailsUseCase:
    def __init__(self, executions: AiExecutionRepository) -> None:
        self._executions = executions

    async def execute(self, execution_id: UUID) -> AiExecutionDetailView | None:
        row = await self._executions.get(execution_id)
        if row is None:
            return None
        return _to_detail_view(row)


def _to_detail_view(row: AiExecution) -> AiExecutionDetailView:
    return AiExecutionDetailView(
        id=row.id,
        created_at=row.created_at,
        kind=row.kind,
        status=row.status,
        platform=row.platform,
        action=row.action,
        provider=row.provider,
        requested_model=row.requested_model,
        resolved_model=row.resolved_model,
        resolved_provider=row.resolved_provider,
        generation_id=row.openrouter_generation_id,
        request_id=row.generation_request_id,
        upstream_id=row.generation_upstream_id,
        finish_reason=row.finish_reason,
        native_finish_reason=row.native_finish_reason,
        system_prompt=row.system_prompt,
        user_prompt=row.user_prompt,
        messages=row.messages_json,
        response_text=row.response_text,
        response_reasoning=row.response_reasoning,
        response_reasoning_details=row.response_reasoning_details_json,
        usage=AiUsageView(
            prompt_tokens=row.usage_prompt_tokens,
            completion_tokens=row.usage_completion_tokens,
            total_tokens=row.usage_total_tokens,
            cost=row.usage_cost,
            cached_tokens=row.usage_cached_tokens,
            reasoning_tokens=row.usage_reasoning_tokens,
            prompt_cost=row.usage_prompt_cost,
            completion_cost=row.usage_completion_cost,
            total_upstream_cost=row.usage_total_upstream_cost,
        ),
        latency_ms=row.generation_latency_ms,
        generation_time_ms=row.generation_time_ms,
        provider_responses=row.generation_provider_responses_json,
        raw_completion_response=row.raw_completion_response_json,
        raw_generation_response=row.raw_generation_response_json,
        error_message=row.error_message,
        error_json=row.error_json,
    )
