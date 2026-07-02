from fastapi import APIRouter, Depends, status
from uuid import UUID

from app.application.use_cases.generate_jobs import (
    GetGenerateJobUseCase,
    SubmitGenerateJobInput,
    SubmitGenerateJobUseCase,
)
from app.application.use_cases.generate_posts import (
    RefinePostInput,
    RefinePostUseCase,
)
from app.domain.error_codes import ErrorCode
from app.domain.value_objects import Platform, RefineAction
from app.interface.dependencies import (
    get_get_generate_job_use_case,
    get_refine_post_use_case,
    get_submit_generate_job_use_case,
    get_trusted_actor_user_id,
)
from app.interface.errors import api_error
from app.interface.schemas import (
    ErrorResponse,
    GenerateAcceptedResponse,
    GenerateJobResponse,
    GenerateRequest,
    PlatformErrorResponse,
    RefineRequest,
    RefineResponse,
)

router = APIRouter(tags=["generate"])


@router.post(
    "/generate",
    response_model=GenerateAcceptedResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Generuj posty pod wybrane platformy z brudnopisu",
)
async def generate_posts(
    payload: GenerateRequest,
    actor_user_id: str | None = Depends(get_trusted_actor_user_id),
    use_case: SubmitGenerateJobUseCase = Depends(get_submit_generate_job_use_case),
) -> GenerateAcceptedResponse:
    result = await use_case.execute(
        SubmitGenerateJobInput(
            raw_text=payload.raw,
            platforms=[Platform(p) for p in payload.platforms],
            file_ids=payload.file_ids,
            actor_user_id=actor_user_id,
        )
    )
    return GenerateAcceptedResponse(job_id=result.job_id, status="queued")


@router.get(
    "/generate/{job_id}",
    response_model=GenerateJobResponse,
    status_code=status.HTTP_200_OK,
    summary="Pobierz status generowania",
)
async def get_generate_job(
    job_id: UUID,
    actor_user_id: str | None = Depends(get_trusted_actor_user_id),
    use_case: GetGenerateJobUseCase = Depends(get_get_generate_job_use_case),
) -> GenerateJobResponse:
    result = await use_case.execute(job_id)
    if result is None or result.actor_user_id != actor_user_id:
        raise api_error(status.HTTP_404_NOT_FOUND, ErrorCode.NOT_FOUND, "Generate job not found")
    return GenerateJobResponse(
        job_id=result.job_id,
        status=result.status,
        posts=result.posts,
        errors={
            platform: PlatformErrorResponse(
                code=error.code.value,
                detail=error.detail,
                meta=error.meta,
            )
            for platform, error in result.errors.items()
        },
        error=(
            ErrorResponse(
                code=result.error.code.value,
                detail=result.error.detail,
                meta=result.error.meta,
            )
            if result.error is not None
            else None
        ),
        created_at=result.created_at,
        updated_at=result.updated_at,
    )


@router.post(
    "/refine",
    response_model=RefineResponse,
    status_code=status.HTTP_200_OK,
    summary="Przerob istniejacy post (hook/shorten/formal/casual/cta/hashtags)",
)
async def refine_post(
    payload: RefineRequest,
    actor_user_id: str | None = Depends(get_trusted_actor_user_id),
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
