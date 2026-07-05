from collections.abc import Mapping
from typing import Any

from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

from app.domain.error_codes import ErrorCode
from app.domain.exceptions import DomainError


HTTP_STATUS_BY_ERROR_CODE: dict[ErrorCode, int] = {
    ErrorCode.NOT_FOUND: status.HTTP_404_NOT_FOUND,
    ErrorCode.METHOD_NOT_ALLOWED: status.HTTP_405_METHOD_NOT_ALLOWED,
    ErrorCode.TOO_MANY_FILES: status.HTTP_400_BAD_REQUEST,
    ErrorCode.FILE_TOO_LARGE: status.HTTP_413_CONTENT_TOO_LARGE,
    ErrorCode.UNSUPPORTED_FILE_TYPE: status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
    ErrorCode.EMPTY_FILE: status.HTTP_400_BAD_REQUEST,
    ErrorCode.INVALID_GENERATE_INPUT: status.HTTP_400_BAD_REQUEST,
    ErrorCode.CONTENT_GENERATION_FAILED: status.HTTP_502_BAD_GATEWAY,
    ErrorCode.INVALID_MODEL_OUTPUT: status.HTTP_502_BAD_GATEWAY,
    ErrorCode.MODEL_EMPTY_OUTPUT: status.HTTP_502_BAD_GATEWAY,
    ErrorCode.REFINE_FAILED: status.HTTP_502_BAD_GATEWAY,
    ErrorCode.BACKEND_AUTH_NOT_CONFIGURED: status.HTTP_503_SERVICE_UNAVAILABLE,
    ErrorCode.UNAUTHORIZED: status.HTTP_401_UNAUTHORIZED,
    ErrorCode.DRAFT_NOT_FOUND: status.HTTP_404_NOT_FOUND,
    ErrorCode.FILE_NOT_FOUND: status.HTTP_404_NOT_FOUND,
    ErrorCode.INVALID_PUBLICATION_INPUT: status.HTTP_400_BAD_REQUEST,
    ErrorCode.PUBLICATION_NOT_FOUND: status.HTTP_404_NOT_FOUND,
    ErrorCode.SOCIAL_PUBLISH_FAILED: status.HTTP_502_BAD_GATEWAY,
    ErrorCode.UNSUPPORTED_ASSET_TYPE: status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
    ErrorCode.TOO_MANY_ASSETS: status.HTTP_400_BAD_REQUEST,
    ErrorCode.SOCIAL_CONNECTION_INVALID: status.HTTP_400_BAD_REQUEST,
    ErrorCode.SOCIAL_TOKEN_EXPIRED: status.HTTP_401_UNAUTHORIZED,
    ErrorCode.PROVIDER_RATE_LIMITED: status.HTTP_429_TOO_MANY_REQUESTS,
    ErrorCode.AI_EXECUTION_NOT_FOUND: status.HTTP_404_NOT_FOUND,
    ErrorCode.INTERNAL_SERVER_ERROR: status.HTTP_500_INTERNAL_SERVER_ERROR,
}


def error_payload(
    code: ErrorCode,
    detail: str,
    meta: Mapping[str, Any] | None = None,
) -> dict[str, Any]:
    payload: dict[str, Any] = {"code": code.value, "detail": detail}
    if meta:
        payload["meta"] = dict(meta)
    return payload


def api_error(
    status_code: int,
    code: ErrorCode,
    detail: str,
    meta: Mapping[str, Any] | None = None,
) -> HTTPException:
    return HTTPException(status_code=status_code, detail=error_payload(code, detail, meta))


def domain_error_response(exc: DomainError) -> JSONResponse:
    return JSONResponse(
        status_code=_domain_error_status(exc),
        content=error_payload(exc.code, exc.public_message, exc.meta),
    )


def _domain_error_status(exc: DomainError) -> int:
    return HTTP_STATUS_BY_ERROR_CODE.get(exc.code, status.HTTP_500_INTERNAL_SERVER_ERROR)
