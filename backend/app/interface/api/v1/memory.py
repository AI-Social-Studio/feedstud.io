from fastapi import APIRouter, Depends, status

from app.application.use_cases.user_memory import GetUserMemoryUseCase, UpsertUserMemoryUseCase
from app.interface.dependencies import get_get_user_memory_use_case, get_trusted_actor_user_id, get_upsert_user_memory_use_case
from app.interface.schemas import UserMemoryRequest, UserMemoryResponse

router = APIRouter(prefix="/memory", tags=["memory"])


@router.put(
    "/upsert",
    response_model=UserMemoryResponse,
    status_code=status.HTTP_200_OK,
    summary="Create or replace the calling user's memory profile",
)
async def upsert_memory(
    body: UserMemoryRequest,
    user_id: str | None = Depends(get_trusted_actor_user_id),
    use_case: UpsertUserMemoryUseCase = Depends(get_upsert_user_memory_use_case),
) -> UserMemoryResponse:
    actor = user_id or "anonymous"
    memory = await use_case.execute(
        user_id=actor,
        self_description=body.self_description,
        interests_tags=body.interests_tags,
        primary_platforms=body.primary_platforms,
        target_audience_intents=body.target_audience_intents,
        post_goals=body.post_goals,
    )
    return UserMemoryResponse.model_validate(memory)


@router.get(
    "/me",
    response_model=UserMemoryResponse | None,
    status_code=status.HTTP_200_OK,
    summary="Fetch the calling user's memory profile",
)
async def get_memory(
    user_id: str | None = Depends(get_trusted_actor_user_id),
    use_case: GetUserMemoryUseCase = Depends(get_get_user_memory_use_case),
) -> UserMemoryResponse | None:
    actor = user_id or "anonymous"
    memory = await use_case.execute(user_id=actor)
    return UserMemoryResponse.model_validate(memory) if memory else None
