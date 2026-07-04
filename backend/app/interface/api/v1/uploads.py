from uuid import UUID

from fastapi import APIRouter, Depends, File, UploadFile, status

from app.application.dto import IncomingFile
from app.application.use_cases.upload_files import (
    DeleteFileUseCase,
    GetFileUseCase,
    UploadFilesUseCase,
)
from app.domain.error_codes import ErrorCode
from app.interface.dependencies import (
    get_current_app_user_id,
    get_delete_use_case,
    get_get_use_case,
    get_upload_use_case,
)
from app.interface.errors import api_error
from app.interface.schemas import UploadedFileResponse, UploadResponse

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post(
    "",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload up to 10 image files (max 10 MB each)",
)
async def upload_files(
    files: list[UploadFile] = File(..., description="One or more image files"),
    app_user_id: UUID = Depends(get_current_app_user_id),
    use_case: UploadFilesUseCase = Depends(get_upload_use_case),
) -> UploadResponse:
    incoming: list[IncomingFile] = []
    for f in files:
        size = f.size if f.size is not None else 0
        incoming.append(
            IncomingFile(
                filename=f.filename or "unknown",
                content_type=f.content_type or "application/octet-stream",
                size=size,
                stream=f.file,
            )
        )

    views = await use_case.execute(incoming, app_user_id=app_user_id)
    return UploadResponse(
        files=[
            UploadedFileResponse(
                id=v.id,
                filename=v.original_filename,
                content_type=v.content_type,
                size_bytes=v.size_bytes,
                url=v.url,
                created_at=v.created_at,
            )
            for v in views
        ]
    )


@router.get("/{file_id}", response_model=UploadedFileResponse)
async def get_file(
    file_id: UUID,
    app_user_id: UUID = Depends(get_current_app_user_id),
    use_case: GetFileUseCase = Depends(get_get_use_case),
) -> UploadedFileResponse:
    view = await use_case.execute(file_id, app_user_id=app_user_id)
    if view is None:
        raise api_error(
            status.HTTP_404_NOT_FOUND,
            ErrorCode.FILE_NOT_FOUND,
            "File not found",
            {"file_id": str(file_id)},
        )
    return UploadedFileResponse(
        id=view.id,
        filename=view.original_filename,
        content_type=view.content_type,
        size_bytes=view.size_bytes,
        url=view.url,
        created_at=view.created_at,
    )


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    file_id: UUID,
    app_user_id: UUID = Depends(get_current_app_user_id),
    use_case: DeleteFileUseCase = Depends(get_delete_use_case),
) -> None:
    deleted = await use_case.execute(file_id, app_user_id=app_user_id)
    if not deleted:
        raise api_error(
            status.HTTP_404_NOT_FOUND,
            ErrorCode.FILE_NOT_FOUND,
            "File not found",
            {"file_id": str(file_id)},
        )
