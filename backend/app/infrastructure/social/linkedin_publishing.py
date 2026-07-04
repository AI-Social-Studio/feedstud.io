from datetime import datetime, timezone

import httpx

from app.application.dto import PreparedSocialAssetData, PublishedPostData
from app.application.ports import SocialAssetPreparer, SocialPublisher
from app.domain.entities import UploadedFile
from app.domain.exceptions import SocialPublishError

LINKEDIN_POSTS_URL = "https://api.linkedin.com/rest/posts"
LINKEDIN_IMAGES_URL = "https://api.linkedin.com/rest/images"


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
            init_response = await client.post(
                f"{LINKEDIN_IMAGES_URL}?action=initializeUpload",
                json={"initializeUploadRequest": {"owner": author_urn}},
                headers=_linkedin_headers(access_token, self._api_version),
            )
            if init_response.status_code >= 400:
                raise SocialPublishError(
                    f"LinkedIn image initializeUpload failed: {await _response_detail(init_response)}",
                    public_message="LinkedIn image upload failed",
                    meta={"status_code": init_response.status_code},
                )

            init_payload = init_response.json().get("value") or {}
            upload_url = str(init_payload.get("uploadUrl") or "")
            image_urn = str(init_payload.get("image") or "")
            if not upload_url or not image_urn:
                raise SocialPublishError(
                    "LinkedIn image initializeUpload response missing uploadUrl or image URN",
                    public_message="LinkedIn image upload failed",
                )

            upload_response = await client.put(
                upload_url,
                content=data,
                headers={"Content-Type": file.content_type.value},
            )
            if upload_response.status_code >= 400:
                raise SocialPublishError(
                    f"LinkedIn image binary upload failed: {await _response_detail(upload_response)}",
                    public_message="LinkedIn image upload failed",
                    meta={"status_code": upload_response.status_code},
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
        asset_urn: str | None = None,
        alt_text: str | None = None,
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
        if asset_urn:
            payload["content"] = {
                "media": {
                    "id": asset_urn,
                    **({"altText": alt_text} if alt_text else {}),
                }
            }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                LINKEDIN_POSTS_URL,
                json=payload,
                headers=_linkedin_headers(access_token, self._api_version),
            )
            if response.status_code >= 400:
                raise SocialPublishError(
                    f"LinkedIn post creation failed: {await _response_detail(response)}",
                    public_message="LinkedIn publication failed",
                    meta={"status_code": response.status_code},
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
