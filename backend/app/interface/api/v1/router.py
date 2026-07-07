from fastapi import APIRouter

from app.interface.api.v1 import (
    admin_ai_usage,
    drafts,
    generate,
    memory,
    publications,
    social_connections,
    uploads,
)

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(uploads.router)
api_router.include_router(generate.router)
api_router.include_router(drafts.router)
api_router.include_router(memory.router)
api_router.include_router(social_connections.router)
api_router.include_router(publications.router)
api_router.include_router(admin_ai_usage.router)
