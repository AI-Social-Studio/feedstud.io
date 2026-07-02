from dataclasses import dataclass
from datetime import datetime
from typing import Any, BinaryIO
from uuid import UUID


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
class GenerateResultView:
    posts: dict[str, str]
    errors: dict[str, str]


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
    title: str
    raw_text: str
    selected_platforms: list[str]
    posts: dict[str, str]
    file_ids: list[UUID]
    created_at: datetime
    updated_at: datetime
    files: list[UploadedFileView]
