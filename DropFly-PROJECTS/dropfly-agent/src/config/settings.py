"""Application settings loaded from environment."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Optional

from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env from project root
_project_root = Path(__file__).parent.parent.parent
_env_file = _project_root / ".env"
if _env_file.exists():
    load_dotenv(_env_file)

# Also load from prototype credentials
_cred_env = Path(__file__).parent.parent.parent.parent / "prototype_x1000" / "credentials" / ".env"
if _cred_env.exists():
    load_dotenv(_cred_env, override=False)


class LLMSettings(BaseModel):
    """LLM provider configuration."""

    orchestrator_model: str = "anthropic/claude-opus-4-5-20250514"
    execution_model: str = "anthropic/claude-sonnet-4-20250514"
    fast_model: str = "anthropic/claude-haiku-4-20250414"

    anthropic_api_key: str = ""
    openai_api_key: str = ""
    google_api_key: str = ""
    mistral_api_key: str = ""
    ollama_base_url: str = "http://localhost:11434"


class DatabaseSettings(BaseModel):
    """Database configuration."""

    supabase_url: str = ""
    supabase_service_key: str = ""


class GatewaySettings(BaseModel):
    """API gateway configuration."""

    host: str = "0.0.0.0"
    port: int = 8420
    secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"


class ExecutionSettings(BaseModel):
    """Execution environment configuration."""

    workspace_root: str = "./workspaces"
    sandbox_enabled: bool = True
    docker_sandbox_image: str = "dropfly-sandbox:latest"
    max_concurrent_agents: int = 10
    agent_timeout: float = 600.0


class CommunicationSettings(BaseModel):
    """Communication tools configuration."""

    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""
    elevenlabs_api_key: str = ""
    tavily_api_key: str = ""


class AWSSettings(BaseModel):
    """AWS configuration."""

    access_key_id: str = ""
    secret_access_key: str = ""
    region: str = "us-east-1"


class Settings(BaseModel):
    """Root settings object. Loads from environment on init."""

    llm: LLMSettings = LLMSettings()
    database: DatabaseSettings = DatabaseSettings()
    gateway: GatewaySettings = GatewaySettings()
    execution: ExecutionSettings = ExecutionSettings()
    communication: CommunicationSettings = CommunicationSettings()
    aws: AWSSettings = AWSSettings()

    # Paths
    project_root: str = str(_project_root)
    brains_root: str = str(
        Path(__file__).parent.parent.parent.parent / "prototype_x1000"
    )

    @classmethod
    def from_env(cls) -> Settings:
        """Load settings from environment variables."""
        return cls(
            llm=LLMSettings(
                orchestrator_model=os.getenv("ORCHESTRATOR_MODEL", "anthropic/claude-opus-4-5-20250514"),
                execution_model=os.getenv("EXECUTION_MODEL", "anthropic/claude-sonnet-4-20250514"),
                fast_model=os.getenv("FAST_MODEL", "anthropic/claude-haiku-4-20250414"),
                anthropic_api_key=os.getenv("ANTHROPIC_API_KEY", ""),
                openai_api_key=os.getenv("OPENAI_API_KEY", ""),
                google_api_key=os.getenv("GOOGLE_API_KEY", ""),
                mistral_api_key=os.getenv("MISTRAL_API_KEY", ""),
                ollama_base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
            ),
            database=DatabaseSettings(
                supabase_url=os.getenv("SUPABASE_URL", ""),
                supabase_service_key=os.getenv("SUPABASE_SERVICE_KEY", ""),
            ),
            gateway=GatewaySettings(
                host=os.getenv("GATEWAY_HOST", "0.0.0.0"),
                port=int(os.getenv("GATEWAY_PORT", "8420")),
                secret_key=os.getenv("GATEWAY_SECRET_KEY", "change-me-in-production"),
                jwt_algorithm=os.getenv("JWT_ALGORITHM", "HS256"),
            ),
            execution=ExecutionSettings(
                workspace_root=os.getenv("WORKSPACE_ROOT", "./workspaces"),
                sandbox_enabled=os.getenv("SANDBOX_ENABLED", "true").lower() == "true",
                docker_sandbox_image=os.getenv("DOCKER_SANDBOX_IMAGE", "dropfly-sandbox:latest"),
                max_concurrent_agents=int(os.getenv("MAX_CONCURRENT_AGENTS", "10")),
                agent_timeout=float(os.getenv("AGENT_TIMEOUT", "600")),
            ),
            communication=CommunicationSettings(
                twilio_account_sid=os.getenv("TWILIO_ACCOUNT_SID", ""),
                twilio_auth_token=os.getenv("TWILIO_AUTH_TOKEN", ""),
                twilio_phone_number=os.getenv("TWILIO_PHONE_NUMBER", ""),
                elevenlabs_api_key=os.getenv("ELEVENLABS_API_KEY", ""),
                tavily_api_key=os.getenv("TAVILY_API_KEY", ""),
            ),
            aws=AWSSettings(
                access_key_id=os.getenv("AWS_ACCESS_KEY_ID", ""),
                secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY", ""),
                region=os.getenv("AWS_REGION", "us-east-1"),
            ),
        )


# Singleton
_settings: Optional[Settings] = None


def get_settings() -> Settings:
    """Get the application settings (singleton)."""
    global _settings
    if _settings is None:
        _settings = Settings.from_env()
    return _settings
