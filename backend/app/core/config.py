import logging
import secrets
from typing import List, Union

from pydantic import Field, validator, AnyHttpUrl
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    app_name: str = "SentinelAI"
    app_version: str = "1.0.0"
    app_description: str = "Enterprise AI Security Platform"
    app_env: str = "production"
    debug: bool = False
    
    host: str = "0.0.0.0"
    port: int = 8000
    api_prefix: str = "/api/v1"
    
    ollama_url: str = "http://localhost:11434"
    ollama_model: str = "llama-3b"
    ollama_timeout: float = 30.0
    max_prompt_size: int = 4096
    
    # Security
    jwt_secret: str = Field(default="")
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60
    
    admin_username: str = Field(default="")
    admin_password: str = Field(default="")
    
    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/sentinelai"
    
    # CORS
    cors_origins: str = "http://localhost:5173"

    @property
    def get_cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

# Validate configuration on startup
if not settings.jwt_secret:
    if settings.app_env == "development":
        settings.jwt_secret = secrets.token_hex(32)
        logger.warning("SECURITY WARNING: JWT_SECRET was missing. A temporary random secret has been generated for development.")
    else:
        raise ValueError("CRITICAL: JWT_SECRET environment variable is missing. Refusing to start in production without a secure secret.")

if not settings.admin_username or not settings.admin_password:
    if settings.app_env == "development":
        settings.admin_username = settings.admin_username or "admin"
        settings.admin_password = settings.admin_password or "admin123"
        logger.warning("SECURITY WARNING: Admin credentials missing. Using development defaults. Change them in production.")
    else:
        raise ValueError("CRITICAL: ADMIN_USERNAME and ADMIN_PASSWORD must be explicitly set in the environment.")
