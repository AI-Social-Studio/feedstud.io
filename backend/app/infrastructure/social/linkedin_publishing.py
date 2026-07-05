import asyncio
from datetime import datetime, timezone

import httpx

from app.application.dto import PreparedSocialAssetData, PublishedPostData
from app.application.ports import SocialAssetPreparer, SocialPublisher
from app.domain.entities import PublicationAsset, UploadedFile
from app.domain.exceptions import (
    DomainError,
    ProviderRateLimitedError,
    SocialPublishError,
    SocialTokenExpiredError,
)

LINKEDIN_POSTS_URL = "https://api.linkedin.com/rest/posts"
LINKEDIN_IMAGES_URL = "https://api.linkedin.com/rest/images"
LINKEDIN_RETRY_DELAYS_SECONDS = (1.0, 2.0, 4.0)


class LinkedInAssetPreparer(SocialAssetPreparer):
    def __init__(self, *, api_version: str) -> None:
        self._api_version = api_version

    async def prepare_image(
        self,
        *,
        access_token: str,
        author_urn: str,
        file: UploadedFile,
        data: bytes,
    ) -> PreparedSocialAssetData:
        if file.content_type is None:
            raise SocialPublishError(
                "Uploaded file content type missing",
                public_message="LinkedIn image upload failed",
            )

        async with httpx.AsyncClient(timeout=60.0, follow_redirects=True) as client:
            init_response = await _request_with_retry(
                client,
                "POST",
                f"{LINKEDIN_IMAGES_URL}?action=initializeUpload",
                operation="LinkedIn image initializeUpload",
                json={"initializeUploadRequest": {"owner": author_urn}},
                headers=_linkedin_headers(access_token, self._api_version),
            )
            if init_response.status_code >= 400:
                raise await _raise_for_response(
                    init_response,
                    operation="LinkedIn image initializeUpload",
                    public_message="LinkedIn image upload failed",
                )

            init_payload = init_response.json().get("value") or {}
            upload_url = str(init_payload.get("uploadUrl") or "")
            image_urn = str(init_payload.get("image") or "")
            if not upload_url or not image_urn:
                raise SocialPublishError(
                    "LinkedIn image initializeUpload response missing uploadUrl or image URN",
                    public_message="LinkedIn image upload failed",
                )

            upload_response = await _request_with_retry(
                client,
                "PUT",
                upload_url,
                operation="LinkedIn image binary upload",
                content=data,
                headers={"Content-Type": file.content_type.value},
            )
            if upload_response.status_code >= 400:
                raise await _raise_for_response(
                    upload_response,
                    operation="LinkedIn image binary upload",
                    public_message="LinkedIn image upload failed",
                )

        return PreparedSocialAssetData(
            provider_asset_id=image_urn.rsplit(":", 1)[-1],
            provider_asset_urn=image_urn,
        )


class LinkedInPublisher(SocialPublisher):
    def __init__(self, *, api_version: str) -> None:
        self._api_version = api_version

    async def publish_post(
        self,
        *,
        access_token: str,
        author_urn: str,
        text: str,
        assets: list[PublicationAsset],
    ) -> PublishedPostData:
        payload: dict[str, object] = {
            "author": author_urn,
            "commentary": text,
            "visibility": "PUBLIC",
            "distribution": {
                "feedDistribution": "MAIN_FEED",
                "targetEntities": [],
                "thirdPartyDistributionChannels": [],
            },
            "lifecycleState": "PUBLISHED",
            "isReshareDisabledByAuthor": False,
        }
        if len(assets) == 1:
            asset_urn = assets[0].provider_asset_urn
            if not asset_urn:
                raise SocialPublishError(
                    "LinkedIn publication asset missing provider URN",
                    public_message="LinkedIn publication failed",
                )
            payload["content"] = {
                "media": {
                    "id": asset_urn,
                    **({"altText": assets[0].alt_text} if assets[0].alt_text else {}),
                }
            }
        elif len(assets) > 1:
            images: list[dict[str, str]] = []
            for asset in assets:
                if not asset.provider_asset_urn:
                    raise SocialPublishError(
                        "LinkedIn publication asset missing provider URN",
                        public_message="LinkedIn publication failed",
                    )
                image_payload = {"id": asset.provider_asset_urn}
                if asset.alt_text:
                    image_payload["altText"] = asset.alt_text
                images.append(image_payload)
            payload["content"] = {"multiImage": {"images": images}}

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await _request_with_retry(
                client,
                "POST",
                LINKEDIN_POSTS_URL,
                operation="LinkedIn post creation",
                json=payload,
                headers=_linkedin_headers(access_token, self._api_version),
            )
            if response.status_code >= 400:
                raise await _raise_for_response(
                    response,
                    operation="LinkedIn post creation",
                    public_message="LinkedIn publication failed",
                )

        post_urn = response.headers.get("x-restli-id") or response.headers.get("X-RestLi-Id")
        if not post_urn:
            raise SocialPublishError(
                "LinkedIn post creation response missing x-restli-id header",
                public_message="LinkedIn publication failed",
            )

        return PublishedPostData(
            external_post_id=post_urn.rsplit(":", 1)[-1],
            external_post_urn=post_urn,
            external_post_url=f"https://www.linkedin.com/feed/update/{post_urn}/",
            published_at=datetime.now(timezone.utc),
        )


def _linkedin_headers(access_token: str, api_version: str) -> dict[str, str]:
    return {
        "Authorization": f"Bearer {access_token}",
        "Linkedin-Version": api_version,
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json",
    }


async def _response_detail(response: httpx.Response) -> str:
    try:
        payload = response.json()
    except ValueError:
        return response.text or f"HTTP {response.status_code}"

    for key in ("message", "detail", "error_description", "error"):
        value = payload.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return response.text or f"HTTP {response.status_code}"


async def _request_with_retry(
    client: httpx.AsyncClient,
    method: str,
    url: str,
    *,
    operation: str,
    **kwargs: object,
) -> httpx.Response:
    last_error: Exception | None = None
    for attempt, delay_seconds in enumerate((0.0, *LINKEDIN_RETRY_DELAYS_SECONDS), start=1):
        if delay_seconds > 0:
            await asyncio.sleep(delay_seconds)

        try:
            response = await client.request(method, url, **kwargs)
        except httpx.RequestError as exc:
            last_error = exc
            if attempt > len(LINKEDIN_RETRY_DELAYS_SECONDS):
                raise SocialPublishError(
                    f"{operation} request failed: {exc}",
                    public_message="LinkedIn publication failed",
                ) from exc
            continue

        if not _is_retryable_status(response.status_code) or attempt > len(LINKEDIN_RETRY_DELAYS_SECONDS):
            return response

        last_error = None

    if last_error is not None:
        raise SocialPublishError(f"{operation} request failed: {last_error}") from last_error
    raise SocialPublishError(f"{operation} request failed")


def _is_retryable_status(status_code: int) -> bool:
    return status_code == 429 or status_code >= 500


async def _raise_for_response(
    response: httpx.Response,
    *,
    operation: str,
    public_message: str,
) -> DomainError:
    detail = await _response_detail(response)
    if response.status_code == 401:
        return SocialTokenExpiredError()
    if response.status_code == 429:
        return ProviderRateLimitedError()
    return SocialPublishError(
        f"{operation} failed: {detail}",
        public_message=public_message,
        meta={"status_code": response.status_code},
    )
