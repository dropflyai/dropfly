"""Design Agent — UI/UX specialist that creates component specs and design systems.

Generates design tokens, screen layouts, component specifications,
and can create actual React/React Native components.
"""

from __future__ import annotations

from typing import Any

from ..core.base_agent import BaseAgent
from ..core.brain_loader import BrainLoader
from ..core.tool_registry import ToolRegistry
from ..tools.file_system import register_file_tools
from ..tools.web_search import register_web_tools


class DesignAgent(BaseAgent):
    """Design Agent — creates UI/UX specs, design systems, and components."""

    agent_type = "design"
    default_model = "anthropic/claude-sonnet-4-20250514"

    def __init__(self, **kwargs: Any):
        self._brain_loader = BrainLoader()
        super().__init__(**kwargs)

    def _get_system_prompt(self, context: str | None = None) -> str:
        try:
            return self._brain_loader.build_system_prompt("design", context) + """

## Agent-Specific Instructions

You are the Design Agent in the DropFly autonomous builder system.

Your outputs:
- Component specifications (props, states, variants)
- Design tokens (colors, spacing, typography)
- Screen layouts with responsive breakpoints
- Accessibility requirements (WCAG 2.1 AA)

Always define all UI states: default, loading, empty, error, success.
Post design artifacts to the bus for the Engineering Agent.
"""
        except FileNotFoundError:
            return """# DESIGN AGENT

You are a senior UI/UX designer. You create component specs, design systems,
and screen layouts.

## Standards
- Mobile-first responsive design
- WCAG 2.1 AA accessibility
- All states: default, loading, empty, error, success
- Design tokens for consistency
""" + (f"\n## Context\n{context}" if context else "")

    def _register_tools(self, registry: ToolRegistry) -> None:
        register_file_tools(registry)
        register_web_tools(registry)

        registry.register(
            name="create_component_spec",
            description="Create a UI component specification.",
            parameters={
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Component name"},
                    "description": {"type": "string", "description": "What it does"},
                    "props": {"type": "object", "description": "Component props"},
                    "states": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "UI states (default, loading, error, etc.)",
                    },
                    "variants": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Visual variants",
                    },
                    "responsive": {
                        "type": "object",
                        "description": "Responsive behavior at breakpoints",
                    },
                },
                "required": ["name", "description"],
            },
            handler=self._create_component_spec,
            tags=["design"],
        )

        registry.register(
            name="create_design_tokens",
            description="Create design tokens (colors, spacing, typography, etc.).",
            parameters={
                "type": "object",
                "properties": {
                    "tokens": {"type": "object", "description": "Design token definitions"},
                    "format": {
                        "type": "string",
                        "enum": ["css", "tailwind", "json"],
                        "description": "Output format",
                    },
                },
                "required": ["tokens"],
            },
            handler=self._create_design_tokens,
            tags=["design"],
        )

        registry.register(
            name="post_design_artifact",
            description="Share a design artifact with other agents.",
            parameters={
                "type": "object",
                "properties": {
                    "key": {"type": "string", "description": "Artifact key"},
                    "content": {"type": "string", "description": "Design content"},
                },
                "required": ["key", "content"],
            },
            handler=self._post_artifact,
            tags=["design", "collaboration"],
        )

    async def _create_component_spec(
        self,
        name: str,
        description: str,
        props: dict | None = None,
        states: list[str] | None = None,
        variants: list[str] | None = None,
        responsive: dict | None = None,
    ) -> str:
        spec = {
            "component": name,
            "description": description,
            "props": props or {},
            "states": states or ["default", "loading", "error", "empty", "success"],
            "variants": variants or [],
            "responsive": responsive or {},
        }

        if self.bus:
            await self.bus.set_artifact(
                key=f"component_{name.lower()}",
                value=spec,
                owner_agent=self.agent_id,
                artifact_type="spec",
            )

        import json

        return f"Component spec created: {name}\n{json.dumps(spec, indent=2)}"

    async def _create_design_tokens(
        self,
        tokens: dict,
        format: str = "json",
    ) -> str:
        import json

        if self.bus:
            await self.bus.set_artifact(
                key="design_tokens",
                value=tokens,
                owner_agent=self.agent_id,
                artifact_type="design_tokens",
            )

        return f"Design tokens created ({format}):\n{json.dumps(tokens, indent=2)}"

    async def _post_artifact(self, key: str, content: str) -> str:
        if self.bus:
            await self.bus.set_artifact(
                key=key,
                value=content,
                owner_agent=self.agent_id,
                artifact_type="design",
            )
            return f"Design artifact '{key}' posted to bus."
        return f"Design artifact '{key}' created."
