from typing import TYPE_CHECKING

from app.domain.error_codes import ErrorCode

if TYPE_CHECKING:
    from app.domain.entities import AiExecution


class DomainError(Exception):
    def __init__(
        self,
        reason: str,
        *,
        code: ErrorCode,
        public_message: str | None = None,
        meta: dict[str, str | int] | None = None,
    ) -> None:
        super().__init__(reason)
        self.reason = reason
        self.code = code
        self.public_message = public_message or reason
        self.meta = meta


class TooManyFilesError(DomainError):
    def __init__(self, max_files: int, received: int) -> None:
        super().__init__(
            f"Too many files: received {received}, max allowed {max_files}",
            code=ErrorCode.TOO_MANY_FILES,
            public_message=f"Too many files uploaded. Maximum allowed is {max_files}.",
            meta={"max_files": max_files, "received": received},
        )
        self.max_files = max_files
        self.received = received


class FileTooLargeError(DomainError):
    def __init__(self, filename: str, size: int, max_size: int) -> None:
        super().__init__(
            f"File '{filename}' is {size} bytes, max allowed {max_size}",
            code=ErrorCode.FILE_TOO_LARGE,
            public_message=f"File '{filename}' is too large.",
            meta={"filename": filename, "size": size, "max_size": max_size},
        )
        self.filename = filename
        self.size = size
        self.max_size = max_size


class UnsupportedFileTypeError(DomainError):
    def __init__(self, filename: str, content_type: str) -> None:
        super().__init__(
            f"File '{filename}' has unsupported type '{content_type}'",
            code=ErrorCode.UNSUPPORTED_FILE_TYPE,
            public_message=f"File '{filename}' has an unsupported type.",
            meta={"filename": filename, "content_type": content_type},
        )
        self.filename = filename
        self.content_type = content_type


class EmptyFileError(DomainError):
    def __init__(self, filename: str) -> None:
        super().__init__(
            f"File '{filename}' is empty",
            code=ErrorCode.EMPTY_FILE,
            public_message=f"File '{filename}' is empty.",
            meta={"filename": filename},
        )
        self.filename = filename


class InvalidGenerateInputError(DomainError):
    def __init__(self, reason: str) -> None:
        super().__init__(
            reason,
            code=ErrorCode.INVALID_GENERATE_INPUT,
            public_message=reason,
        )


class ContentGenerationError(DomainError):
    def __init__(
        self,
        platform: str,
        reason: str,
        trace: "AiExecution | None" = None,
        *,
        code: ErrorCode = ErrorCode.CONTENT_GENERATION_FAILED,
        public_message: str | None = None,
    ) -> None:
        super().__init__(
            f"Generation failed for '{platform}': {reason}",
            code=code,
            public_message=public_message or reason,
            meta={"platform": platform, "reason": reason},
        )
        self.platform = platform
        self.trace = trace


class RefineError(DomainError):
    def __init__(
        self,
        platform: str,
        action: str,
        reason: str,
        trace: "AiExecution | None" = None,
        *,
        code: ErrorCode = ErrorCode.REFINE_FAILED,
        public_message: str | None = None,
    ) -> None:
        super().__init__(
            f"Refine '{action}' failed for '{platform}': {reason}",
            code=code,
            public_message=public_message or reason,
            meta={"platform": platform, "action": action, "reason": reason},
        )
        self.platform = platform
        self.action = action
        self.trace = trace
