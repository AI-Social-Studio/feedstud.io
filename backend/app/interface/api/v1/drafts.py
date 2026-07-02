from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.application.use_cases.drafts import GetDraftUseCase, ListDraftsUseCase, SaveDraftInput, SaveDraftUseCase
from app.domain.error_codes import ErrorCode
from app.domain.value_objects import Platform
from app.interface.dependencies import (
    get_get_draft_use_case,
    get_list_drafts_use_case,
    get_save_draft_use_case,
)
from app.interface.errors import api_error
from app.interface.schemas import DraftResponse, DraftSummaryResponse, SaveDraftRequest, UploadedFileResponse

router = APIRouter(prefix="/drafts", tags=["drafts"])


@router.get("", response_model=list[DraftSummaryResponse], summary="List recent drafts")
async def list_drafts(
    limit: int = Query(default=50, ge=1, le=100),
    use_case: ListDraftsUseCase = Depends(get_list_drafts_use_case),
) -> list[DraftSummaryResponse]:
    drafts = await use_case.execute(limit=limit)
    return [
        DraftSummaryResponse(
            id=draft.id,
            title=draft.title,
            selected_platforms=draft.selected_platforms,
            posts_count=draft.posts_count,
            raw_text_preview=draft.raw_text_preview,
            updated_at=draft.updated_at,
            created_at=draft.created_at,
        )
        for draft in drafts
    ]


@router.post("", response_model=DraftResponse, status_code=status.HTTP_201_CREATED)
async def create_draft(
    payload: SaveDraftRequest,
    save_use_case: SaveDraftUseCase = Depends(get_save_draft_use_case),
    get_use_case: GetDraftUseCase = Depends(get_get_draft_use_case),
) -> DraftResponse:
    draft_id = await save_use_case.execute(_to_save_input(payload))
    draft = await get_use_case.execute(draft_id)
    assert draft is not None
    return _to_response(draft)


@router.get("/{draft_id}", response_model=DraftResponse, summary="Get a draft")
async def get_draft(
    draft_id: UUID,
    use_case: GetDraftUseCase = Depends(get_get_draft_use_case),
) -> DraftResponse:
    draft = await use_case.execute(draft_id)
    if draft is None:
        raise api_error(
            status.HTTP_404_NOT_FOUND,
            ErrorCode.DRAFT_NOT_FOUND,
            "Draft not found",
            {"draft_id": str(draft_id)},
        )
    return _to_response(draft)


@router.put("/{draft_id}", response_model=DraftResponse, summary="Update a draft")
async def update_draft(
    draft_id: UUID,
    payload: SaveDraftRequest,
    save_use_case: SaveDraftUseCase = Depends(get_save_draft_use_case),
    get_use_case: GetDraftUseCase = Depends(get_get_draft_use_case),
) -> DraftResponse:
    saved_id = await save_use_case.execute(_to_save_input(payload, draft_id=draft_id))
    draft = await get_use_case.execute(saved_id)
    assert draft is not None
    return _to_response(draft)


def _to_save_input(payload: SaveDraftRequest, draft_id: UUID | None = None) -> SaveDraftInput:
    return SaveDraftInput(
        draft_id=draft_id,
        title=payload.title,
        raw_text=payload.raw,
        selected_platforms=[Platform(platform) for platform in payload.platforms],
        posts={Platform(platform): text for platform, text in payload.posts.items()},
        file_ids=payload.file_ids,
    )


def _to_response(draft) -> DraftResponse:
    return DraftResponse(
        id=draft.id,
        title=draft.title,
        raw=draft.raw_text,
        platforms=draft.selected_platforms,
        posts=draft.posts,
        file_ids=draft.file_ids,
        created_at=draft.created_at,
        updated_at=draft.updated_at,
        files=[
            UploadedFileResponse(
                id=file.id,
                filename=file.original_filename,
                content_type=file.content_type,
                size_bytes=file.size_bytes,
                url=file.url,
                created_at=file.created_at,
            )
            for file in draft.files
        ],
    )
