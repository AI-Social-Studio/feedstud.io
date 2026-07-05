from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field


PlatformLiteral = Literal["linkedin", "instagram", "x"]
RefineActionLiteral = Literal["hook", "shorten", "formal", "casual", "cta", "hashtags"]


class UploadedFileResponse(BaseModel):
    id: UUID
    filename: str = Field(..., description="Original filename provided by client")
    content_type: str
    size_bytes: int
    url: str = Field(..., description="Presigned GET URL valid for 1 hour")
    created_at: datetime


class UploadResponse(BaseModel):
    files: list[UploadedFileResponse]


class ErrorResponse(BaseModel):
    detail: str
    code: str
    meta: dict[str, Any] | None = None


class PlatformErrorResponse(ErrorResponse):
    pass


class GenerateRequest(BaseModel):
    raw: str = Field(default="", description="Brudnopis użytkownika (PL)")
    platforms: list[PlatformLiteral] = Field(
        ..., min_length=1, description="linkedin | instagram | x"
    )
    file_ids: list[UUID] = Field(default_factory=list)


class GenerateResponse(BaseModel):
    posts: dict[str, str] = Field(
        default_factory=dict,
        description="Mapa platform -> gotowy post (PL, z \\n\\n, hashtagi w ostatniej linii)",
    )
    errors: dict[str, PlatformErrorResponse] = Field(
        default_factory=dict,
        description="Mapa platform -> strukturalny błąd generacji dla danej platformy",
    )


class GenerateAcceptedResponse(BaseModel):
    job_id: UUID
    status: Literal["queued"]


class GenerateJobResponse(BaseModel):
    job_id: UUID
    status: Literal["queued", "processing", "completed", "failed"]
    posts: dict[str, str] = Field(default_factory=dict)
    errors: dict[str, PlatformErrorResponse] = Field(default_factory=dict)
    error: ErrorResponse | None = None
    created_at: datetime
    updated_at: datetime


class RefineRequest(BaseModel):
    platform: PlatformLiteral
    text: str = Field(..., min_length=1)
    action: RefineActionLiteral


class RefineResponse(BaseModel):
    text: str


class SaveDraftRequest(BaseModel):
    title: str = Field(default="", max_length=120)
    raw: str = Field(default="")
    platforms: list[PlatformLiteral] = Field(default_factory=list)
    posts: dict[str, str] = Field(default_factory=dict)
    file_ids: list[UUID] = Field(default_factory=list)


class DraftSummaryResponse(BaseModel):
    id: UUID
    title: str
    selected_platforms: list[PlatformLiteral]
    posts_count: int
    raw_text_preview: str
    updated_at: datetime
    created_at: datetime


class DraftResponse(BaseModel):
    id: UUID
    title: str
    raw: str
    platforms: list[PlatformLiteral]
    posts: dict[str, str]
    file_ids: list[UUID]
    created_at: datetime
    updated_at: datetime
    files: list[UploadedFileResponse]


class AiUsageResponse(BaseModel):
    prompt_tokens: int | None
    completion_tokens: int | None
    total_tokens: int | None
    cost: float | None
    cached_tokens: int | None
    reasoning_tokens: int | None
    prompt_cost: float | None
    completion_cost: float | None
    total_upstream_cost: float | None


class AiUsageSummaryResponse(BaseModel):
    total_requests: int
    success_requests: int
    error_requests: int
    total_cost: float
    total_prompt_tokens: int
    total_completion_tokens: int
    total_tokens: int
    total_cached_tokens: int
    total_reasoning_tokens: int
    average_cost_per_request: float


class AiExecutionListItemResponse(BaseModel):
    id: UUID
    created_at: datetime
    kind: str
    status: str
    user_id: str | None
    platform: str | None
    action: str | None
    provider: str
    requested_model: str
    resolved_model: str | None
    resolved_provider: str | None
    generation_id: str | None
    request_id: str | None
    finish_reason: str | None
    native_finish_reason: str | None
    prompt_tokens: int | None
    completion_tokens: int | None
    total_tokens: int | None
    cost: float | None
    latency_ms: int | None
    error_message: str | None


class AiExecutionDetailResponse(BaseModel):
    id: UUID
    created_at: datetime
    kind: str
    status: str
    user_id: str | None
    platform: str | None
    action: str | None
    provider: str
    requested_model: str
    resolved_model: str | None
    resolved_provider: str | None
    generation_id: str | None
    request_id: str | None
    upstream_id: str | None
    finish_reason: str | None
    native_finish_reason: str | None
    system_prompt: str
    user_prompt: str
    messages: list[dict]
    response_text: str | None
    response_reasoning: str | None
    response_reasoning_details: list[dict] | None
    usage: AiUsageResponse
    latency_ms: int | None
    generation_time_ms: int | None
    provider_responses: list[dict] | None
    raw_completion_response: dict | None
    raw_generation_response: dict | None
    error_message: str | None
    error_json: dict | None


class UserMemoryRequest(BaseModel):
    self_description: str | None = Field(
        default=None,
        max_length=120,
        description="Short free-text identity label",
    )
    interests_tags: list[str] = Field(
        default_factory=list,
        max_length=5,
        description="Up to 5 topic keywords",
    )
    primary_platforms: list[str] = Field(
        default_factory=list,
        max_length=5,
        description="Platform IDs the user targets",
    )
    target_audience_intents: list[str] = Field(
        default_factory=list,
        max_length=5,
        description="Audience segment IDs or custom free-text",
    )
    post_goals: list[str] = Field(
        default_factory=list,
        max_length=2,
        description="Up to 2 goal IDs",
    )


class UserMemoryResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    user_id: str
    self_description: str | None
    interests_tags: list[str]
    primary_platforms: list[str]
    target_audience_intents: list[str]
    post_goals: list[str]
    created_at: datetime
    updated_at: datetime
