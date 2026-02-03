"""Agent Factory — creates any agent type with consistent configuration.

Extensible registry: add new agent types at runtime.
"""

from __future__ import annotations

import logging
from typing import Any, Optional

from ..core.base_agent import BaseAgent
from ..core.agent_bus import AgentBus
from ..core.providers import LLMProvider, ProviderRegistry
from ..core.tool_registry import ToolRegistry

logger = logging.getLogger(__name__)

# Lazy imports to avoid circular deps
_AGENT_CLASSES: dict[str, type[BaseAgent]] | None = None


def _get_agent_classes() -> dict[str, type[BaseAgent]]:
    global _AGENT_CLASSES
    if _AGENT_CLASSES is None:
        from .intake_agent import IntakeAgent
        from .ceo_agent import CEOAgent
        from .research_agent import ResearchAgent
        from .engineering_agent import EngineeringAgent
        from .design_agent import DesignAgent
        from .qa_agent import QAAgent
        from .deploy_agent import DeployAgent
        from .mba_agent import MBAAgent
        from .communication_agent import CommunicationAgent

        _AGENT_CLASSES = {
            "intake": IntakeAgent,
            "ceo": CEOAgent,
            "research": ResearchAgent,
            "engineering": EngineeringAgent,
            "design": DesignAgent,
            "qa": QAAgent,
            "deploy": DeployAgent,
            "mba": MBAAgent,
            "communication": CommunicationAgent,
        }
    return _AGENT_CLASSES


class AgentFactory:
    """Factory for creating specialist agents.

    Usage:
        agent = AgentFactory.create("engineering", provider=my_provider)
        agent = AgentFactory.create("research", model="anthropic/claude-opus-4-5")

        # Register custom agent types
        AgentFactory.register("custom", MyCustomAgent)
        agent = AgentFactory.create("custom")
    """

    _custom_agents: dict[str, type[BaseAgent]] = {}

    @classmethod
    def create(
        cls,
        agent_type: str,
        agent_id: str | None = None,
        provider: LLMProvider | None = None,
        provider_registry: ProviderRegistry | None = None,
        model: str | None = None,
        tools: ToolRegistry | None = None,
        memory_client: Any | None = None,
        bus: AgentBus | None = None,
        max_iterations: int = 25,
        **kwargs: Any,
    ) -> BaseAgent:
        """Create a specialist agent.

        Args:
            agent_type: Type of agent (engineering, design, research, etc.).
            agent_id: Custom agent ID (auto-generated if not provided).
            provider: Explicit LLM provider.
            provider_registry: Registry for model resolution.
            model: Model override (e.g., "anthropic/claude-opus-4-5").
            tools: Custom tool registry.
            memory_client: Supabase memory client.
            bus: Agent communication bus.
            max_iterations: Max tool-use iterations.

        Returns:
            Configured agent instance.
        """
        # Check custom agents first, then built-in
        all_agents = {**_get_agent_classes(), **cls._custom_agents}

        if agent_type not in all_agents:
            available = ", ".join(sorted(all_agents.keys()))
            raise ValueError(
                f"Unknown agent type: '{agent_type}'. Available: {available}"
            )

        agent_class = all_agents[agent_type]

        # Build constructor args
        init_kwargs: dict[str, Any] = {
            "provider": provider,
            "provider_registry": provider_registry,
            "tools": tools,
            "memory_client": memory_client,
            "bus": bus,
            "max_iterations": max_iterations,
        }

        if agent_id:
            init_kwargs["agent_id"] = agent_id
        if model:
            init_kwargs["model"] = model

        # Some agents have custom init params
        if agent_type == "ceo" and bus:
            init_kwargs["agent_bus"] = bus

        init_kwargs.update(kwargs)

        # Filter to only params the class accepts
        import inspect

        sig = inspect.signature(agent_class.__init__)
        valid_params = set(sig.parameters.keys()) - {"self"}

        # If the class uses **kwargs, pass everything
        has_var_keyword = any(
            p.kind == inspect.Parameter.VAR_KEYWORD
            for p in sig.parameters.values()
        )

        if not has_var_keyword:
            init_kwargs = {k: v for k, v in init_kwargs.items() if k in valid_params}

        return agent_class(**init_kwargs)

    @classmethod
    def register(cls, agent_type: str, agent_class: type[BaseAgent]) -> None:
        """Register a custom agent type.

        Args:
            agent_type: Name for the agent type.
            agent_class: Agent class (must inherit from BaseAgent).
        """
        if not issubclass(agent_class, BaseAgent):
            raise TypeError(f"{agent_class} must inherit from BaseAgent")
        cls._custom_agents[agent_type] = agent_class
        logger.info(f"Registered custom agent type: {agent_type}")

    @classmethod
    def available(cls) -> list[str]:
        """Get all available agent types."""
        return sorted({**_get_agent_classes(), **cls._custom_agents}.keys())

    @classmethod
    def get_description(cls, agent_type: str) -> str:
        """Get a description of an agent type."""
        descriptions = {
            "intake": "Requirements extraction through intelligent questioning",
            "ceo": "Master orchestrator — decomposes tasks, spawns parallel agents",
            "research": "Deep research — web search, browser, GitHub, YouTube",
            "engineering": "Full-stack code builder — shell, files, git, builds",
            "design": "UI/UX specialist — component specs, design systems",
            "qa": "Testing & validation — unit tests, code review, security",
            "deploy": "Deployment — Vercel, AWS, Docker, CI/CD",
            "mba": "Business strategy — models, SWOT, economics, GTM",
            "communication": "User notifications — phone calls, SMS, email, voice",
        }
        return descriptions.get(agent_type, "Custom agent")
