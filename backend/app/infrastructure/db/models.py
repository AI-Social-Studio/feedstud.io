from datetime import datetime
from uuid import UUID

from sqlalchemy import BigInteger, CheckConstraint, DateTime, Float, Index, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID as PgUUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class AppUserModel(Base):
    __tablename__ = "app_users"
    __table_args__ = (
        Index("ix_app_users_auth_identity", "auth_provider", "auth_subject", unique=True),
    )

    id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True)
    auth_provider: Mapped[str] = mapped_column(String(32), nullable=False)
    auth_subject: Mapped[str] = mapped_column(String(255), nullable=False)
    primary_email: Mapped[str | None] = mapped_column(String(320), nullable=True)
    display_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class UploadedFileModel(Base):
    __tablename__ = "uploaded_files"
    __table_args__ = (Index("ix_uploaded_files_app_user_id", "app_user_id"),)

    id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True)
    app_user_id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(512), nullable=False)
    storage_key: Mapped[str] = mapped_column(String(1024), nullable=False, unique=True)
    content_type: Mapped[str] = mapped_column(String(128), nullable=False)
    extension: Mapped[str] = mapped_column(String(16), nullable=False)
    size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class DraftModel(Base):
    __tablename__ = "drafts"
    __table_args__ = (Index("ix_drafts_app_user_id", "app_user_id"),)

    id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True)
    app_user_id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), nullable=False)
    title: Mapped[str] = mapped_column(String(120), nullable=False)
    raw_text: Mapped[str] = mapped_column(Text, nullable=False, default="")
    selected_platforms: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    posts: Mapped[dict[str, str]] = mapped_column(JSON, nullable=False, default=dict)
    file_ids: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class SocialConnectionModel(Base):
    __tablename__ = "social_connections"
    __table_args__ = (
        Index("ix_social_connections_app_user_id", "app_user_id"),
        Index(
            "ix_social_connections_provider_account",
            "provider",
            "provider_account_id",
            unique=True,
        ),
    )

    id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True)
    app_user_id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), nullable=False)
    provider: Mapped[str] = mapped_column(String(32), nullable=False)
    provider_account_id: Mapped[str] = mapped_column(String(255), nullable=False)
    provider_account_urn: Mapped[str] = mapped_column(String(255), nullable=False)
    provider_account_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    access_token_encrypted: Mapped[str] = mapped_column(Text, nullable=False)
    refresh_token_encrypted: Mapped[str | None] = mapped_column(Text, nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    scopes: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class PublicationModel(Base):
    __tablename__ = "publications"
    __table_args__ = (
        Index("ix_publications_app_user_id", "app_user_id"),
        Index("ix_publications_draft_id", "draft_id"),
        Index("ix_publications_status", "status"),
        Index("ix_publications_created_at", "created_at"),
    )

    id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True)
    app_user_id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), nullable=False)
    draft_id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), nullable=False)
    provider: Mapped[str] = mapped_column(String(32), nullable=False)
    social_connection_id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    mode: Mapped[str] = mapped_column(String(32), nullable=False)
    platform_text: Mapped[str] = mapped_column(Text, nullable=False)
    platform_payload: Mapped[dict[str, object]] = mapped_column(JSON, nullable=False, default=dict)
    external_post_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    external_post_urn: Mapped[str | None] = mapped_column(String(255), nullable=True)
    external_post_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    error_code: Mapped[str | None] = mapped_column(String(64), nullable=True)
    error_detail: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class PublicationAssetModel(Base):
    __tablename__ = "publication_assets"
    __table_args__ = (
        Index("ix_publication_assets_publication_id", "publication_id"),
        Index("ix_publication_assets_uploaded_file_id", "uploaded_file_id"),
        Index(
            "ix_publication_assets_publication_sort_order",
            "publication_id",
            "sort_order",
            unique=True,
        ),
    )

    id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True)
    publication_id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), nullable=False)
    uploaded_file_id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), nullable=False)
    sort_order: Mapped[int] = mapped_column(nullable=False)
    provider_asset_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    provider_asset_urn: Mapped[str | None] = mapped_column(String(255), nullable=True)
    alt_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class AiExecutionModel(Base):
    __tablename__ = "ai_executions"
    __table_args__ = (
        Index("ix_ai_executions_kind", "kind"),
        Index("ix_ai_executions_status", "status"),
        Index("ix_ai_executions_platform", "platform"),
        Index("ix_ai_executions_action", "action"),
        Index("ix_ai_executions_requested_model", "requested_model"),
        Index("ix_ai_executions_user_id", "user_id"),
        Index("ix_ai_executions_created_at", "created_at"),
    )

    id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True)
    provider: Mapped[str] = mapped_column(String(64), nullable=False)
    requested_model: Mapped[str] = mapped_column(String(255), nullable=False)
    kind: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    system_prompt: Mapped[str] = mapped_column(Text, nullable=False)
    user_prompt: Mapped[str] = mapped_column(Text, nullable=False)
    messages_json: Mapped[list[dict[str, object]]] = mapped_column(JSON, nullable=False, default=list)
    user_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    draft_id: Mapped[UUID | None] = mapped_column(PgUUID(as_uuid=True), nullable=True)
    platform: Mapped[str | None] = mapped_column(String(64), nullable=True)
    action: Mapped[str | None] = mapped_column(String(64), nullable=True)
    openrouter_generation_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    generation_request_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    generation_upstream_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    resolved_model: Mapped[str | None] = mapped_column(String(255), nullable=True)
    resolved_provider: Mapped[str | None] = mapped_column(String(255), nullable=True)
    response_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    response_reasoning: Mapped[str | None] = mapped_column(Text, nullable=True)
    response_reasoning_details_json: Mapped[list[dict[str, object]] | None] = mapped_column(JSON, nullable=True)
    finish_reason: Mapped[str | None] = mapped_column(String(64), nullable=True)
    native_finish_reason: Mapped[str | None] = mapped_column(String(64), nullable=True)
    usage_prompt_tokens: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    usage_completion_tokens: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    usage_total_tokens: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    usage_cost: Mapped[float | None] = mapped_column(Float, nullable=True)
    usage_is_byok: Mapped[bool | None] = mapped_column(nullable=True)
    usage_cached_tokens: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    usage_cache_write_tokens: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    usage_reasoning_tokens: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    usage_prompt_cost: Mapped[float | None] = mapped_column(Float, nullable=True)
    usage_completion_cost: Mapped[float | None] = mapped_column(Float, nullable=True)
    usage_total_upstream_cost: Mapped[float | None] = mapped_column(Float, nullable=True)
    generation_latency_ms: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    generation_time_ms: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    generation_tokens_prompt: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    generation_tokens_completion: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    generation_native_tokens_prompt: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    generation_native_tokens_completion: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    generation_native_tokens_reasoning: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    generation_native_tokens_cached: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    generation_total_cost: Mapped[float | None] = mapped_column(Float, nullable=True)
    generation_provider_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    generation_origin: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    generation_data_region: Mapped[str | None] = mapped_column(String(128), nullable=True)
    generation_provider_responses_json: Mapped[list[dict[str, object]] | None] = mapped_column(JSON, nullable=True)
    raw_completion_response_json: Mapped[dict[str, object] | None] = mapped_column(JSON, nullable=True)
    raw_generation_response_json: Mapped[dict[str, object] | None] = mapped_column(JSON, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    error_json: Mapped[dict[str, object] | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class GenerateJobModel(Base):
    __tablename__ = "generate_jobs"
    __table_args__ = (
        Index("ix_generate_jobs_status", "status"),
        Index("ix_generate_jobs_created_at", "created_at"),
        CheckConstraint(
            "status IN ('queued', 'processing', 'completed', 'failed')",
            name="ck_generate_jobs_status",
        ),
    )

    id: Mapped[UUID] = mapped_column(PgUUID(as_uuid=True), primary_key=True)
    raw_text: Mapped[str] = mapped_column(Text, nullable=False, default="")
    selected_platforms: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    file_ids: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    actor_user_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    posts: Mapped[dict[str, str]] = mapped_column(JSON, nullable=False, default=dict)
    errors: Mapped[dict[str, dict[str, object]]] = mapped_column(JSON, nullable=False, default=dict)
    error_code: Mapped[str | None] = mapped_column(String(64), nullable=True)
    error_detail: Mapped[str | None] = mapped_column(Text, nullable=True)
    error_meta: Mapped[dict[str, object] | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
