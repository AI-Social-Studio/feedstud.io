from datetime import datetime
from dataclasses import dataclass
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.application.use_cases.admin_ai_usage import (
    GetAiExecutionDetailsUseCase,
    GetAiUsageSummaryUseCase,
    ListAiExecutionsUseCase,
)
from app.interface.dependencies import (
    get_ai_execution_details_use_case,
    get_ai_usage_summary_use_case,
    get_list_ai_executions_use_case,
    require_internal_backend_request,
)
from app.interface.schemas import (
    AiExecutionDetailResponse,
    AiExecutionListItemResponse,
    AiUsageResponse,
    AiUsageSummaryResponse,
)

router = APIRouter(
    prefix="/admin/ai-usage",
    tags=["admin-ai-usage"],
    dependencies=[Depends(require_internal_backend_request)],
)


@dataclass
class AiUsageFiltersQuery:
    kind: str | None = None
    status: str | None = None
    platform: str | None = None
    action: str | None = None
    model: str | None = None
    user_id: str | None = None
    created_after: datetime | None = None
    created_before: datetime | None = None


def get_ai_usage_filters(
    kind: str | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
    platform: str | None = Query(default=None),
    action: str | None = Query(default=None),
    model: str | None = Query(default=None),
    user_id: str | None = Query(default=None),
    created_after: datetime | None = Query(default=None, alias="from"),
    created_before: datetime | None = Query(default=None, alias="to"),
) -> AiUsageFiltersQuery:
    return AiUsageFiltersQuery(
        kind=kind,
        status=status_filter,
        platform=platform,
        action=action,
        model=model,
        user_id=user_id,
        created_after=created_after,
        created_before=created_before,
    )


@router.get("/summary", response_model=AiUsageSummaryResponse, summary="Get AI usage summary")
async def get_ai_usage_summary(
    filters: AiUsageFiltersQuery = Depends(get_ai_usage_filters),
    use_case: GetAiUsageSummaryUseCase = Depends(get_ai_usage_summary_use_case),
) -> AiUsageSummaryResponse:
    summary = await use_case.execute(
        kind=filters.kind,
        status=filters.status,
        platform=filters.platform,
        action=filters.action,
        model=filters.model,
        user_id=filters.user_id,
        created_after=filters.created_after,
        created_before=filters.created_before,
    )
    return AiUsageSummaryResponse(**summary.__dict__)


@router.get(
    "/executions",
    response_model=list[AiExecutionListItemResponse],
    summary="List AI executions",
)
async def list_ai_executions(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    filters: AiUsageFiltersQuery = Depends(get_ai_usage_filters),
    use_case: ListAiExecutionsUseCase = Depends(get_list_ai_executions_use_case),
) -> list[AiExecutionListItemResponse]:
    rows = await use_case.execute(
        limit=limit,
        offset=offset,
        kind=filters.kind,
        status=filters.status,
        platform=filters.platform,
        action=filters.action,
        model=filters.model,
        user_id=filters.user_id,
        created_after=filters.created_after,
        created_before=filters.created_before,
    )
    return [AiExecutionListItemResponse(**row.__dict__) for row in rows]


@router.get(
    "/executions/{execution_id}",
    response_model=AiExecutionDetailResponse,
    summary="Get AI execution details",
)
async def get_ai_execution_details(
    execution_id: UUID,
    use_case: GetAiExecutionDetailsUseCase = Depends(get_ai_execution_details_use_case),
) -> AiExecutionDetailResponse:
    execution = await use_case.execute(execution_id)
    if execution is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="AI execution not found")
    payload = execution.__dict__.copy()
    payload["usage"] = AiUsageResponse(**execution.usage.__dict__)
    return AiExecutionDetailResponse(**payload)
