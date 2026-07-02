from fastapi import APIRouter, Depends, Header, status

from app.application.use_cases.generate_posts import (
    GeneratePostsInput,
    GeneratePostsUseCase,
    RefinePostInput,
    RefinePostUseCase,
)
from app.domain.value_objects import Platform, RefineAction
from app.interface.dependencies import (
    get_generate_posts_use_case,
    get_refine_post_use_case,
)
from app.interface.schemas import (
    GenerateRequest,
    GenerateResponse,
    RefineRequest,
    RefineResponse,
)

router = APIRouter(tags=["generate"])


@router.post(
    "/generate",
    response_model=GenerateResponse,
    status_code=status.HTTP_200_OK,
    summary="Generuj posty pod wybrane platformy z brudnopisu",
)
async def generate_posts(
    payload: GenerateRequest,
    actor_user_id: str | None = Header(default=None, alias="X-Actor-Id"),
    use_case: GeneratePostsUseCase = Depends(get_generate_posts_use_case),
) -> GenerateResponse:
    result = await use_case.execute(
        GeneratePostsInput(
            raw_text=payload.raw,
            platforms=[Platform(p) for p in payload.platforms],
            file_ids=payload.file_ids,
            actor_user_id=actor_user_id,
        )
    )
    return GenerateResponse(posts=result.posts, errors=result.errors)


@router.post(
    "/refine",
    response_model=RefineResponse,
    status_code=status.HTTP_200_OK,
    summary="Przerob istniejacy post (hook/shorten/formal/casual/cta/hashtags)",
)
async def refine_post(
    payload: RefineRequest,
    actor_user_id: str | None = Header(default=None, alias="X-Actor-Id"),
    use_case: RefinePostUseCase = Depends(get_refine_post_use_case),
) -> RefineResponse:
    text = await use_case.execute(
        RefinePostInput(
            platform=Platform(payload.platform),
            text=payload.text,
            action=RefineAction(payload.action),
            actor_user_id=actor_user_id,
        )
    )
    return RefineResponse(text=text)
