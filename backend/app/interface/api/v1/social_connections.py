from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.application.use_cases.social_connections import (
    CompleteLinkedInConnectInput,
    CompleteLinkedInConnectUseCase,
    DisconnectSocialConnectionUseCase,
    ListSocialConnectionsUseCase,
    StartLinkedInConnectInput,
    StartLinkedInConnectUseCase,
)
from app.domain.error_codes import ErrorCode
from app.interface.dependencies import (
    get_complete_linkedin_connect_use_case,
    get_current_app_user_id,
    get_disconnect_social_connection_use_case,
    get_list_social_connections_use_case,
    get_start_linkedin_connect_use_case,
)
from app.interface.errors import api_error
from app.interface.schemas import SocialConnectionResponse, SocialConnectionStartResponse

router = APIRouter(prefix="/social-connections", tags=["social-connections"])


@router.get("", response_model=list[SocialConnectionResponse])
async def list_social_connections(
    app_user_id: UUID = Depends(get_current_app_user_id),
    use_case: ListSocialConnectionsUseCase = Depends(get_list_social_connections_use_case),
) -> list[SocialConnectionResponse]:
    views = await use_case.execute(app_user_id=app_user_id)
    return [SocialConnectionResponse(**view.__dict__) for view in views]


@router.get("/linkedin/start", response_model=SocialConnectionStartResponse)
async def start_linkedin_connect(
    redirect_uri: str = Query(..., min_length=1),
    app_user_id: UUID = Depends(get_current_app_user_id),
    use_case: StartLinkedInConnectUseCase = Depends(get_start_linkedin_connect_use_case),
) -> SocialConnectionStartResponse:
    view = await use_case.execute(
        StartLinkedInConnectInput(app_user_id=app_user_id, redirect_uri=redirect_uri)
    )
    return SocialConnectionStartResponse(**view.__dict__)


@router.get("/linkedin/callback", response_model=SocialConnectionResponse)
async def complete_linkedin_connect(
    code: str = Query(..., min_length=1),
    state: str = Query(..., min_length=1),
    redirect_uri: str = Query(..., min_length=1),
    app_user_id: UUID = Depends(get_current_app_user_id),
    use_case: CompleteLinkedInConnectUseCase = Depends(get_complete_linkedin_connect_use_case),
) -> SocialConnectionResponse:
    view = await use_case.execute(
        CompleteLinkedInConnectInput(
            app_user_id=app_user_id,
            code=code,
            state=state,
            redirect_uri=redirect_uri,
        )
    )
    return SocialConnectionResponse(**view.__dict__)


@router.delete("/{connection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def disconnect_social_connection(
    connection_id: UUID,
    app_user_id: UUID = Depends(get_current_app_user_id),
    use_case: DisconnectSocialConnectionUseCase = Depends(get_disconnect_social_connection_use_case),
) -> None:
    await use_case.execute(connection_id=connection_id, app_user_id=app_user_id)
