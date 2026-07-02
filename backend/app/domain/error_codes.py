from enum import StrEnum


class ErrorCode(StrEnum):
    CLIENT_ERROR = "client_error"
    NOT_FOUND = "not_found"
    METHOD_NOT_ALLOWED = "method_not_allowed"
    TOO_MANY_FILES = "too_many_files"
    FILE_TOO_LARGE = "file_too_large"
    UNSUPPORTED_FILE_TYPE = "unsupported_file_type"
    EMPTY_FILE = "empty_file"
    INVALID_GENERATE_INPUT = "invalid_generate_input"
    CONTENT_GENERATION_FAILED = "content_generation_failed"
    INVALID_MODEL_OUTPUT = "invalid_model_output"
    MODEL_EMPTY_OUTPUT = "model_empty_output"
    REFINE_FAILED = "refine_failed"
    BACKEND_AUTH_NOT_CONFIGURED = "backend_auth_not_configured"
    UNAUTHORIZED = "unauthorized"
    DRAFT_NOT_FOUND = "draft_not_found"
    FILE_NOT_FOUND = "file_not_found"
    AI_EXECUTION_NOT_FOUND = "ai_execution_not_found"
    INTERNAL_SERVER_ERROR = "internal_server_error"
