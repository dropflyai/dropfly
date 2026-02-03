"""MBA Agent — Business strategy and analysis.

Ported from prototype_x1000 with async support. Handles business model
generation, SWOT analysis, unit economics, and go-to-market strategy.
"""

from __future__ import annotations

from typing import Any

from ..core.base_agent import BaseAgent
from ..core.brain_loader import BrainLoader
from ..core.tool_registry import ToolRegistry
from ..tools.web_search import register_web_tools


class MBAAgent(BaseAgent):
    """MBA Agent — business strategy, financial analysis, market research."""

    agent_type = "mba"
    default_model = "anthropic/claude-sonnet-4-20250514"

    def __init__(self, **kwargs: Any):
        self._brain_loader = BrainLoader()
        super().__init__(**kwargs)

    def _get_system_prompt(self, context: str | None = None) -> str:
        try:
            return self._brain_loader.build_system_prompt("mba", context)
        except FileNotFoundError:
            return """# MBA AGENT — Business Strategy Specialist

You are a senior business strategist with MBA-level expertise in:
- Business model design (lean canvas, BMC)
- SWOT analysis
- Unit economics (LTV, CAC, payback period)
- Go-to-market strategy
- Competitive analysis
- Financial modeling
- Pricing strategy
""" + (f"\n## Context\n{context}" if context else "")

    def _register_tools(self, registry: ToolRegistry) -> None:
        register_web_tools(registry)

        registry.register(
            name="create_business_model",
            description="Create a Business Model Canvas or Lean Canvas.",
            parameters={
                "type": "object",
                "properties": {
                    "model_type": {
                        "type": "string",
                        "enum": ["lean_canvas", "bmc"],
                        "description": "Type of business model",
                    },
                    "content": {"type": "object", "description": "Canvas sections"},
                },
                "required": ["model_type", "content"],
            },
            handler=self._create_business_model,
            tags=["business"],
        )

        registry.register(
            name="post_strategy_artifact",
            description="Post a business strategy artifact to the bus.",
            parameters={
                "type": "object",
                "properties": {
                    "key": {"type": "string", "description": "Artifact key"},
                    "content": {"type": "string", "description": "Strategy content"},
                },
                "required": ["key", "content"],
            },
            handler=self._post_artifact,
            tags=["business", "collaboration"],
        )

    async def _create_business_model(
        self, model_type: str, content: dict
    ) -> str:
        import json

        if self.bus:
            await self.bus.set_artifact(
                key=f"business_model_{model_type}",
                value=content,
                owner_agent=self.agent_id,
                artifact_type="business_model",
            )
        return f"Business model ({model_type}) created:\n{json.dumps(content, indent=2)}"

    async def _post_artifact(self, key: str, content: str) -> str:
        if self.bus:
            await self.bus.set_artifact(
                key=key,
                value=content,
                owner_agent=self.agent_id,
                artifact_type="strategy",
            )
            return f"Strategy artifact '{key}' posted."
        return f"Strategy artifact '{key}' created."
