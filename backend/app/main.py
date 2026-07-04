import logging
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import get_settings
from app.domain.error_codes import ErrorCode
from app.domain.exceptions import DomainError
from app.infrastructure.db.models import Base
from app.infrastructure.db.repositories import SqlAlchemyAiExecutionRepository
from app.interface.api.v1.router import api_router
from app.interface.dependencies import _database, _storage
from app.interface.errors import HTTP_STATUS_BY_ERROR_CODE, domain_error_response, error_payload

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    db = _database()
    if settings.db_reset_on_start:
        await db.drop_all(Base.metadata)
    await db.create_all(Base.metadata)
    retention_cutoff = datetime.now(timezone.utc) - timedelta(days=settings.ai_execution_retention_days)
    session_stream = db.session()
    try:
        try:
            session = await anext(session_stream)
            await SqlAlchemyAiExecutionRepository(session).delete_older_than(retention_cutoff)
        except Exception:
            logger.exception(
                "Failed to prune AI executions during startup",
                extra={"retention_cutoff": retention_cutoff.isoformat()},
            )
    finally:
        await session_stream.aclose()
    await _storage().ensure_bucket()
    yield
    await db.dispose()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title="Feedstudio Backend",
        version="0.1.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.exception_handler(DomainError)
    async def _domain_error(_: Request, exc: DomainError) -> JSONResponse:
        _log_handled_exception(exc, HTTP_STATUS_BY_ERROR_CODE.get(exc.code, 500))
        return domain_error_response(exc)

    @app.exception_handler(StarletteHTTPException)
    async def _http_error(_: Request, exc: StarletteHTTPException) -> JSONResponse:
        if isinstance(exc.detail, dict) and "code" in exc.detail and "detail" in exc.detail:
            _log_handled_exception(exc, exc.status_code)
            return JSONResponse(status_code=exc.status_code, content=exc.detail)

        payload = _framework_http_error_payload(exc)
        _log_handled_exception(exc, exc.status_code)
        return JSONResponse(
            status_code=exc.status_code,
            content=payload,
        )

    @app.exception_handler(Exception)
    async def _unexpected_error(_: Request, exc: Exception) -> JSONResponse:
        logger.error("Unhandled application exception", exc_info=(type(exc), exc, exc.__traceback__))
        return JSONResponse(
            status_code=500,
            content=error_payload(ErrorCode.INTERNAL_SERVER_ERROR, "Internal server error"),
        )

    @app.get("/health", tags=["meta"])
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(api_router)
    return app


def _framework_http_error_payload(exc: StarletteHTTPException) -> dict[str, str]:
    if exc.status_code == 404:
        return error_payload(ErrorCode.NOT_FOUND, "Not found")
    if exc.status_code == 405:
        return error_payload(ErrorCode.METHOD_NOT_ALLOWED, "Method not allowed")
    if 400 <= exc.status_code < 500:
        return error_payload(ErrorCode.CLIENT_ERROR, str(exc.detail))
    return error_payload(ErrorCode.INTERNAL_SERVER_ERROR, str(exc.detail))


def _log_handled_exception(exc: Exception, status_code: int) -> None:
    if status_code >= 500:
        logger.error("Handled server-side exception", exc_info=(type(exc), exc, exc.__traceback__))
        return
    logger.warning("Handled client-facing exception", extra={"status_code": status_code, "detail": str(exc)})


app = create_app()
