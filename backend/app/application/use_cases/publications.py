from datetime import datetime, timedelta, timezone
import logging
from dataclasses import dataclass
from time import perf_counter
from uuid import UUID

from app.application.dto import PublicationAssetView, PublicationView
from app.application.ports import (
    DraftRepository,
    FileRepository,
    ObjectStorage,
    PublicationJobQueue,
    PublicationRepository,
    SecretCipher,
    SocialAssetPreparer,
    SocialConnectionRepository,
    SocialPublisher,
)
from app.domain.entities import Publication, PublicationAsset
from app.domain.error_codes import ErrorCode
from app.domain.exceptions import (
    DomainError,
    InvalidPublicationInputError,
    ProviderRateLimitedError,
    SocialConnectionInvalidError,
    SocialTokenExpiredError,
    TooManyPublicationAssetsError,
    UnsupportedPublicationAssetTypeError,
)
from app.domain.value_objects import Platform

logger = logging.getLogger(__name__)

LINKEDIN_ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif"}


@dataclass
class SubmitPublicationJobInput:
    app_user_id: UUID
    provider: str
    mode: str
    draft_id: UUID
    social_connection_id: UUID
    text: str
    file_ids: list[UUID]
    asset_order: list[UUID]
    asset_alt_texts: dict[UUID, str]
    scheduled_for: datetime | None


class SubmitPublicationJobUseCase:
    def __init__(
        self,
        *,
        drafts: DraftRepository,
        files: FileRepository,
        connections: SocialConnectionRepository,
        publications: PublicationRepository,
        queue: PublicationJobQueue,
    ) -> None:
        self._drafts = drafts
        self._files = files
        self._connections = connections
        self._publications = publications
        self._queue = queue

    async def execute(self, payload: SubmitPublicationJobInput) -> PublicationView:
        scheduled_for = _validate_publication_timing(payload)
        text = payload.text.strip()
        if payload.provider != Platform.LINKEDIN.value:
            raise InvalidPublicationInputError("Only LinkedIn publishing is supported right now")
        if not text:
            raise InvalidPublicationInputError("LinkedIn post text is required")
        if len(text) > Platform.LINKEDIN.char_limit:
            raise InvalidPublicationInputError(
                f"LinkedIn post text exceeds {Platform.LINKEDIN.char_limit} characters",
                meta={"limit": Platform.LINKEDIN.char_limit},
            )

        draft = await self._drafts.get(payload.draft_id, app_user_id=payload.app_user_id)
        if draft is None:
            raise InvalidPublicationInputError("Draft not found")

        connection = await self._connections.get(
            payload.social_connection_id,
            app_user_id=payload.app_user_id,
        )
        if connection is None or connection.provider != Platform.LINKEDIN.value:
            raise SocialConnectionInvalidError("LinkedIn social connection not found")
        if connection.status != "active":
            raise SocialConnectionInvalidError("LinkedIn social connection is not active")

        ordered_file_ids = _resolve_asset_order(payload.file_ids, payload.asset_order)
        if len(ordered_file_ids) > 20:
            raise TooManyPublicationAssetsError(max_assets=20, received=len(ordered_file_ids))
        _validate_asset_alt_texts(payload.asset_alt_texts, ordered_file_ids)

        validated_file_ids: list[UUID] = []
        for file_id in ordered_file_ids:
            file = await self._files.get(file_id, app_user_id=payload.app_user_id)
            if file is None or file.content_type is None:
                raise InvalidPublicationInputError(f"File '{file_id}' not found")
            if file.content_type.value not in LINKEDIN_ALLOWED_IMAGE_TYPES:
                raise UnsupportedPublicationAssetTypeError(
                    file.content_type.value,
                    file_id=str(file_id),
                )
            validated_file_ids.append(file_id)

        publication = Publication(
            app_user_id=payload.app_user_id,
            draft_id=payload.draft_id,
            provider=payload.provider,
            social_connection_id=payload.social_connection_id,
            status="scheduled" if payload.mode == "schedule" else "queued",
            mode=payload.mode,
            platform_text=text,
            platform_payload={
                "file_ids": [str(file_id) for file_id in ordered_file_ids],
                "asset_alt_texts": {
                    str(file_id): _normalize_alt_text(payload.asset_alt_texts.get(file_id))
                    for file_id in ordered_file_ids
                    if _normalize_alt_text(payload.asset_alt_texts.get(file_id)) is not None
                },
            },
            scheduled_for=scheduled_for,
            queued_at=datetime.now(timezone.utc) if payload.mode == "publish_now" else None,
        )
        publication.assets = [
            PublicationAsset(
                publication_id=publication.id,
                uploaded_file_id=file_id,
                sort_order=sort_order,
                alt_text=_normalize_alt_text(payload.asset_alt_texts.get(file_id)),
            )
            for sort_order, file_id in enumerate(validated_file_ids)
        ]

        await self._publications.add(publication)
        if payload.mode == "schedule":
            return _to_view(publication)

        try:
            await self._queue.publish(publication.id)
        except Exception:
            await self._publications.fail(
                publication.id,
                from_status="queued",
                code=ErrorCode.INTERNAL_SERVER_ERROR.value,
                detail="Failed to enqueue publication job",
            )
            raise
        return _to_view(publication)


class GetPublicationUseCase:
    def __init__(self, publications: PublicationRepository) -> None:
        self._publications = publications

    async def execute(self, publication_id: UUID, *, app_user_id: UUID) -> PublicationView | None:
        publication = await self._publications.get(publication_id, app_user_id=app_user_id)
        return _to_view(publication) if publication is not None else None


class ListPublicationsUseCase:
    def __init__(self, publications: PublicationRepository) -> None:
        self._publications = publications

    async def execute(self, *, draft_id: UUID, app_user_id: UUID) -> list[PublicationView]:
        publications = await self._publications.list_by_draft(draft_id=draft_id, app_user_id=app_user_id)
        return [_to_view(publication) for publication in publications]


class ReleaseScheduledPublicationsUseCase:
    def __init__(
        self,
        *,
        publications: PublicationRepository,
        queue: PublicationJobQueue,
    ) -> None:
        self._publications = publications
        self._queue = queue

    async def execute(self, *, now: datetime, limit: int) -> int:
        claimed_publications = await self._publications.claim_due_scheduled(now=now, limit=limit)
        released_publication_ids: list[str] = []
        for publication in claimed_publications:
            try:
                await self._queue.publish(publication.id)
                released_publication_ids.append(str(publication.id))
            except Exception:
                await self._publications.restore_scheduled(publication.id)
                logger.exception(
                    "Failed to release scheduled publication",
                    extra={"publication_id": str(publication.id)},
                )

        if released_publication_ids:
            logger.info(
                "Released scheduled publications",
                extra={
                    "count": len(released_publication_ids),
                    "publication_ids": released_publication_ids,
                },
            )
        return len(released_publication_ids)


class ProcessPublicationJobUseCase:
    def __init__(
        self,
        *,
        publications: PublicationRepository,
        files: FileRepository,
        storage: ObjectStorage,
        connections: SocialConnectionRepository,
        cipher: SecretCipher,
        asset_preparer: SocialAssetPreparer,
        publisher: SocialPublisher,
    ) -> None:
        self._publications = publications
        self._files = files
        self._storage = storage
        self._connections = connections
        self._cipher = cipher
        self._asset_preparer = asset_preparer
        self._publisher = publisher

    async def execute(self, publication_id: UUID) -> None:
        started_at = perf_counter()
        publication = await self._publications.get(publication_id)
        if publication is None:
            return
        if publication.status in {"completed", "failed"}:
            logger.info(
                "Publication job skipped",
                extra=_publication_log_context(publication, current_status=publication.status, skip_reason="terminal_status"),
            )
            return
        if publication.status != "queued":
            logger.info(
                "Publication job skipped",
                extra=_publication_log_context(publication, current_status=publication.status, skip_reason="not_queued"),
            )
            return
        if not await self._publications.mark_processing(publication_id):
            logger.info(
                "Publication job skipped",
                extra=_publication_log_context(publication, current_status=publication.status, skip_reason="already_claimed"),
            )
            return

        logger.info(
            "Publication job started",
            extra=_publication_log_context(publication, current_status="processing"),
        )

        connection = None
        try:
            connection = await self._connections.get(
                publication.social_connection_id,
                app_user_id=publication.app_user_id,
            )
            if connection is None:
                raise SocialConnectionInvalidError("LinkedIn social connection not found")

            access_token = self._cipher.decrypt(connection.access_token_encrypted)
            for asset in publication.assets:
                file = await self._files.get(asset.uploaded_file_id, app_user_id=publication.app_user_id)
                if file is None:
                    raise InvalidPublicationInputError(f"File '{asset.uploaded_file_id}' not found")
                prepared = await self._asset_preparer.prepare_image(
                    access_token=access_token,
                    author_urn=connection.provider_account_urn,
                    file=file,
                    data=await self._storage.get(file.storage_key),
                )
                asset.provider_asset_id = prepared.provider_asset_id
                asset.provider_asset_urn = prepared.provider_asset_urn

            if publication.assets:
                await self._publications.update_assets(publication.id, publication.assets)

            published = await self._publisher.publish_post(
                access_token=access_token,
                author_urn=connection.provider_account_urn,
                text=publication.platform_text,
                assets=publication.assets,
            )
        except SocialTokenExpiredError as exc:
            if connection is not None and connection.status == "active":
                connection.status = "inactive"
                connection.updated_at = datetime.now(timezone.utc)
                await self._connections.update(connection)
            await self._publications.fail(
                publication_id,
                from_status="processing",
                code=exc.code.value,
                detail=exc.public_message,
            )
            logger.info(
                "Publication job failed",
                extra=_publication_log_context(
                    publication,
                    current_status="failed",
                    error_code=exc.code.value,
                    latency_ms=int((perf_counter() - started_at) * 1000),
                ),
            )
            return
        except DomainError as exc:
            await self._publications.fail(
                publication_id,
                from_status="processing",
                code=exc.code.value,
                detail=exc.public_message,
            )
            logger.log(
                logging.WARNING if isinstance(exc, ProviderRateLimitedError) else logging.INFO,
                "Publication job failed",
                extra=_publication_log_context(
                    publication,
                    current_status="failed",
                    error_code=exc.code.value,
                    latency_ms=int((perf_counter() - started_at) * 1000),
                ),
            )
            return
        except Exception:
            logger.exception(
                "Publication job execution failed",
                extra=_publication_log_context(publication, current_status="failed"),
            )
            await self._publications.fail(
                publication_id,
                from_status="processing",
                code=ErrorCode.INTERNAL_SERVER_ERROR.value,
                detail="Internal server error",
            )
            return

        await self._publications.complete(
            publication_id,
            from_status="processing",
            external_post_id=published.external_post_id,
            external_post_urn=published.external_post_urn,
            external_post_url=published.external_post_url,
            published_at=published.published_at,
        )
        logger.info(
            "Publication job completed",
            extra=_publication_log_context(
                publication,
                current_status="completed",
                latency_ms=int((perf_counter() - started_at) * 1000),
            ),
        )


def _resolve_asset_order(file_ids: list[UUID], asset_order: list[UUID]) -> list[UUID]:
    ordered = asset_order or file_ids
    if len(set(ordered)) != len(ordered):
        raise InvalidPublicationInputError("Asset order contains duplicate files")
    if set(ordered) != set(file_ids):
        raise InvalidPublicationInputError("Asset order must match selected files")
    return ordered


def _validate_asset_alt_texts(asset_alt_texts: dict[UUID, str], ordered_file_ids: list[UUID]) -> None:
    unexpected_file_ids = set(asset_alt_texts) - set(ordered_file_ids)
    if unexpected_file_ids:
        raise InvalidPublicationInputError("Asset alt texts must match selected files")


def _normalize_alt_text(value: str | None) -> str | None:
    if value is None:
        return None
    normalized = value.strip()
    return normalized or None


def _validate_publication_timing(payload: SubmitPublicationJobInput) -> datetime | None:
    if payload.mode not in {"publish_now", "schedule"}:
        raise InvalidPublicationInputError("Unsupported publication mode")

    if payload.mode == "publish_now":
        if payload.scheduled_for is not None:
            raise InvalidPublicationInputError("Publish-now publications cannot define scheduled time")
        return None

    if payload.scheduled_for is None:
        raise InvalidPublicationInputError("Scheduled publications require scheduled time")
    if payload.scheduled_for.tzinfo is None or payload.scheduled_for.utcoffset() is None:
        raise InvalidPublicationInputError("Scheduled publication time must include timezone")

    scheduled_for = payload.scheduled_for.astimezone(timezone.utc)
    minimum_scheduled_for = datetime.now(timezone.utc) + timedelta(minutes=1)
    if scheduled_for < minimum_scheduled_for:
        raise InvalidPublicationInputError("Scheduled publication time must be at least 1 minute in the future")
    return scheduled_for


def _publication_log_context(
    publication: Publication,
    *,
    current_status: str,
    skip_reason: str | None = None,
    error_code: str | None = None,
    latency_ms: int | None = None,
) -> dict[str, object]:
    context: dict[str, object] = {
        "publication_id": str(publication.id),
        "app_user_id": str(publication.app_user_id),
        "provider": publication.provider,
        "draft_id": str(publication.draft_id),
        "mode": publication.mode,
        "current_status": current_status,
        "asset_count": len(publication.assets),
        "scheduled_for": publication.scheduled_for.isoformat() if publication.scheduled_for else None,
        "queued_at": publication.queued_at.isoformat() if publication.queued_at else None,
        "schedule_released_at": (
            publication.schedule_released_at.isoformat() if publication.schedule_released_at else None
        ),
    }
    if skip_reason is not None:
        context["skip_reason"] = skip_reason
    if error_code is not None:
        context["error_code"] = error_code
    if latency_ms is not None:
        context["latency_ms"] = latency_ms
    return context


def _to_view(publication: Publication) -> PublicationView:
    return PublicationView(
        id=publication.id,
        draft_id=publication.draft_id,
        provider=publication.provider,
        social_connection_id=publication.social_connection_id,
        status=publication.status,
        mode=publication.mode,
        platform_text=publication.platform_text,
        external_post_id=publication.external_post_id,
        external_post_urn=publication.external_post_urn,
        external_post_url=publication.external_post_url,
        error_code=publication.error_code,
        error_detail=publication.error_detail,
        created_at=publication.created_at,
        updated_at=publication.updated_at,
        published_at=publication.published_at,
        scheduled_for=publication.scheduled_for,
        queued_at=publication.queued_at,
        schedule_released_at=publication.schedule_released_at,
        assets=[
            PublicationAssetView(
                id=asset.id,
                uploaded_file_id=asset.uploaded_file_id,
                sort_order=asset.sort_order,
                provider_asset_id=asset.provider_asset_id,
                provider_asset_urn=asset.provider_asset_urn,
                alt_text=asset.alt_text,
                created_at=asset.created_at,
            )
            for asset in publication.assets
        ],
    )
