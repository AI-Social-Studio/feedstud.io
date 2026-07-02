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
