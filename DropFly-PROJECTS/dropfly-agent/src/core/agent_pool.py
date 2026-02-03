"""Parallel agent spawning and lifecycle management.

The AgentPool spawns multiple agents concurrently, monitors their progress,
handles failures, and collects results. Think of it as asyncio.TaskGroup
specifically designed for AI agents.
"""

from __future__ import annotations

import asyncio
import logging
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional

from .base_agent import AgentResponse, BaseAgent
from .agent_bus import AgentBus

logger = logging.getLogger(__name__)


class AgentStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class SpawnedAgent:
    """Tracks a spawned agent and its task."""

    agent: BaseAgent
    task: str
    context: str | None = None
    status: AgentStatus = AgentStatus.PENDING
    response: AgentResponse | None = None
    dependencies: list[str] = field(default_factory=list)  # Agent IDs that must finish first
    started_at: str | None = None
    completed_at: str | None = None
    _asyncio_task: asyncio.Task | None = field(default=None, repr=False)


@dataclass
class PoolResult:
    """Result from running a pool of agents."""

    results: dict[str, AgentResponse]  # agent_id -> response
    all_success: bool
    failed_agents: list[str]
    total_duration_ms: int
    total_input_tokens: int = 0
    total_output_tokens: int = 0


class AgentPool:
    """Manages parallel agent execution with dependency tracking.

    Usage:
        pool = AgentPool(bus=bus)

        # Add agents
        pool.add(engineering_agent, "Build the API endpoints")
        pool.add(design_agent, "Create the UI components")
        pool.add(qa_agent, "Write tests for the API",
                 depends_on=["engineering_abc123"])  # Waits for engineering

        # Run all (respecting dependencies)
        result = await pool.run()

        # Check results
        for agent_id, response in result.results.items():
            print(f"{agent_id}: {'OK' if response.success else 'FAIL'}")
    """

    def __init__(
        self,
        bus: AgentBus | None = None,
        max_concurrent: int = 10,
        on_agent_complete: Any = None,
    ):
        self.bus = bus
        self.max_concurrent = max_concurrent
        self.on_agent_complete = on_agent_complete
        self._agents: dict[str, SpawnedAgent] = {}
        self._semaphore = asyncio.Semaphore(max_concurrent)

    def add(
        self,
        agent: BaseAgent,
        task: str,
        context: str | None = None,
        depends_on: list[str] | None = None,
    ) -> str:
        """Add an agent to the pool.

        Args:
            agent: The agent instance to run.
            task: The task to execute.
            context: Additional context.
            depends_on: List of agent IDs that must complete first.

        Returns:
            Agent ID for tracking.
        """
        spawned = SpawnedAgent(
            agent=agent,
            task=task,
            context=context,
            dependencies=depends_on or [],
        )
        self._agents[agent.agent_id] = spawned
        logger.info(f"Pool: Added {agent.agent_type} ({agent.agent_id})")
        return agent.agent_id

    async def run(self, timeout: float = 600.0) -> PoolResult:
        """Run all agents respecting dependencies.

        Agents without dependencies start immediately in parallel.
        Agents with dependencies wait until their deps complete.

        Args:
            timeout: Max total execution time in seconds.

        Returns:
            PoolResult with all agent results.
        """
        start_time = datetime.now(timezone.utc)
        results: dict[str, AgentResponse] = {}
        failed: list[str] = []

        # Connect agents to bus
        if self.bus:
            for agent_id, spawned in self._agents.items():
                spawned.agent.bus = self.bus

        try:
            await asyncio.wait_for(
                self._execute_all(results, failed),
                timeout=timeout,
            )
        except asyncio.TimeoutError:
            logger.error(f"Pool timed out after {timeout}s")
            # Cancel any still-running agents
            for agent_id, spawned in self._agents.items():
                if spawned.status == AgentStatus.RUNNING and spawned._asyncio_task:
                    spawned._asyncio_task.cancel()
                    spawned.status = AgentStatus.CANCELLED
                    failed.append(agent_id)

        duration = (datetime.now(timezone.utc) - start_time).total_seconds()

        return PoolResult(
            results=results,
            all_success=len(failed) == 0,
            failed_agents=failed,
            total_duration_ms=int(duration * 1000),
            total_input_tokens=sum(r.input_tokens for r in results.values()),
            total_output_tokens=sum(r.output_tokens for r in results.values()),
        )

    async def _execute_all(
        self,
        results: dict[str, AgentResponse],
        failed: list[str],
    ) -> None:
        """Execute all agents, respecting dependency order."""
        completed_event: dict[str, asyncio.Event] = {}
        for agent_id in self._agents:
            completed_event[agent_id] = asyncio.Event()

        async def run_agent(agent_id: str) -> None:
            spawned = self._agents[agent_id]

            # Wait for dependencies
            for dep_id in spawned.dependencies:
                if dep_id in completed_event:
                    await completed_event[dep_id].wait()

                    # Check if dependency failed
                    dep = self._agents.get(dep_id)
                    if dep and dep.status == AgentStatus.FAILED:
                        logger.warning(
                            f"Agent {agent_id} skipped: dependency {dep_id} failed"
                        )
                        spawned.status = AgentStatus.FAILED
                        failed.append(agent_id)
                        completed_event[agent_id].set()
                        return

            # Acquire semaphore slot
            async with self._semaphore:
                spawned.status = AgentStatus.RUNNING
                spawned.started_at = datetime.now(timezone.utc).isoformat()

                if self.bus:
                    await self.bus.broadcast(
                        agent_id,
                        f"Agent {spawned.agent.agent_type} started: {spawned.task[:100]}",
                        metadata={"event": "agent_started"},
                    )

                try:
                    # Build context with dependency results
                    ctx = spawned.context or ""
                    if spawned.dependencies:
                        dep_context_parts = []
                        for dep_id in spawned.dependencies:
                            if dep_id in results:
                                dep_agent = self._agents[dep_id]
                                dep_context_parts.append(
                                    f"## Result from {dep_agent.agent.agent_type}:\n"
                                    f"{results[dep_id].content[:2000]}"
                                )
                        if dep_context_parts:
                            ctx = f"{ctx}\n\n## Previous Agent Results\n\n" + "\n\n".join(
                                dep_context_parts
                            )

                    response = await spawned.agent.run(spawned.task, context=ctx if ctx else None)
                    results[agent_id] = response

                    if response.success:
                        spawned.status = AgentStatus.COMPLETED
                    else:
                        spawned.status = AgentStatus.FAILED
                        failed.append(agent_id)

                    if self.on_agent_complete:
                        if asyncio.iscoroutinefunction(self.on_agent_complete):
                            await self.on_agent_complete(agent_id, response)
                        else:
                            self.on_agent_complete(agent_id, response)

                except Exception as e:
                    logger.error(f"Agent {agent_id} crashed: {e}", exc_info=True)
                    spawned.status = AgentStatus.FAILED
                    failed.append(agent_id)
                    results[agent_id] = AgentResponse(
                        agent_id=agent_id,
                        agent_type=spawned.agent.agent_type,
                        content="",
                        success=False,
                        error=str(e),
                    )
                finally:
                    spawned.completed_at = datetime.now(timezone.utc).isoformat()
                    completed_event[agent_id].set()

        # Launch all agents as concurrent tasks
        tasks = []
        for agent_id in self._agents:
            task = asyncio.create_task(run_agent(agent_id))
            self._agents[agent_id]._asyncio_task = task
            tasks.append(task)

        await asyncio.gather(*tasks, return_exceptions=True)

    # ------------------------------------------------------------------
    # Inspection
    # ------------------------------------------------------------------

    def get_status(self) -> dict[str, dict[str, Any]]:
        """Get current status of all agents in the pool."""
        return {
            agent_id: {
                "type": s.agent.agent_type,
                "status": s.status.value,
                "task": s.task[:100],
                "dependencies": s.dependencies,
                "started_at": s.started_at,
                "completed_at": s.completed_at,
            }
            for agent_id, s in self._agents.items()
        }

    @property
    def running_count(self) -> int:
        return sum(1 for s in self._agents.values() if s.status == AgentStatus.RUNNING)

    @property
    def completed_count(self) -> int:
        return sum(1 for s in self._agents.values() if s.status == AgentStatus.COMPLETED)

    @property
    def total_count(self) -> int:
        return len(self._agents)

    def clear(self) -> None:
        """Clear the pool for reuse."""
        self._agents.clear()
