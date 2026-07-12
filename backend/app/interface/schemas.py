from datetime import datetime
from typing import Annotated, Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field, StringConstraints


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
    app_user_id: UUID
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


# Constrained string types for per-item validation in list fields
_ShortId = Annotated[str, StringConstraints(max_length=50)]
_FreeText = Annotated[str, StringConstraints(max_length=60)]


class UserMemoryRequest(BaseModel):
    self_description: str | None = Field(
        default=None,
        max_length=120,
        description="Short free-text identity label",
    )
    interests_tags: list[_FreeText] = Field(
        default_factory=list,
        max_length=5,
        description="Up to 5 topic keywords",
    )
    primary_platforms: list[_ShortId] = Field(
        default_factory=list,
        max_length=5,
        description="Platform IDs the user targets",
    )
    target_audience_intents: list[_FreeText] = Field(
        default_factory=list,
        max_length=5,
        description="Audience segment IDs or custom free-text",
    )
    post_goals: list[_ShortId] = Field(
        default_factory=list,
        max_length=2,
        description="Up to 2 goal IDs",
    )


class UserMemoryResponse(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    app_user_id: UUID
    self_description: str | None
    interests_tags: list[str]
    primary_platforms: list[str]
    target_audience_intents: list[str]
    post_goals: list[str]
    created_at: datetime
    updated_at: datetime


class SocialConnectionResponse(BaseModel):
    id: UUID
    provider: str
    provider_account_id: str
    provider_account_urn: str
    provider_account_name: str | None
    provider_profile_image_url: str | None
    expires_at: datetime | None
    scopes: list[str]
    status: str
    created_at: datetime
    updated_at: datetime


class SocialConnectionStartResponse(BaseModel):
    authorization_url: str


class PublicationAssetResponse(BaseModel):
    id: UUID
    uploaded_file_id: UUID
    sort_order: int
    provider_asset_id: str | None
    provider_asset_urn: str | None
    alt_text: str | None
    created_at: datetime


class CreatePublicationRequest(BaseModel):
    provider: Literal["linkedin"]
    mode: Literal["publish_now", "schedule"]
    draft_id: UUID
    social_connection_id: UUID
    text: str = Field(..., min_length=1)
    file_ids: list[UUID] = Field(default_factory=list)
    asset_order: list[UUID] = Field(default_factory=list)
    asset_alt_texts: dict[UUID, str] = Field(default_factory=dict)
    scheduled_for: datetime | None = None


class ReschedulePublicationRequest(BaseModel):
    scheduled_for: datetime


class ScheduledPublicationListItemResponse(BaseModel):
    id: UUID
    draft_id: UUID
    provider: Literal["linkedin"]
    social_connection_id: UUID
    status: Literal["scheduled", "queued"]
    mode: Literal["publish_now", "schedule"]
    platform_text: str
    created_at: datetime
    updated_at: datetime
    published_at: datetime | None
    scheduled_for: datetime | None
    queued_at: datetime | None
    schedule_released_at: datetime | None
    provider_account_name: str | None
    draft_title: str
    asset_count: int


class PublicationResponse(BaseModel):
    id: UUID
    draft_id: UUID
    provider: Literal["linkedin"]
    social_connection_id: UUID
    status: Literal["scheduled", "queued", "processing", "completed", "failed", "cancelled"]
    mode: Literal["publish_now", "schedule"]
    platform_text: str
    external_post_id: str | None
    external_post_urn: str | None
    external_post_url: str | None
    error_code: str | None
    error_detail: str | None
    created_at: datetime
    updated_at: datetime
    published_at: datetime | None
    scheduled_for: datetime | None
    queued_at: datetime | None
    schedule_released_at: datetime | None
    assets: list[PublicationAssetResponse]
