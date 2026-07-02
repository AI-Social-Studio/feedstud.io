from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: str = "development"
    app_port: int = 4000
    cors_origins: str = "http://localhost:3000"

    database_url: str

    minio_endpoint: str
    minio_access_key: str
    minio_secret_key: str
    minio_bucket: str
    minio_secure: bool = False
    minio_public_endpoint: str = ""

    upload_max_files: int = Field(default=10, ge=1, le=100)
    upload_max_file_bytes: int = Field(default=10 * 1024 * 1024, ge=1)

    db_reset_on_start: bool = False
    ai_execution_retention_days: int = Field(default=30, ge=1, le=365)

    backend_internal_api_key: str = ""

    openrouter_api_key: str = ""
    openrouter_model: str = "openai/gpt-oss-120b:free"
    openrouter_max_tokens: int = 8192
    openrouter_temperature: float = 0.9
    openrouter_site_url: str = "http://localhost:3000"
    openrouter_app_name: str = "FlowForge"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
