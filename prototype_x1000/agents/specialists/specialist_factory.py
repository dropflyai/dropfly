"""Factory for creating specialist agents."""

from typing import Any, Optional

from ..core.base_agent import BaseAgent
from ..core.memory_client import SupabaseMemoryClient
from .engineering_agent import EngineeringAgent
from .design_agent import DesignAgent
from .mba_agent import MBAAgent


class SpecialistFactory:
    """Factory for creating specialist brain agents.

    Provides a centralized way to instantiate specialist agents
    with consistent configuration.
    """

    # Registry of available specialists
    SPECIALISTS = {
        "engineering": EngineeringAgent,
        "design": DesignAgent,
        "mba": MBAAgent,
    }

    @classmethod
    def create(
        cls,
        brain_type: str,
        api_key: Optional[str] = None,
        memory_client: Optional[SupabaseMemoryClient] = None,
        model: Optional[str] = None,
        auto_log: bool = True,
        **kwargs: Any,
    ) -> BaseAgent:
        """Create a specialist agent.

        Args:
            brain_type: Type of specialist (engineering, design, mba).
            api_key: Anthropic API key.
            memory_client: Supabase client for logging.
            model: Override default model.
            auto_log: Whether to auto-log runs.
            **kwargs: Additional arguments passed to agent constructor.

        Returns:
            Instantiated specialist agent.

        Raises:
            ValueError: If brain_type is not recognized.
        """
        if brain_type not in cls.SPECIALISTS:
            available = ", ".join(cls.SPECIALISTS.keys())
            raise ValueError(
                f"Unknown specialist type: {brain_type}. "
                f"Available: {available}"
            )

        agent_class = cls.SPECIALISTS[brain_type]

        return agent_class(
            api_key=api_key,
            memory_client=memory_client,
            model=model,
            auto_log=auto_log,
            **kwargs,
        )

    @classmethod
    def register(
        cls,
        brain_type: str,
        agent_class: type,
    ) -> None:
        """Register a new specialist agent type.

        Args:
            brain_type: Name for the specialist.
            agent_class: Agent class to register.
        """
        if not issubclass(agent_class, BaseAgent):
            raise TypeError("Agent class must inherit from BaseAgent")

        cls.SPECIALISTS[brain_type] = agent_class

    @classmethod
    def get_available(cls) -> list[str]:
        """Get list of available specialist types.

        Returns:
            List of specialist type names.
        """
        return list(cls.SPECIALISTS.keys())

    @classmethod
    def get_description(cls, brain_type: str) -> str:
        """Get description of a specialist.

        Args:
            brain_type: The specialist type.

        Returns:
            Description string.
        """
        descriptions = {
            "engineering": "Code, APIs, databases, infrastructure, DevOps, automation",
            "design": "UI/UX, visual design, user research, branding, accessibility",
            "mba": "Business strategy, operations, financial analysis, GTM",
        }
        return descriptions.get(brain_type, "Unknown specialist")

    @classmethod
    def create_all(
        cls,
        api_key: Optional[str] = None,
        memory_client: Optional[SupabaseMemoryClient] = None,
        auto_log: bool = True,
    ) -> dict[str, BaseAgent]:
        """Create all available specialist agents.

        Args:
            api_key: Anthropic API key.
            memory_client: Supabase client.
            auto_log: Whether to auto-log.

        Returns:
            Dict mapping brain_type to agent instance.
        """
        agents = {}
        for brain_type in cls.SPECIALISTS:
            agents[brain_type] = cls.create(
                brain_type,
                api_key=api_key,
                memory_client=memory_client,
                auto_log=auto_log,
            )
        return agents
