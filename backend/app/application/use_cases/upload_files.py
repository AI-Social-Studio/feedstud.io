from dataclasses import dataclass
from uuid import UUID

from app.application.dto import IncomingFile, UploadedFileView
from app.application.ports import FileRepository, ObjectStorage
from app.domain.entities import UploadedFile
from app.domain.exceptions import (
    EmptyFileError,
    FileTooLargeError,
    TooManyFilesError,
)
from app.domain.value_objects import ImageContentType


@dataclass
class UploadLimits:
    max_files: int
    max_file_bytes: int


class UploadFilesUseCase:
    def __init__(
        self,
        storage: ObjectStorage,
        repository: FileRepository,
        limits: UploadLimits,
    ) -> None:
        self._storage = storage
        self._repository = repository
        self._limits = limits

    async def execute(self, files: list[IncomingFile], *, app_user_id: UUID) -> list[UploadedFileView]:
        if len(files) > self._limits.max_files:
            raise TooManyFilesError(max_files=self._limits.max_files, received=len(files))
        if not files:
            return []

        for f in files:
            if f.size <= 0:
                raise EmptyFileError(filename=f.filename)
            if f.size > self._limits.max_file_bytes:
                raise FileTooLargeError(
                    filename=f.filename,
                    size=f.size,
                    max_size=self._limits.max_file_bytes,
                )

        stored: list[UploadedFile] = []
        for f in files:
            content_type = ImageContentType.from_mime(f.content_type, filename=f.filename)
            entity = UploadedFile(
                app_user_id=app_user_id,
                original_filename=f.filename,
                content_type=content_type,
                size_bytes=f.size,
            )
            entity.storage_key = f"uploads/{entity.id}.{content_type.extension}"

            await self._storage.put(
                key=entity.storage_key,
                data=f.stream,
                size=f.size,
                content_type=content_type.value,
            )
            await self._repository.add(entity)
            stored.append(entity)

        return [await self._to_view(e) for e in stored]

    async def _to_view(self, entity: UploadedFile) -> UploadedFileView:
        assert entity.content_type is not None
        url = await self._storage.presigned_get_url(entity.storage_key)
        return UploadedFileView(
            id=entity.id,
            original_filename=entity.original_filename,
            content_type=entity.content_type.value,
            size_bytes=entity.size_bytes,
            url=url,
            created_at=entity.created_at,
        )


class GetFileUseCase:
    def __init__(self, storage: ObjectStorage, repository: FileRepository) -> None:
        self._storage = storage
        self._repository = repository

    async def execute(self, file_id: UUID, *, app_user_id: UUID) -> UploadedFileView | None:
        entity = await self._repository.get(file_id, app_user_id=app_user_id)
        if entity is None or entity.content_type is None:
            return None
        url = await self._storage.presigned_get_url(entity.storage_key)
        return UploadedFileView(
            id=entity.id,
            original_filename=entity.original_filename,
            content_type=entity.content_type.value,
            size_bytes=entity.size_bytes,
            url=url,
            created_at=entity.created_at,
        )


class DeleteFileUseCase:
    def __init__(self, storage: ObjectStorage, repository: FileRepository) -> None:
        self._storage = storage
        self._repository = repository

    async def execute(self, file_id: UUID, *, app_user_id: UUID) -> bool:
        entity = await self._repository.get(file_id, app_user_id=app_user_id)
        if entity is None:
            return False
        if not await self._repository.delete(file_id, app_user_id=app_user_id):
            return False
        await self._storage.delete(entity.storage_key)
        return True
