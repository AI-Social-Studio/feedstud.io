import asyncio
from dataclasses import dataclass
from uuid import UUID

from app.application.dto import GenerateResultView
from app.application.ports import ContentGenerator, FileRepository, ObjectStorage
from app.domain.exceptions import (
    ContentGenerationError,
    InvalidGenerateInputError,
)
from app.domain.value_objects import Platform, RefineAction


@dataclass
class GeneratePostsInput:
    raw_text: str
    platforms: list[Platform]
    file_ids: list[UUID]


@dataclass
class RefinePostInput:
    platform: Platform
    text: str
    action: RefineAction


class GeneratePostsUseCase:
    def __init__(
        self,
        generator: ContentGenerator,
        files: FileRepository,
        storage: ObjectStorage,
    ) -> None:
        self._generator = generator
        self._files = files
        self._storage = storage

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
        errors: dict[str, str] = {}
        for platform, result in zip(payload.platforms, results):
            if isinstance(result, Exception):
                reason = (
                    result.reason
                    if isinstance(result, ContentGenerationError)
                    else str(result)
                )
                errors[platform.value] = reason
                continue
            posts[platform.value] = result.post.text

        return GenerateResultView(posts=posts, errors=errors)


class RefinePostUseCase:
    def __init__(self, generator: ContentGenerator) -> None:
        self._generator = generator

    async def execute(self, payload: RefinePostInput) -> str:
        if not payload.text.strip():
            raise InvalidGenerateInputError("Brak tekstu do refine")
        result = await self._generator.refine(
            platform=payload.platform,
            text=payload.text,
            action=payload.action,
        )
        return result.post.text
