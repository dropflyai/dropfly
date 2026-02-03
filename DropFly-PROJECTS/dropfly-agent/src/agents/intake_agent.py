"""Intake Agent — Requirements extraction through intelligent questioning.

This agent is the front door. It doesn't let work begin until it understands
the user's full vision. It asks the RIGHT questions, extracts structured
requirements, and produces a requirements document that other agents consume.
"""

from __future__ import annotations

from typing import Any

from ..core.base_agent import BaseAgent, AgentResponse
from ..core.tool_registry import ToolRegistry


class IntakeAgent(BaseAgent):
    """Intake Agent — PhD-level requirements extraction.

    Asks targeted questions based on project type, extracts the full vision,
    and produces a structured requirements document. Does NOT let work begin
    until it has enough information.
    """

    agent_type = "intake"
    default_model = "anthropic/claude-opus-4-5-20250514"

    def _get_system_prompt(self, context: str | None = None) -> str:
        prompt = """# INTAKE AGENT — Requirements Extraction Specialist

## Identity
You are a senior product architect and requirements specialist. Your job is to extract
the COMPLETE vision from the user before any work begins. You are thorough, precise,
and don't make assumptions.

## Your Process

1. **Understand the Domain**
   - What type of project? (web app, mobile, API, SaaS, marketplace, etc.)
   - Who are the users? What problem does this solve?
   - What's the scale? (MVP, production, enterprise)

2. **Extract Core Requirements**
   - What are the must-have features? (P0)
   - What are the nice-to-haves? (P1, P2)
   - What are explicit non-goals?

3. **Technical Decisions**
   - Any tech stack preferences or constraints?
   - Existing infrastructure to integrate with?
   - Deployment target? (Vercel, AWS, mobile stores, etc.)
   - Authentication requirements?
   - Database needs?

4. **Design Requirements**
   - Brand guidelines or visual direction?
   - Responsive? Mobile-first?
   - Accessibility requirements?
   - Reference designs or competitors?

5. **Business Context**
   - Revenue model?
   - Target timeline?
   - Success metrics?

## Rules

- Ask questions in batches of 3-5, not 20 at once
- Adapt questions based on project type
- If the user says "just build it", push back — get at minimum: target users, core features, tech stack
- When you have enough, produce a STRUCTURED requirements document
- Use the produce_requirements tool when ready

## Output Format

When ready, produce a requirements document with these sections:
- Project Overview
- Target Users
- Core Features (prioritized P0/P1/P2)
- Technical Architecture (stack, infrastructure, integrations)
- Design Direction
- Success Criteria
- Open Questions (things still unclear)
"""
        if context:
            prompt += f"\n\n## Context\n{context}"
        return prompt

    def _register_tools(self, registry: ToolRegistry) -> None:
        registry.register(
            name="produce_requirements",
            description=(
                "Produce the final structured requirements document. "
                "Call this when you have enough information from the user."
            ),
            parameters={
                "type": "object",
                "properties": {
                    "project_name": {
                        "type": "string",
                        "description": "Name of the project",
                    },
                    "project_type": {
                        "type": "string",
                        "description": "Type (web_app, mobile_app, api, saas, etc.)",
                    },
                    "requirements_document": {
                        "type": "string",
                        "description": "Full structured requirements in markdown",
                    },
                    "tech_stack": {
                        "type": "object",
                        "description": "Recommended tech stack",
                        "properties": {
                            "frontend": {"type": "string"},
                            "backend": {"type": "string"},
                            "database": {"type": "string"},
                            "deployment": {"type": "string"},
                            "other": {"type": "string"},
                        },
                    },
                    "priority_features": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "feature": {"type": "string"},
                                "priority": {"type": "string", "enum": ["P0", "P1", "P2"]},
                                "description": {"type": "string"},
                            },
                        },
                        "description": "Prioritized feature list",
                    },
                },
                "required": ["project_name", "project_type", "requirements_document"],
            },
            handler=self._produce_requirements,
            tags=["intake"],
        )

    async def _produce_requirements(
        self,
        project_name: str,
        project_type: str,
        requirements_document: str,
        tech_stack: dict[str, str] | None = None,
        priority_features: list[dict[str, str]] | None = None,
    ) -> str:
        """Produce and store the final requirements document."""
        # Store as artifact on the bus
        if self.bus:
            await self.bus.set_artifact(
                key="requirements",
                value={
                    "project_name": project_name,
                    "project_type": project_type,
                    "document": requirements_document,
                    "tech_stack": tech_stack or {},
                    "features": priority_features or [],
                },
                owner_agent=self.agent_id,
                artifact_type="requirements",
            )

        return (
            f"Requirements document produced for '{project_name}' ({project_type}).\n"
            f"Features: {len(priority_features or [])} prioritized.\n"
            f"Document posted to agent bus as 'requirements' artifact."
        )
