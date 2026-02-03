"""Async, SDK-agnostic base agent for the DropFly Agent system.

Every agent inherits from BaseAgent. The agent:
1. Gets a system prompt (from brain guidance or custom instructions)
2. Uses any LLM provider (Anthropic, OpenAI, Ollama, custom)
3. Has access to tools via the ToolRegistry
4. Communicates with other agents via the AgentBus
5. Logs everything to memory (Supabase)
"""

from __future__ import annotations

import asyncio
import logging
import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, AsyncIterator, Optional

from pydantic import BaseModel

from .providers import (
    LLMProvider,
    LLMResponse,
    Message,
    ProviderRegistry,
    Role,
    StopReason,
    StreamChunk,
    ToolCall,
    ToolDefinition,
)
from .tool_registry import ToolRegistry, ToolResult

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Response models
# ---------------------------------------------------------------------------


class AgentResponse(BaseModel):
    """Response from an agent execution."""

    agent_id: str
    agent_type: str
    content: str
    tool_calls: list[dict[str, Any]] = []
    success: bool = True
    error: Optional[str] = None
    input_tokens: int = 0
    output_tokens: int = 0
    iterations: int = 0
    duration_ms: int = 0


class AgentEvent(BaseModel):
    """Real-time event emitted during agent execution."""

    agent_id: str
    event_type: str  # "thinking", "tool_call", "tool_result", "response", "error"
    data: dict[str, Any] = {}
    timestamp: str = ""


# ---------------------------------------------------------------------------
# Base Agent
# ---------------------------------------------------------------------------


class BaseAgent(ABC):
    """Async, SDK-agnostic base agent.

    Subclasses must implement:
        - agent_type: str class variable
        - _get_system_prompt() -> str
        - _register_tools(registry) to add agent-specific tools

    Optionally override:
        - _on_start(task) — called before execution
        - _on_complete(task, response) — called after execution
        - _on_tool_call(name, args) — called before each tool execution
    """

    agent_type: str = "base"
    default_model: str = "anthropic/claude-sonnet-4-20250514"

    def __init__(
        self,
        agent_id: str | None = None,
        provider: LLMProvider | None = None,
        provider_registry: ProviderRegistry | None = None,
        model: str | None = None,
        tools: ToolRegistry | None = None,
        memory_client: Any | None = None,
        bus: Any | None = None,  # AgentBus, imported lazily to avoid circular deps
        max_iterations: int = 25,
        max_tokens: int = 8192,
    ):
        self.agent_id = agent_id or f"{self.agent_type}_{uuid.uuid4().hex[:8]}"
        self.model = model or self.default_model

        # Provider resolution
        self._provider = provider
        self._provider_registry = provider_registry

        # Tools
        self.tools = tools or ToolRegistry()
        self._register_tools(self.tools)

        # Memory & communication
        self.memory_client = memory_client
        self.bus = bus

        # Execution limits
        self.max_iterations = max_iterations
        self.max_tokens = max_tokens

        # State
        self._messages: list[Message] = []
        self._event_listeners: list[Any] = []

    # ------------------------------------------------------------------
    # Provider resolution
    # ------------------------------------------------------------------

    def _get_provider(self) -> tuple[LLMProvider, str]:
        """Resolve the LLM provider and model name.

        Supports:
            - Explicit provider passed to __init__
            - Model string like "anthropic/claude-opus-4-5"
            - Provider registry auto-resolution
        """
        if self._provider:
            # Explicit provider — extract model name only
            model = self.model.split("/", 1)[-1] if "/" in self.model else self.model
            return self._provider, model

        if self._provider_registry:
            return self._provider_registry.resolve(self.model)

        # Fallback: create Anthropic provider
        from .providers import AnthropicProvider

        provider = AnthropicProvider()
        model = self.model.split("/", 1)[-1] if "/" in self.model else self.model
        return provider, model

    # ------------------------------------------------------------------
    # Abstract interface
    # ------------------------------------------------------------------

    @abstractmethod
    def _get_system_prompt(self, context: str | None = None) -> str:
        """Return the system prompt for this agent.

        Override in subclasses. Can use brain guidance, custom instructions, etc.
        """
        ...

    def _register_tools(self, registry: ToolRegistry) -> None:
        """Register agent-specific tools. Override in subclasses."""
        pass

    # ------------------------------------------------------------------
    # Lifecycle hooks
    # ------------------------------------------------------------------

    async def _on_start(self, task: str) -> None:
        """Called before agent execution begins."""
        pass

    async def _on_complete(self, task: str, response: AgentResponse) -> None:
        """Called after agent execution completes."""
        pass

    async def _on_tool_call(self, name: str, arguments: dict[str, Any]) -> None:
        """Called before each tool execution."""
        pass

    # ------------------------------------------------------------------
    # Event system
    # ------------------------------------------------------------------

    def on_event(self, callback: Any) -> None:
        """Subscribe to agent events (thinking, tool calls, responses)."""
        self._event_listeners.append(callback)

    async def _emit(self, event_type: str, data: dict[str, Any] | None = None) -> None:
        """Emit an event to all listeners."""
        event = AgentEvent(
            agent_id=self.agent_id,
            event_type=event_type,
            data=data or {},
            timestamp=datetime.now(timezone.utc).isoformat(),
        )
        for listener in self._event_listeners:
            try:
                if asyncio.iscoroutinefunction(listener):
                    await listener(event)
                else:
                    listener(event)
            except Exception as e:
                logger.warning(f"Event listener error: {e}")

    # ------------------------------------------------------------------
    # Core execution loop
    # ------------------------------------------------------------------

    async def run(
        self,
        task: str,
        context: str | None = None,
        messages: list[Message] | None = None,
    ) -> AgentResponse:
        """Execute a task.

        Args:
            task: The task description.
            context: Additional context for the system prompt.
            messages: Optional pre-existing message history.

        Returns:
            AgentResponse with results.
        """
        start_time = datetime.now(timezone.utc)
        provider, model_name = self._get_provider()
        system_prompt = self._get_system_prompt(context)
        tool_defs = self.tools.get_definitions() if self.tools.available else None
        tool_calls_log: list[dict[str, Any]] = []
        total_input_tokens = 0
        total_output_tokens = 0

        # Initialize messages
        self._messages = messages or [Message(role=Role.USER, content=task)]

        await self._on_start(task)
        await self._emit("start", {"task": task})

        try:
            for iteration in range(self.max_iterations):
                await self._emit("thinking", {"iteration": iteration})

                # Call the LLM
                response = await provider.acomplete(
                    messages=self._messages,
                    tools=tool_defs,
                    system=system_prompt,
                    model=model_name,
                    max_tokens=self.max_tokens,
                )

                total_input_tokens += response.input_tokens
                total_output_tokens += response.output_tokens

                # Done — no more tool calls
                if response.stop_reason == StopReason.END_TURN:
                    duration = (datetime.now(timezone.utc) - start_time).total_seconds()
                    agent_response = AgentResponse(
                        agent_id=self.agent_id,
                        agent_type=self.agent_type,
                        content=response.content,
                        tool_calls=tool_calls_log,
                        success=True,
                        input_tokens=total_input_tokens,
                        output_tokens=total_output_tokens,
                        iterations=iteration + 1,
                        duration_ms=int(duration * 1000),
                    )
                    await self._on_complete(task, agent_response)
                    await self._emit("complete", {"response": response.content[:500]})
                    return agent_response

                # Handle tool calls
                if response.stop_reason == StopReason.TOOL_USE and response.tool_calls:
                    # Add assistant message with tool calls
                    self._messages.append(
                        Message(
                            role=Role.ASSISTANT,
                            content=response.content,
                            tool_calls=response.tool_calls,
                        )
                    )

                    # Execute each tool
                    for tc in response.tool_calls:
                        await self._on_tool_call(tc.name, tc.arguments)
                        await self._emit(
                            "tool_call",
                            {"name": tc.name, "arguments": tc.arguments},
                        )

                        tool_calls_log.append(
                            {
                                "name": tc.name,
                                "arguments": tc.arguments,
                                "iteration": iteration,
                            }
                        )

                        result = await self.tools.execute(tc.name, tc.arguments)

                        await self._emit(
                            "tool_result",
                            {
                                "name": tc.name,
                                "success": result.success,
                                "output": result.output[:500],
                            },
                        )

                        # Add tool result message
                        self._messages.append(
                            Message(
                                role=Role.TOOL,
                                content=result.output if result.success else f"Error: {result.error}",
                                tool_call_id=tc.id,
                            )
                        )

                # Max tokens — partial response
                if response.stop_reason == StopReason.MAX_TOKENS:
                    logger.warning(f"Agent {self.agent_id} hit max_tokens on iteration {iteration}")
                    # Continue to let the model finish

            # Max iterations exhausted
            duration = (datetime.now(timezone.utc) - start_time).total_seconds()
            return AgentResponse(
                agent_id=self.agent_id,
                agent_type=self.agent_type,
                content="Maximum iterations reached without completion.",
                tool_calls=tool_calls_log,
                success=False,
                error="max_iterations_reached",
                input_tokens=total_input_tokens,
                output_tokens=total_output_tokens,
                iterations=self.max_iterations,
                duration_ms=int(duration * 1000),
            )

        except Exception as e:
            duration = (datetime.now(timezone.utc) - start_time).total_seconds()
            logger.error(f"Agent {self.agent_id} failed: {e}", exc_info=True)
            await self._emit("error", {"error": str(e)})
            return AgentResponse(
                agent_id=self.agent_id,
                agent_type=self.agent_type,
                content="",
                tool_calls=tool_calls_log,
                success=False,
                error=str(e),
                input_tokens=total_input_tokens,
                output_tokens=total_output_tokens,
                duration_ms=int(duration * 1000),
            )

    async def run_streaming(
        self,
        task: str,
        context: str | None = None,
    ) -> AsyncIterator[AgentEvent]:
        """Execute a task with streaming events.

        Yields AgentEvent objects as the agent works.
        """
        events: asyncio.Queue[AgentEvent] = asyncio.Queue()

        async def capture_event(event: AgentEvent) -> None:
            await events.put(event)

        self.on_event(capture_event)

        # Run agent in background
        run_task = asyncio.create_task(self.run(task, context))

        while not run_task.done():
            try:
                event = await asyncio.wait_for(events.get(), timeout=0.1)
                yield event
            except asyncio.TimeoutError:
                continue

        # Drain remaining events
        while not events.empty():
            yield await events.get()

        # Remove listener
        self._event_listeners.remove(capture_event)

    # ------------------------------------------------------------------
    # Convenience methods
    # ------------------------------------------------------------------

    async def ask(self, question: str) -> str:
        """Simple question → answer. No tools, no iteration.

        Use this for quick LLM calls within agent logic.
        """
        provider, model_name = self._get_provider()
        response = await provider.acomplete(
            messages=[Message(role=Role.USER, content=question)],
            model=model_name,
            max_tokens=self.max_tokens,
        )
        return response.content

    def add_tools_from(self, registry: ToolRegistry) -> None:
        """Add tools from another registry."""
        self.tools.merge(registry)
