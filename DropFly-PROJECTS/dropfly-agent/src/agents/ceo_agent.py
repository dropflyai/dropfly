"""CEO Agent — Master orchestrator with parallel agent execution.

Enhanced from prototype_x1000. Now:
- Spawns agents in PARALLEL via AgentPool
- Uses the AgentBus for inter-agent communication
- Can spawn additional agents mid-execution
- Monitors progress and resolves conflicts
- Synthesizes results from all agents
"""

from __future__ import annotations

import json
import logging
from typing import Any, Optional

from ..core.base_agent import BaseAgent, AgentResponse
from ..core.agent_bus import AgentBus
from ..core.agent_pool import AgentPool, PoolResult
from ..core.tool_registry import ToolRegistry

logger = logging.getLogger(__name__)


class CEOAgent(BaseAgent):
    """CEO Agent — orchestrates parallel multi-agent execution.

    Flow:
    1. Receives task (from Intake Agent or directly)
    2. Decomposes into agent-specific subtasks
    3. Spawns agents in parallel via AgentPool
    4. Monitors progress on the AgentBus
    5. Resolves conflicts, spawns more agents if needed
    6. Synthesizes final output
    """

    agent_type = "ceo"
    default_model = "anthropic/claude-opus-4-5-20250514"

    def __init__(
        self,
        agent_bus: AgentBus | None = None,
        **kwargs: Any,
    ):
        self._agent_bus = agent_bus or AgentBus()
        kwargs.setdefault("bus", self._agent_bus)
        super().__init__(**kwargs)

    def _get_system_prompt(self, context: str | None = None) -> str:
        prompt = """# CEO AGENT — Master Orchestrator

## Identity
You are the CEO of an autonomous builder system. You receive high-level goals,
decompose them into specialist tasks, spawn agents in parallel, monitor progress,
and deliver complete results.

## Available Specialist Agents

| Agent | Type | Capabilities |
|-------|------|-------------|
| IntakeAgent | intake | Requirements extraction, user questioning |
| ResearchAgent | research | Web search, GitHub, browser, YouTube transcripts |
| EngineeringAgent | engineering | Code, shell, file system, git, builds, deploys |
| DesignAgent | design | UI/UX specs, design tokens, component specs |
| QAAgent | qa | Tests, code review, security audit |
| DeployAgent | deploy | Vercel, AWS, Docker, CI/CD |
| MBAAgent | mba | Business strategy, market analysis, financials |

## Orchestration Process

1. **Analyze** the task/requirements
2. **Decompose** into agent-specific subtasks
3. **Identify dependencies** (what must finish before what)
4. **Spawn agents** in parallel using spawn_agents
5. **Monitor** progress (agents report via the bus)
6. **Synthesize** results into a coherent deliverable

## Rules

- Spawn agents in PARALLEL when tasks are independent
- Respect dependencies — don't start dependent tasks early
- If an agent fails, decide whether to retry, reassign, or skip
- Always synthesize — don't just dump raw agent outputs
- Research should usually run FIRST (other agents consume findings)
- Engineering depends on Design specs for UI work
- QA runs AFTER Engineering produces code
- Deploy runs LAST after QA passes

## Tools

Use spawn_agents to define and launch the parallel execution plan.
Use synthesize_results after agents complete.
"""
        if context:
            prompt += f"\n\n## Task Context\n{context}"
        return prompt

    def _register_tools(self, registry: ToolRegistry) -> None:
        registry.register(
            name="spawn_agents",
            description=(
                "Spawn multiple specialist agents in parallel to work on subtasks. "
                "Define agent type, task, and dependencies. Agents without dependencies "
                "start immediately. Agents with dependencies wait."
            ),
            parameters={
                "type": "object",
                "properties": {
                    "agents": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "agent_type": {
                                    "type": "string",
                                    "enum": [
                                        "research",
                                        "engineering",
                                        "design",
                                        "qa",
                                        "deploy",
                                        "mba",
                                    ],
                                    "description": "Type of specialist agent",
                                },
                                "task": {
                                    "type": "string",
                                    "description": "Task for this agent",
                                },
                                "depends_on": {
                                    "type": "array",
                                    "items": {"type": "string"},
                                    "description": "Agent IDs this depends on",
                                },
                            },
                            "required": ["agent_type", "task"],
                        },
                        "description": "List of agents to spawn",
                    },
                },
                "required": ["agents"],
            },
            handler=self._spawn_agents,
            tags=["orchestration"],
        )

        registry.register(
            name="check_progress",
            description="Check the progress of spawned agents.",
            parameters={
                "type": "object",
                "properties": {},
            },
            handler=self._check_progress,
            tags=["orchestration"],
        )

        registry.register(
            name="get_artifacts",
            description="Get all artifacts produced by agents (research, code, specs, etc.).",
            parameters={
                "type": "object",
                "properties": {
                    "artifact_type": {
                        "type": "string",
                        "description": "Filter by type (research, code, spec, etc.)",
                    },
                },
            },
            handler=self._get_artifacts,
            tags=["orchestration"],
        )

    async def _spawn_agents(self, agents: list[dict[str, Any]]) -> str:
        """Spawn multiple agents in parallel."""
        from .factory import AgentFactory

        pool = AgentPool(bus=self._agent_bus, max_concurrent=10)

        # Create and add agents to pool
        agent_ids: dict[int, str] = {}  # index -> agent_id
        for i, agent_spec in enumerate(agents):
            agent = AgentFactory.create(
                agent_spec["agent_type"],
                provider_registry=self._provider_registry,
                model=self.model if agent_spec["agent_type"] in ("research",) else None,
                bus=self._agent_bus,
            )

            # Resolve dependencies from names to IDs
            depends_on = []
            if "depends_on" in agent_spec:
                for dep in agent_spec["depends_on"]:
                    # Try to find the agent by index or type
                    for j, prev_spec in enumerate(agents[:i]):
                        if (
                            str(j) == dep
                            or prev_spec["agent_type"] == dep
                        ):
                            if j in agent_ids:
                                depends_on.append(agent_ids[j])
                            break

            aid = pool.add(
                agent,
                task=agent_spec["task"],
                depends_on=depends_on,
            )
            agent_ids[i] = aid

        # Run all agents
        logger.info(f"CEO spawning {len(agents)} agents in parallel")
        result = await pool.run(timeout=600.0)

        # Format results
        output_lines = [f"## Agent Execution Results ({len(agents)} agents)\n"]
        for agent_id, response in result.results.items():
            status = "OK" if response.success else "FAILED"
            output_lines.append(f"### {response.agent_type} [{status}]")
            output_lines.append(f"Tokens: {response.input_tokens + response.output_tokens}")
            output_lines.append(f"Iterations: {response.iterations}")
            content_preview = response.content[:1000] if response.content else "(no output)"
            output_lines.append(f"Output:\n{content_preview}\n")

        output_lines.append(f"\n**Total tokens:** {result.total_input_tokens + result.total_output_tokens}")
        output_lines.append(f"**Duration:** {result.total_duration_ms}ms")
        output_lines.append(f"**All success:** {result.all_success}")

        if result.failed_agents:
            output_lines.append(f"**Failed agents:** {result.failed_agents}")

        self._last_pool_result = result
        return "\n".join(output_lines)

    async def _check_progress(self) -> str:
        """Check progress of agents on the bus."""
        if self._agent_bus:
            active = self._agent_bus.active_agents
            artifacts = await self._agent_bus.list_artifacts()
            history = self._agent_bus.get_history(limit=20)

            lines = [f"Active agents: {active}"]
            lines.append(f"Artifacts posted: {len(artifacts)}")
            for art in artifacts:
                lines.append(f"  - {art['key']} ({art['type']}) by {art['owner']}")
            lines.append(f"\nRecent messages ({len(history)}):")
            for msg in history[-10:]:
                lines.append(f"  [{msg.from_agent} -> {msg.to_agent or 'ALL'}] {msg.content[:100]}")
            return "\n".join(lines)
        return "No agent bus available."

    async def _get_artifacts(self, artifact_type: str | None = None) -> str:
        """Get artifacts from the bus."""
        if self._agent_bus:
            artifacts = await self._agent_bus.list_artifacts(artifact_type)
            if not artifacts:
                return "No artifacts found."

            lines = []
            for art in artifacts:
                value = await self._agent_bus.get_artifact(art["key"])
                lines.append(f"### {art['key']} ({art['type']})")
                lines.append(f"Owner: {art['owner']}")
                if isinstance(value, str):
                    lines.append(value[:2000])
                elif isinstance(value, dict):
                    lines.append(json.dumps(value, indent=2)[:2000])
                else:
                    lines.append(str(value)[:2000])
                lines.append("")
            return "\n".join(lines)
        return "No artifacts available."
