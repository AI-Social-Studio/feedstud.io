import base64
import binascii
import hashlib
import hmac
import json
import time
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode
from uuid import UUID

import httpx

from app.application.dto import SocialOAuthConnectionData
from app.application.ports import SocialOAuthClient
from app.domain.error_codes import ErrorCode
from app.domain.exceptions import DomainError

LINKEDIN_AUTHORIZE_URL = "https://www.linkedin.com/oauth/v2/authorization"
LINKEDIN_ACCESS_TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
LINKEDIN_USERINFO_URL = "https://api.linkedin.com/v2/userinfo"
LINKEDIN_SCOPE = "openid profile email w_member_social"
STATE_MAX_AGE_SECONDS = 15 * 60


class LinkedInOAuthClient(SocialOAuthClient):
    def __init__(self, *, client_id: str, client_secret: str, state_secret: str) -> None:
        self._client_id = client_id
        self._client_secret = client_secret
        self._state_secret = state_secret.encode("utf-8")

    async def get_authorization_url(self, *, redirect_uri: str, app_user_id: UUID) -> str:
        state = _sign_state(app_user_id=app_user_id, secret=self._state_secret)
        query = urlencode(
            {
                "response_type": "code",
                "client_id": self._client_id,
                "redirect_uri": redirect_uri,
                "scope": LINKEDIN_SCOPE,
                "state": state,
            }
        )
        return f"{LINKEDIN_AUTHORIZE_URL}?{query}"

    async def complete_authorization(
        self,
        *,
        code: str,
        state: str,
        redirect_uri: str,
        app_user_id: UUID,
    ) -> SocialOAuthConnectionData:
        _verify_state(state=state, expected_app_user_id=app_user_id, secret=self._state_secret)

        async with httpx.AsyncClient(timeout=20.0) as client:
            token_response = await client.post(
                LINKEDIN_ACCESS_TOKEN_URL,
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": redirect_uri,
                    "client_id": self._client_id,
                    "client_secret": self._client_secret,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            if token_response.status_code >= 400:
                raise DomainError(
                    "LinkedIn OAuth token exchange failed",
                    code=ErrorCode.CLIENT_ERROR,
                    public_message="LinkedIn authorization failed",
                )

            token_payload = token_response.json()
            access_token = str(token_payload.get("access_token") or "")
            if not access_token:
                raise DomainError(
                    "LinkedIn access token missing",
                    code=ErrorCode.CLIENT_ERROR,
                    public_message="LinkedIn authorization failed",
                )

            userinfo_response = await client.get(
                LINKEDIN_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if userinfo_response.status_code >= 400:
                raise DomainError(
                    "LinkedIn userinfo fetch failed",
                    code=ErrorCode.CLIENT_ERROR,
                    public_message="LinkedIn authorization failed",
                )

        userinfo = userinfo_response.json()
        account_id = str(userinfo.get("sub") or "")
        if not account_id:
            raise DomainError(
                "LinkedIn account id missing",
                code=ErrorCode.CLIENT_ERROR,
                public_message="LinkedIn authorization failed",
            )

        expires_in = int(token_payload.get("expires_in") or 0)
        expires_at = (
            datetime.now(timezone.utc) + timedelta(seconds=expires_in) if expires_in > 0 else None
        )
        scope_text = str(token_payload.get("scope") or LINKEDIN_SCOPE)
        provider_account_name = _resolve_display_name(userinfo)

        return SocialOAuthConnectionData(
            provider="linkedin",
            provider_account_id=account_id,
            provider_account_urn=f"urn:li:person:{account_id}",
            provider_account_name=provider_account_name,
            access_token=access_token,
            refresh_token=token_payload.get("refresh_token"),
            expires_at=expires_at,
            scopes=scope_text.split(),
        )


def _resolve_display_name(userinfo: dict) -> str | None:
    name = userinfo.get("name")
    if isinstance(name, str) and name.strip():
        return name.strip()
    given_name = str(userinfo.get("given_name") or "").strip()
    family_name = str(userinfo.get("family_name") or "").strip()
    display_name = " ".join(part for part in [given_name, family_name] if part)
    return display_name or None


def _sign_state(*, app_user_id: UUID, secret: bytes) -> str:
    payload = {
        "app_user_id": str(app_user_id),
        "ts": int(time.time()),
    }
    payload_json = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    payload_b64 = base64.urlsafe_b64encode(payload_json).decode("ascii")
    signature = hmac.new(secret, payload_b64.encode("ascii"), hashlib.sha256).hexdigest()
    return f"{payload_b64}.{signature}"


def _verify_state(*, state: str, expected_app_user_id: UUID, secret: bytes) -> None:
    try:
        payload_b64, signature = state.split(".", 1)
    except ValueError as exc:
        raise DomainError(
            "LinkedIn OAuth state is invalid",
            code=ErrorCode.CLIENT_ERROR,
            public_message="LinkedIn authorization failed",
        ) from exc

    try:
        expected_signature = hmac.new(secret, payload_b64.encode("ascii"), hashlib.sha256).hexdigest()
        payload = json.loads(base64.urlsafe_b64decode(payload_b64.encode("ascii")))
        if not isinstance(payload, dict):
            raise TypeError("LinkedIn OAuth state payload must be an object")
        ts = int(payload.get("ts") or 0)
    except (ValueError, TypeError, UnicodeEncodeError, json.JSONDecodeError, binascii.Error) as exc:
        raise DomainError(
            "LinkedIn OAuth state is invalid",
            code=ErrorCode.CLIENT_ERROR,
            public_message="LinkedIn authorization failed",
        ) from exc

    if not hmac.compare_digest(signature, expected_signature):
        raise DomainError(
            "LinkedIn OAuth state signature mismatch",
            code=ErrorCode.CLIENT_ERROR,
            public_message="LinkedIn authorization failed",
        )

    if payload.get("app_user_id") != str(expected_app_user_id):
        raise DomainError(
            "LinkedIn OAuth state user mismatch",
            code=ErrorCode.CLIENT_ERROR,
            public_message="LinkedIn authorization failed",
        )
    if ts <= 0 or time.time() - ts > STATE_MAX_AGE_SECONDS:
        raise DomainError(
            "LinkedIn OAuth state expired",
            code=ErrorCode.CLIENT_ERROR,
            public_message="LinkedIn authorization expired",
        )
