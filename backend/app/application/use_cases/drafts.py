from dataclasses import dataclass
from uuid import UUID

from app.application.dto import DraftSummaryView, DraftView, UploadedFileView
from app.application.ports import DraftRepository, FileRepository, ObjectStorage
from app.domain.entities import Draft
from app.domain.exceptions import InvalidGenerateInputError
from app.domain.value_objects import Platform


@dataclass
class SaveDraftInput:
    app_user_id: UUID
    raw_text: str
    selected_platforms: list[Platform]
    posts: dict[Platform, str]
    file_ids: list[UUID]
    title: str = ""
    draft_id: UUID | None = None


class SaveDraftUseCase:
    def __init__(self, drafts: DraftRepository, files: FileRepository) -> None:
        self._drafts = drafts
        self._files = files

    async def execute(self, payload: SaveDraftInput) -> UUID:
        title = _normalize_title(payload.title, payload.raw_text, payload.posts)
        await self._validate_file_ids(payload.file_ids, app_user_id=payload.app_user_id)
        if payload.draft_id is None:
            draft = Draft(
                app_user_id=payload.app_user_id,
                title=title,
                raw_text=payload.raw_text,
                selected_platforms=payload.selected_platforms,
                posts=payload.posts,
                file_ids=payload.file_ids,
            )
            await self._drafts.add(draft)
            return draft.id

        current = await self._drafts.get(payload.draft_id, app_user_id=payload.app_user_id)
        if current is None:
            raise InvalidGenerateInputError("Draft not found")

        current.title = title
        current.raw_text = payload.raw_text
        current.selected_platforms = payload.selected_platforms
        current.posts = payload.posts
        current.file_ids = payload.file_ids
        await self._drafts.update(current)
        return current.id

    async def _validate_file_ids(self, file_ids: list[UUID], *, app_user_id: UUID) -> None:
        for file_id in file_ids:
            if await self._files.get(file_id, app_user_id=app_user_id) is None:
                raise InvalidGenerateInputError(f"File '{file_id}' not found")


class GetDraftUseCase:
    def __init__(
        self,
        drafts: DraftRepository,
        files: FileRepository,
        storage: ObjectStorage,
    ) -> None:
        self._drafts = drafts
        self._files = files
        self._storage = storage

    async def execute(self, draft_id: UUID, *, app_user_id: UUID) -> DraftView | None:
        draft = await self._drafts.get(draft_id, app_user_id=app_user_id)
        if draft is None:
            return None
        return await _to_draft_view(draft, self._files, self._storage)


class ListDraftsUseCase:
    def __init__(self, drafts: DraftRepository) -> None:
        self._drafts = drafts

    async def execute(self, *, app_user_id: UUID, limit: int = 50) -> list[DraftSummaryView]:
        drafts = await self._drafts.list_recent(limit=limit, app_user_id=app_user_id)
        return [
            DraftSummaryView(
                id=draft.id,
                title=draft.title,
                selected_platforms=[platform.value for platform in draft.selected_platforms],
                posts_count=len(draft.posts),
                raw_text_preview=_preview_text(draft.raw_text),
                updated_at=draft.updated_at,
                created_at=draft.created_at,
            )
            for draft in drafts
        ]


async def _to_draft_view(
    draft: Draft,
    files: FileRepository,
    storage: ObjectStorage,
) -> DraftView:
    uploaded_files: list[UploadedFileView] = []
    available_file_ids: list[UUID] = []
    for file_id in draft.file_ids:
        file = await files.get(file_id, app_user_id=draft.app_user_id)
        if file is None or file.content_type is None:
            continue
        available_file_ids.append(file.id)
        uploaded_files.append(
            UploadedFileView(
                id=file.id,
                original_filename=file.original_filename,
                content_type=file.content_type.value,
                size_bytes=file.size_bytes,
                url=await storage.presigned_get_url(file.storage_key),
                created_at=file.created_at,
            )
        )

    return DraftView(
        id=draft.id,
        app_user_id=draft.app_user_id,
        title=draft.title,
        raw_text=draft.raw_text,
        selected_platforms=[platform.value for platform in draft.selected_platforms],
        posts={platform.value: text for platform, text in draft.posts.items()},
        file_ids=available_file_ids,
        created_at=draft.created_at,
        updated_at=draft.updated_at,
        files=uploaded_files,
    )


def _normalize_title(title: str, raw_text: str, posts: dict[Platform, str]) -> str:
    if title.strip():
        return title.strip()[:120]

    source = raw_text.strip()
    if source:
        first_line = source.splitlines()[0].strip()
        if first_line:
            return first_line[:120]

    for text in posts.values():
        line = text.strip().splitlines()[0].strip()
        if line:
            return line[:120]

    return "Untitled draft"


def _preview_text(text: str) -> str:
    compact = " ".join(text.split())
    return compact[:140] + ("..." if len(compact) > 140 else "")
