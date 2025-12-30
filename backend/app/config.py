"""
Application configuration using Pydantic Settings.

Environment variables are loaded from .env file and can be overridden
by actual environment variables.
"""

from functools import lru_cache
from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict

# Get the directory where this config file is located
_BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Database
    database_url: str = "sqlite+aiosqlite:///./productivity.db"

    # Firebase
    firebase_project_id: Optional[str] = None
    firebase_service_account_path: Optional[str] = None
    firebase_private_key_id: Optional[str] = None
    firebase_private_key: Optional[str] = None
    firebase_client_email: Optional[str] = None
    firebase_client_id: Optional[str] = None

    # CORS
    allowed_origins: str = "http://localhost:5173"

    # Environment
    environment: str = "development"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    model_config = SettingsConfigDict(
        env_file=str(_BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    @property
    def cors_origins(self) -> list[str]:
        """Parse comma-separated origins into a list."""
        return [origin.strip() for origin in self.allowed_origins.split(",")]

    @property
    def is_development(self) -> bool:
        """Check if running in development mode."""
        return self.environment.lower() == "development"

    @property
    def is_production(self) -> bool:
        """Check if running in production mode."""
        return self.environment.lower() == "production"

    @property
    def firebase_service_account_path_resolved(self) -> Optional[str]:
        """Resolve Firebase service account path relative to backend directory."""
        if self.firebase_service_account_path:
            path = Path(self.firebase_service_account_path)
            if not path.is_absolute():
                path = _BASE_DIR / self.firebase_service_account_path
            if path.exists():
                return str(path)
        return None


@lru_cache
def get_settings() -> Settings:
    """
    Get cached settings instance.
    
    Using lru_cache ensures settings are only loaded once.
    """
    return Settings()
