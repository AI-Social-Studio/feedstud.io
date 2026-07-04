from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.application.use_cases.publications import (
    GetPublicationUseCase,
    ListPublicationsUseCase,
    SubmitPublicationJobInput,
    SubmitPublicationJobUseCase,
)
from app.domain.error_codes import ErrorCode
from app.interface.dependencies import (
    get_current_app_user_id,
    get_get_publication_use_case,
    get_list_publications_use_case,
    get_submit_publication_job_use_case,
)
from app.interface.errors import api_error
from app.interface.schemas import CreatePublicationRequest, PublicationAssetResponse, PublicationResponse

router = APIRouter(prefix="/publications", tags=["publications"])


@router.post("", response_model=PublicationResponse, status_code=status.HTTP_201_CREATED)
async def create_publication(
    payload: CreatePublicationRequest,
    app_user_id: UUID = Depends(get_current_app_user_id),
    use_case: SubmitPublicationJobUseCase = Depends(get_submit_publication_job_use_case),
) -> PublicationResponse:
    view = await use_case.execute(
        SubmitPublicationJobInput(
            app_user_id=app_user_id,
            provider=payload.provider,
            draft_id=payload.draft_id,
            social_connection_id=payload.social_connection_id,
            text=payload.text,
            file_ids=payload.file_ids,
            asset_order=payload.asset_order,
        )
    )
    return _to_response(view)


@router.get("", response_model=list[PublicationResponse])
async def list_publications(
    draft_id: UUID = Query(...),
    app_user_id: UUID = Depends(get_current_app_user_id),
    use_case: ListPublicationsUseCase = Depends(get_list_publications_use_case),
) -> list[PublicationResponse]:
    views = await use_case.execute(draft_id=draft_id, app_user_id=app_user_id)
    return [_to_response(view) for view in views]


@router.get("/{publication_id}", response_model=PublicationResponse)
async def get_publication(
    publication_id: UUID,
    app_user_id: UUID = Depends(get_current_app_user_id),
    use_case: GetPublicationUseCase = Depends(get_get_publication_use_case),
) -> PublicationResponse:
    view = await use_case.execute(publication_id, app_user_id=app_user_id)
    if view is None:
        raise api_error(
            status.HTTP_404_NOT_FOUND,
            ErrorCode.PUBLICATION_NOT_FOUND,
            "Publication not found",
            {"publication_id": str(publication_id)},
        )
    return _to_response(view)


def _to_response(view) -> PublicationResponse:
    return PublicationResponse(
        id=view.id,
        draft_id=view.draft_id,
        provider=view.provider,
        social_connection_id=view.social_connection_id,
        status=view.status,
        mode=view.mode,
        platform_text=view.platform_text,
        external_post_id=view.external_post_id,
        external_post_urn=view.external_post_urn,
        external_post_url=view.external_post_url,
        error_code=view.error_code,
        error_detail=view.error_detail,
        created_at=view.created_at,
        updated_at=view.updated_at,
        published_at=view.published_at,
        assets=[
            PublicationAssetResponse(
                id=asset.id,
                uploaded_file_id=asset.uploaded_file_id,
                sort_order=asset.sort_order,
                provider_asset_id=asset.provider_asset_id,
                provider_asset_urn=asset.provider_asset_urn,
                alt_text=asset.alt_text,
                created_at=asset.created_at,
            )
            for asset in view.assets
        ],
    )
