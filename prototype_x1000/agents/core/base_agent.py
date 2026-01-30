"""Base agent class for all Prototype X1000 agents."""

import os
from abc import ABC, abstractmethod
from typing import Any, Callable, Optional
from datetime import datetime

import anthropic
from pydantic import BaseModel

from .brain_loader import BrainLoader
from .memory_client import SupabaseMemoryClient, AgentRun, Experience


class ToolDefinition(BaseModel):
    """Definition of a tool available to an agent."""

    name: str
    description: str
    input_schema: dict[str, Any]


class AgentResponse(BaseModel):
    """Response from an agent execution."""

    content: str
    tool_calls: list[dict[str, Any]] = []
    success: bool = True
    error: Optional[str] = None
    tokens_used: int = 0


class BaseAgent(ABC):
    """Base class for all Prototype X1000 agents.

    Provides:
    - Brain guidance loading
    - Anthropic API integration
    - Tool execution framework
    - Automatic memory logging
    """

    # Subclasses should override these
    AGENT_TYPE: str = "base"
    BRAIN_NAME: str = "engineering"  # Default brain
    DEFAULT_MODEL: str = "claude-sonnet-4-20250514"

    def __init__(
        self,
        model: Optional[str] = None,
        api_key: Optional[str] = None,
        memory_client: Optional[SupabaseMemoryClient] = None,
        auto_log: bool = True,
    ):
        """Initialize the agent.

        Args:
            model: Anthropic model to use. Defaults to DEFAULT_MODEL.
            api_key: Anthropic API key. Defaults to ANTHROPIC_API_KEY env var.
            memory_client: Supabase client for logging. Created if not provided.
            auto_log: Whether to automatically log runs to Supabase.
        """
        self.model = model or self.DEFAULT_MODEL
        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY")

        if not self.api_key:
            raise ValueError(
                "Anthropic API key required. Set ANTHROPIC_API_KEY environment variable."
            )

        self.client = anthropic.Anthropic(api_key=self.api_key)
        self.brain_loader = BrainLoader()
        self.auto_log = auto_log

        # Memory client is optional - agent works without it
        self._memory_client = memory_client
        if auto_log and memory_client is None:
            try:
                self._memory_client = SupabaseMemoryClient()
            except ValueError:
                # Supabase not configured, disable auto-logging
                self.auto_log = False

        # Tool registry
        self._tools: dict[str, Callable] = {}
        self._tool_definitions: list[dict[str, Any]] = []

        # Register default tools
        self._register_default_tools()

        # Load brain guidance
        self._system_prompt: Optional[str] = None

    @property
    def memory_client(self) -> Optional[SupabaseMemoryClient]:
        """Get the memory client if available."""
        return self._memory_client

    def _register_default_tools(self) -> None:
        """Register tools available to all agents. Override to add more."""
        pass

    def register_tool(
        self,
        name: str,
        description: str,
        input_schema: dict[str, Any],
        handler: Callable,
    ) -> None:
        """Register a tool for the agent to use.

        Args:
            name: Tool name (used in API calls).
            description: Human-readable description.
            input_schema: JSON schema for tool inputs.
            handler: Function to execute when tool is called.
        """
        self._tools[name] = handler
        self._tool_definitions.append(
            {
                "name": name,
                "description": description,
                "input_schema": input_schema,
            }
        )

    def get_system_prompt(self, additional_context: Optional[str] = None) -> str:
        """Build the system prompt using brain guidance.

        Args:
            additional_context: Extra context to include.

        Returns:
            Complete system prompt string.
        """
        if self._system_prompt and not additional_context:
            return self._system_prompt

        prompt = self.brain_loader.build_system_prompt(
            self.BRAIN_NAME,
            additional_context=additional_context,
        )

        # Add agent-specific instructions
        agent_instructions = self._get_agent_instructions()
        if agent_instructions:
            prompt = f"{prompt}\n\n## Agent-Specific Instructions\n\n{agent_instructions}"

        if not additional_context:
            self._system_prompt = prompt

        return prompt

    @abstractmethod
    def _get_agent_instructions(self) -> str:
        """Return agent-specific instructions to append to system prompt.

        Override in subclasses to add specialized behavior.
        """
        pass

    def _execute_tool(self, name: str, input_data: dict[str, Any]) -> Any:
        """Execute a registered tool.

        Args:
            name: Tool name.
            input_data: Tool input parameters.

        Returns:
            Tool execution result.

        Raises:
            ValueError: If tool is not registered.
        """
        if name not in self._tools:
            raise ValueError(f"Unknown tool: {name}")

        handler = self._tools[name]
        return handler(**input_data)

    def run(
        self,
        task: str,
        context: Optional[str] = None,
        max_iterations: int = 10,
    ) -> AgentResponse:
        """Execute a task with the agent.

        Args:
            task: The task to execute.
            context: Additional context for the task.
            max_iterations: Maximum tool use iterations.

        Returns:
            AgentResponse with results.
        """
        tool_calls_log: list[dict[str, Any]] = []
        total_tokens = 0

        # Build messages
        system_prompt = self.get_system_prompt(additional_context=context)
        messages = [{"role": "user", "content": task}]

        # Get relevant past experiences
        if self._memory_client:
            past_experiences = self._memory_client.get_recent_experiences(
                brain_type=self.BRAIN_NAME,
                limit=3,
            )
            if past_experiences:
                experience_context = self._format_experiences(past_experiences)
                system_prompt = f"{system_prompt}\n\n## Relevant Past Experiences\n\n{experience_context}"

        try:
            for iteration in range(max_iterations):
                # Make API call
                response = self.client.messages.create(
                    model=self.model,
                    max_tokens=4096,
                    system=system_prompt,
                    messages=messages,
                    tools=self._tool_definitions if self._tool_definitions else None,
                )

                total_tokens += response.usage.input_tokens + response.usage.output_tokens

                # Check if we're done
                if response.stop_reason == "end_turn":
                    # Extract final text response
                    final_content = ""
                    for block in response.content:
                        if hasattr(block, "text"):
                            final_content = block.text
                            break

                    result = AgentResponse(
                        content=final_content,
                        tool_calls=tool_calls_log,
                        success=True,
                        tokens_used=total_tokens,
                    )

                    # Auto-log to Supabase
                    if self.auto_log and self._memory_client:
                        self._log_run(task, result)

                    return result

                # Handle tool use
                if response.stop_reason == "tool_use":
                    assistant_content = response.content
                    messages.append({"role": "assistant", "content": assistant_content})

                    tool_results = []
                    for block in response.content:
                        if block.type == "tool_use":
                            tool_name = block.name
                            tool_input = block.input
                            tool_id = block.id

                            tool_calls_log.append(
                                {
                                    "name": tool_name,
                                    "input": tool_input,
                                    "iteration": iteration,
                                }
                            )

                            try:
                                result = self._execute_tool(tool_name, tool_input)
                                tool_results.append(
                                    {
                                        "type": "tool_result",
                                        "tool_use_id": tool_id,
                                        "content": str(result),
                                    }
                                )
                            except Exception as e:
                                tool_results.append(
                                    {
                                        "type": "tool_result",
                                        "tool_use_id": tool_id,
                                        "content": f"Error: {str(e)}",
                                        "is_error": True,
                                    }
                                )

                    messages.append({"role": "user", "content": tool_results})

            # Max iterations reached
            return AgentResponse(
                content="Maximum iterations reached without completion.",
                tool_calls=tool_calls_log,
                success=False,
                error="max_iterations_reached",
                tokens_used=total_tokens,
            )

        except Exception as e:
            result = AgentResponse(
                content="",
                tool_calls=tool_calls_log,
                success=False,
                error=str(e),
                tokens_used=total_tokens,
            )

            if self.auto_log and self._memory_client:
                self._log_run(task, result)

            return result

    def _format_experiences(self, experiences: list[dict[str, Any]]) -> str:
        """Format past experiences for context.

        Args:
            experiences: List of experience records.

        Returns:
            Formatted string.
        """
        if not experiences:
            return "No relevant past experiences found."

        lines = []
        for exp in experiences:
            lines.append(f"**{exp.get('task_summary', 'Unknown task')}**")
            if exp.get("solution"):
                lines.append(f"Solution: {exp['solution']}")
            if exp.get("lessons_learned"):
                lines.append(f"Lesson: {exp['lessons_learned']}")
            lines.append("")

        return "\n".join(lines)

    def _log_run(self, task: str, response: AgentResponse) -> None:
        """Log the agent run to Supabase.

        Args:
            task: Original task input.
            response: Agent response.
        """
        if not self._memory_client:
            return

        try:
            run = AgentRun(
                agent_type=self.AGENT_TYPE,
                task_input=task,
                task_output=response.content[:5000] if response.content else None,
                success=response.success,
                tool_calls=response.tool_calls,
                tokens_used=response.tokens_used,
                model=self.model,
            )
            self._memory_client.log_agent_run(run)
        except Exception:
            # Don't fail the main task if logging fails
            pass

    def log_experience(
        self,
        task_summary: str,
        category: str = "success",
        problem: Optional[str] = None,
        solution: Optional[str] = None,
        outcome: Optional[str] = None,
        lessons_learned: Optional[str] = None,
        tags: Optional[list[str]] = None,
        project_id: Optional[str] = None,
    ) -> Optional[str]:
        """Manually log an experience to shared_experiences.

        Args:
            task_summary: Brief summary of the task.
            category: Category (success, failure, pattern, learning).
            problem: Problem that was addressed.
            solution: Solution that was applied.
            outcome: Result of the solution.
            lessons_learned: Key takeaway.
            tags: Tags for categorization.
            project_id: Associated project ID.

        Returns:
            Experience ID if logged, None if logging unavailable.
        """
        if not self._memory_client:
            return None

        experience = Experience(
            brain_type=self.BRAIN_NAME,
            project_id=project_id,
            category=category,
            task_summary=task_summary,
            problem=problem,
            solution=solution,
            outcome=outcome,
            lessons_learned=lessons_learned,
            tags=tags or [],
        )

        return self._memory_client.log_experience(experience)
