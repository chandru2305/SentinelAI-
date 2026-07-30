from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "SentinelAI"
    app_version: str = "1.0.0"
    app_description: str = "Enterprise AI Security Platform"
    host: str = "0.0.0.0"
    port: int = 8000
    api_prefix: str = "/api/v1"
    ollama_url: str = "http://localhost:11434"
    jwt_secret: str = "placeholder-secret"
    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/sentinelai"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
