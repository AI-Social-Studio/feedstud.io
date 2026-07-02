from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.domain.entities import AiExecution


class DomainError(Exception):
    pass


class TooManyFilesError(DomainError):
    def __init__(self, max_files: int, received: int) -> None:
        super().__init__(f"Too many files: received {received}, max allowed {max_files}")
        self.max_files = max_files
        self.received = received


class FileTooLargeError(DomainError):
    def __init__(self, filename: str, size: int, max_size: int) -> None:
        super().__init__(f"File '{filename}' is {size} bytes, max allowed {max_size}")
        self.filename = filename
        self.size = size
        self.max_size = max_size


class UnsupportedFileTypeError(DomainError):
    def __init__(self, filename: str, content_type: str) -> None:
        super().__init__(f"File '{filename}' has unsupported type '{content_type}'")
        self.filename = filename
        self.content_type = content_type


class EmptyFileError(DomainError):
    def __init__(self, filename: str) -> None:
        super().__init__(f"File '{filename}' is empty")
        self.filename = filename


class InvalidGenerateInputError(DomainError):
    def __init__(self, reason: str) -> None:
        super().__init__(reason)
        self.reason = reason


class ContentGenerationError(DomainError):
    def __init__(self, platform: str, reason: str, trace: "AiExecution | None" = None) -> None:
        super().__init__(f"Generation failed for '{platform}': {reason}")
        self.platform = platform
        self.reason = reason
        self.trace = trace


class RefineError(DomainError):
    def __init__(
        self,
        platform: str,
        action: str,
        reason: str,
        trace: "AiExecution | None" = None,
    ) -> None:
        super().__init__(f"Refine '{action}' failed for '{platform}': {reason}")
        self.platform = platform
        self.action = action
        self.reason = reason
        self.trace = trace
