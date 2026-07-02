import asyncio
from dataclasses import dataclass
from uuid import UUID

from app.application.dto import ErrorView, GenerateResultView
from app.domain.error_codes import ErrorCode
from app.application.ports import AiExecutionRepository, ContentGenerator, FileRepository, ObjectStorage
from app.domain.exceptions import (
    ContentGenerationError,
    InvalidGenerateInputError,
    RefineError,
)
from app.domain.value_objects import Platform, RefineAction


@dataclass
class GeneratePostsInput:
    raw_text: str
    platforms: list[Platform]
    file_ids: list[UUID]
    actor_user_id: str | None = None


@dataclass
class RefinePostInput:
    platform: Platform
    text: str
    action: RefineAction
    actor_user_id: str | None = None


class GeneratePostsUseCase:
    def __init__(
        self,
        generator: ContentGenerator,
        files: FileRepository,
        storage: ObjectStorage,
        executions: AiExecutionRepository,
    ) -> None:
        self._generator = generator
        self._files = files
        self._storage = storage
        self._executions = executions

    async def execute(self, payload: GeneratePostsInput) -> GenerateResultView:
        if not payload.platforms:
            raise InvalidGenerateInputError("Wybierz przynajmniej jedną platformę")
        if not payload.raw_text.strip() and not payload.file_ids:
            raise InvalidGenerateInputError("Podaj treść brudnopisu lub załącz pliki")

        image_urls: list[str] = []
        for fid in payload.file_ids:
            entity = await self._files.get(fid)
            if entity is None:
                raise InvalidGenerateInputError(f"Plik '{fid}' nie istnieje")
            image_urls.append(await self._storage.presigned_get_url(entity.storage_key))

        results = await asyncio.gather(
            *(
                self._generator.generate(p, payload.raw_text, image_urls)
                for p in payload.platforms
            ),
            return_exceptions=True,
        )

        posts: dict[str, str] = {}
        errors: dict[str, ErrorView] = {}
        for platform, result in zip(payload.platforms, results):
            if isinstance(result, Exception):
                if isinstance(result, ContentGenerationError) and result.trace is not None:
                    result.trace.user_id = payload.actor_user_id
                    await self._executions.add(result.trace)
                if isinstance(result, ContentGenerationError):
                    errors[platform.value] = ErrorView(
                        code=result.code,
                        detail=result.public_message,
                        meta=result.meta,
                    )
                else:
                    errors[platform.value] = ErrorView(
                        code=ErrorCode.CONTENT_GENERATION_FAILED,
                        detail="Content generation failed.",
                        meta={"platform": platform.value},
                    )
                continue
            result.trace.user_id = payload.actor_user_id
            await self._executions.add(result.trace)
            posts[platform.value] = result.post.text

        return GenerateResultView(posts=posts, errors=errors)


class RefinePostUseCase:
    def __init__(self, generator: ContentGenerator, executions: AiExecutionRepository) -> None:
        self._generator = generator
        self._executions = executions

    async def execute(self, payload: RefinePostInput) -> str:
        if not payload.text.strip():
            raise InvalidGenerateInputError("Brak tekstu do refine")
        try:
            result = await self._generator.refine(
                platform=payload.platform,
                text=payload.text,
                action=payload.action,
            )
        except RefineError as exc:
            if exc.trace is not None:
                exc.trace.user_id = payload.actor_user_id
                await self._executions.add(exc.trace)
            raise
        result.trace.user_id = payload.actor_user_id
        await self._executions.add(result.trace)
        return result.post.text
