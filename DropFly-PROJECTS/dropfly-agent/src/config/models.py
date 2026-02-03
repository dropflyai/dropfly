"""Model configuration and failover logic.

Defines which models to use for different tasks and handles
automatic failover when a provider is down or rate-limited.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any

from ..core.providers import ProviderRegistry, LLMProvider

logger = logging.getLogger(__name__)


@dataclass
class ModelConfig:
    """Configuration for a model with failover chain."""

    primary: str  # e.g., "anthropic/claude-opus-4-5-20250514"
    fallbacks: list[str] = field(default_factory=list)
    max_tokens: int = 8192
    temperature: float = 0.0


# Default model configurations by role
DEFAULT_MODELS = {
    "orchestrator": ModelConfig(
        primary="anthropic/claude-opus-4-5-20250514",
        fallbacks=[
            "openai/gpt-4o",
            "anthropic/claude-sonnet-4-20250514",
        ],
        max_tokens=8192,
    ),
    "execution": ModelConfig(
        primary="anthropic/claude-sonnet-4-20250514",
        fallbacks=[
            "openai/gpt-4o",
            "anthropic/claude-haiku-4-20250414",
        ],
        max_tokens=8192,
    ),
    "fast": ModelConfig(
        primary="anthropic/claude-haiku-4-20250414",
        fallbacks=[
            "openai/gpt-4o-mini",
            "ollama/llama3.2",
        ],
        max_tokens=4096,
    ),
    "research": ModelConfig(
        primary="anthropic/claude-opus-4-5-20250514",
        fallbacks=["openai/gpt-4o"],
        max_tokens=8192,
    ),
}


class ModelResolver:
    """Resolves model strings with failover support.

    Usage:
        resolver = ModelResolver(registry)
        provider, model = await resolver.resolve("orchestrator")
        # Or specific model:
        provider, model = await resolver.resolve("anthropic/claude-opus-4-5")
    """

    def __init__(
        self,
        registry: ProviderRegistry,
        configs: dict[str, ModelConfig] | None = None,
    ):
        self.registry = registry
        self.configs = configs or DEFAULT_MODELS
        self._cooldowns: dict[str, float] = {}  # provider -> cooldown_until timestamp

    async def resolve(self, model_or_role: str) -> tuple[LLMProvider, str]:
        """Resolve a model string or role name to a provider and model.

        Args:
            model_or_role: Either a role ("orchestrator", "execution", "fast")
                          or a model string ("anthropic/claude-opus-4-5").

        Returns:
            (provider, model_name) tuple.
        """
        if model_or_role in self.configs:
            config = self.configs[model_or_role]
            models_to_try = [config.primary] + config.fallbacks
        else:
            models_to_try = [model_or_role]

        for model_id in models_to_try:
            try:
                provider, model_name = self.registry.resolve(model_id)
                return provider, model_name
            except KeyError:
                logger.debug(f"Provider not available for {model_id}, trying next")
                continue

        raise RuntimeError(
            f"No provider available for '{model_or_role}'. "
            f"Tried: {models_to_try}. "
            f"Available providers: {self.registry.available}"
        )

    def get_config(self, role: str) -> ModelConfig:
        """Get the model config for a role."""
        return self.configs.get(role, DEFAULT_MODELS.get("execution", ModelConfig(primary="anthropic/claude-sonnet-4-20250514")))
