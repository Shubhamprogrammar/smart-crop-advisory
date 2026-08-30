from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    port: int = 8000
    environment: str = "development"
    cors_origins: str = "http://localhost:5000,http://localhost:3000"

    hf_api_token: str | None = None
    chat_model_id: str = "Qwen/Qwen2.5-7B-Instruct"
    mongo_uri: str | None = None
    qdrant_url: str | None = None
    model_path: str = "./app/ml/artifacts"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
