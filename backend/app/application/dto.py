from dataclasses import dataclass
from datetime import datetime
from typing import Any, BinaryIO
from uuid import UUID

from app.domain.error_codes import ErrorCode


@dataclass
class IncomingFile:
    filename: str
    content_type: str
    size: int
    stream: BinaryIO


@dataclass
class UploadedFileView:
    id: UUID
    original_filename: str
    content_type: str
    size_bytes: int
    url: str
    created_at: datetime


@dataclass
class SocialConnectionView:
    id: UUID
    provider: str
    provider_account_id: str
    provider_account_urn: str
    provider_account_name: str | None
    expires_at: datetime | None
    scopes: list[str]
    status: str
    created_at: datetime
    updated_at: datetime


@dataclass
class SocialConnectionStartView:
    authorization_url: str


@dataclass
class SocialOAuthConnectionData:
    provider: str
    provider_account_id: str
    provider_account_urn: str
    access_token: str
    refresh_token: str | None
    expires_at: datetime | None
    scopes: list[str]
    provider_account_name: str | None = None


@dataclass
class PublishedPostData:
    external_post_id: str
    external_post_urn: str
    external_post_url: str | None
    published_at: datetime | None = None


@dataclass
class PreparedSocialAssetData:
    provider_asset_id: str
    provider_asset_urn: str


@dataclass
class PublicationAssetView:
    id: UUID
    uploaded_file_id: UUID
    sort_order: int
    provider_asset_id: str | None
    provider_asset_urn: str | None
    alt_text: str | None
    created_at: datetime


@dataclass
class PublicationView:
    id: UUID
    draft_id: UUID
    provider: str
    social_connection_id: UUID
    status: str
    mode: str
    platform_text: str
    external_post_id: str | None
    external_post_urn: str | None
    external_post_url: str | None
    error_code: str | None
    error_detail: str | None
    created_at: datetime
    updated_at: datetime
    published_at: datetime | None
    assets: list[PublicationAssetView]


@dataclass
class ErrorView:
    code: ErrorCode
    detail: str
    meta: dict[str, Any] | None = None


@dataclass
class GenerateResultView:
    posts: dict[str, str]
    errors: dict[str, ErrorView]


@dataclass
class GenerateJobAcceptedView:
    job_id: UUID
    status: str


@dataclass
class GenerateJobView:
    job_id: UUID
    actor_user_id: str | None
    status: str
    posts: dict[str, str]
    errors: dict[str, ErrorView]
    error: ErrorView | None
    created_at: datetime
    updated_at: datetime


@dataclass
class AiUsageView:
    prompt_tokens: int | None
    completion_tokens: int | None
    total_tokens: int | None
    cost: float | None
    cached_tokens: int | None
    reasoning_tokens: int | None
    prompt_cost: float | None
    completion_cost: float | None
    total_upstream_cost: float | None


@dataclass
class AiExecutionTraceView:
    execution_id: UUID
    provider: str
    requested_model: str
    resolved_model: str | None
    resolved_provider: str | None
    generation_id: str | None
    request_id: str | None
    upstream_id: str | None
    finish_reason: str | None
    native_finish_reason: str | None
    response_text: str | None
    response_reasoning: str | None
    response_reasoning_details: list[dict[str, Any]] | None
    messages: list[dict[str, Any]]
    raw_completion_response: dict[str, Any] | None
    raw_generation_response: dict[str, Any] | None
    usage: AiUsageView


@dataclass
class GeneratedPostResultView:
    platform: str
    text: str
    trace: AiExecutionTraceView


@dataclass
class AiUsageSummaryView:
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


@dataclass
class AiExecutionListItemView:
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


@dataclass
class AiExecutionDetailView:
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
    messages: list[dict[str, Any]]
    response_text: str | None
    response_reasoning: str | None
    response_reasoning_details: list[dict[str, Any]] | None
    usage: AiUsageView
    latency_ms: int | None
    generation_time_ms: int | None
    provider_responses: list[dict[str, Any]] | None
    raw_completion_response: dict[str, Any] | None
    raw_generation_response: dict[str, Any] | None
    error_message: str | None
    error_json: dict[str, Any] | None


@dataclass
class DraftSummaryView:
    id: UUID
    title: str
    selected_platforms: list[str]
    posts_count: int
    raw_text_preview: str
    updated_at: datetime
    created_at: datetime


@dataclass
class DraftView:
    id: UUID
    app_user_id: UUID
    title: str
    raw_text: str
    selected_platforms: list[str]
    posts: dict[str, str]
    file_ids: list[UUID]
    created_at: datetime
    updated_at: datetime
    files: list[UploadedFileView]
