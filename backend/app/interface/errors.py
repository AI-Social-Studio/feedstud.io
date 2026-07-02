from collections.abc import Mapping
from typing import Any

from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

from app.domain.error_codes import ErrorCode
from app.domain.exceptions import (
    ContentGenerationError,
    DomainError,
    EmptyFileError,
    FileTooLargeError,
    InvalidGenerateInputError,
    RefineError,
    TooManyFilesError,
    UnsupportedFileTypeError,
)


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
    if isinstance(exc, TooManyFilesError | EmptyFileError | InvalidGenerateInputError):
        return status.HTTP_400_BAD_REQUEST
    if isinstance(exc, FileTooLargeError):
        return status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
    if isinstance(exc, UnsupportedFileTypeError):
        return status.HTTP_415_UNSUPPORTED_MEDIA_TYPE
    if isinstance(exc, ContentGenerationError | RefineError):
        return status.HTTP_502_BAD_GATEWAY
    return status.HTTP_500_INTERNAL_SERVER_ERROR
