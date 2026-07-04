from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any
from uuid import UUID, uuid4

from .value_objects import ImageContentType, Platform


@dataclass
class AppUser:
    auth_provider: str
    auth_subject: str
    id: UUID = field(default_factory=uuid4)
    primary_email: str | None = None
    display_name: str | None = None
    status: str = "active"
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class SocialConnection:
    app_user_id: UUID
    provider: str
    provider_account_id: str
    provider_account_urn: str
    id: UUID = field(default_factory=uuid4)
    provider_account_name: str | None = None
    access_token_encrypted: str = ""
    refresh_token_encrypted: str | None = None
    expires_at: datetime | None = None
    scopes: list[str] = field(default_factory=list)
    status: str = "active"
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class UploadedFile:
    app_user_id: UUID
    id: UUID = field(default_factory=uuid4)
    original_filename: str = ""
    storage_key: str = ""
    content_type: ImageContentType | None = None
    size_bytes: int = 0
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class GeneratedPost:
    platform: Platform
    text: str


@dataclass
class AiExecution:
    """Raw AI telemetry retained for a limited debugging window.

    These traces intentionally keep prompts, messages, outputs, and actor identifiers
    so admin operators can debug provider behavior. They are purged on backend startup
    using the configured retention window instead of being kept indefinitely.
    """

    provider: str
    requested_model: str
    kind: str
    status: str
    system_prompt: str
    user_prompt: str
    messages_json: list[dict[str, Any]]
    id: UUID = field(default_factory=uuid4)
    user_id: str | None = None
    draft_id: UUID | None = None
    platform: str | None = None
    action: str | None = None
    openrouter_generation_id: str | None = None
    generation_request_id: str | None = None
    generation_upstream_id: str | None = None
    resolved_model: str | None = None
    resolved_provider: str | None = None
    response_text: str | None = None
    response_reasoning: str | None = None
    response_reasoning_details_json: list[dict[str, Any]] | None = None
    finish_reason: str | None = None
    native_finish_reason: str | None = None
    usage_prompt_tokens: int | None = None
    usage_completion_tokens: int | None = None
    usage_total_tokens: int | None = None
    usage_cost: float | None = None
    usage_is_byok: bool | None = None
    usage_cached_tokens: int | None = None
    usage_cache_write_tokens: int | None = None
    usage_reasoning_tokens: int | None = None
    usage_prompt_cost: float | None = None
    usage_completion_cost: float | None = None
    usage_total_upstream_cost: float | None = None
    generation_latency_ms: int | None = None
    generation_time_ms: int | None = None
    generation_tokens_prompt: int | None = None
    generation_tokens_completion: int | None = None
    generation_native_tokens_prompt: int | None = None
    generation_native_tokens_completion: int | None = None
    generation_native_tokens_reasoning: int | None = None
    generation_native_tokens_cached: int | None = None
    generation_total_cost: float | None = None
    generation_provider_name: str | None = None
    generation_origin: str | None = None
    generation_data_region: str | None = None
    generation_provider_responses_json: list[dict[str, Any]] | None = None
    raw_completion_response_json: dict[str, Any] | None = None
    raw_generation_response_json: dict[str, Any] | None = None
    error_message: str | None = None
    error_json: dict[str, Any] | None = None
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class GeneratedPostResult:
    post: GeneratedPost
    trace: AiExecution


@dataclass
class GenerateJob:
    raw_text: str
    selected_platforms: list[Platform]
    file_ids: list[UUID]
    actor_user_id: str | None = None
    status: str = "queued"
    posts: dict[str, str] = field(default_factory=dict)
    errors: dict[str, dict[str, Any]] = field(default_factory=dict)
    error_code: str | None = None
    error_detail: str | None = None
    error_meta: dict[str, Any] | None = None
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass
class Draft:
    app_user_id: UUID
    raw_text: str
    selected_platforms: list[Platform]
    posts: dict[Platform, str]
    file_ids: list[UUID]
    title: str = ""
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
