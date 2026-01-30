"""CEO Agent - Master orchestrator for the Prototype X1000 brain system."""

from typing import Any, Optional
from dataclasses import dataclass, field

from ..core.base_agent import BaseAgent, AgentResponse
from ..core.memory_client import SupabaseMemoryClient
from .task_decomposer import TaskDecomposer, DecomposedTask, SubTask
from .brain_selector import BrainSelector, BrainType


@dataclass
class OrchestrationResult:
    """Result of a full orchestration run."""

    task: str
    subtask_results: dict[str, AgentResponse] = field(default_factory=dict)
    final_synthesis: str = ""
    success: bool = True
    brains_used: list[str] = field(default_factory=list)
    total_tokens: int = 0


class CEOAgent(BaseAgent):
    """CEO Agent - Orchestrates specialist brain agents.

    The CEO agent:
    1. Receives high-level user tasks
    2. Decomposes them into brain-specific subtasks
    3. Routes subtasks to specialist agents
    4. Coordinates execution and handles dependencies
    5. Synthesizes final results
    6. Logs everything to Supabase

    Uses claude-opus-4 for orchestration reasoning.
    """

    AGENT_TYPE = "ceo"
    BRAIN_NAME = "engineering"  # CEO uses engineering brain as base
    DEFAULT_MODEL = "claude-opus-4-20250514"  # Best reasoning for orchestration

    def __init__(
        self,
        model: Optional[str] = None,
        api_key: Optional[str] = None,
        memory_client: Optional[SupabaseMemoryClient] = None,
        auto_log: bool = True,
    ):
        """Initialize the CEO agent.

        Args:
            model: Model for orchestration. Defaults to claude-opus-4.
            api_key: Anthropic API key.
            memory_client: Supabase client for logging.
            auto_log: Whether to auto-log runs.
        """
        super().__init__(
            model=model,
            api_key=api_key,
            memory_client=memory_client,
            auto_log=auto_log,
        )

        self.decomposer = TaskDecomposer(api_key=api_key)
        self.selector = BrainSelector()

        # Specialist agent registry (lazy loaded)
        self._specialists: dict[str, BaseAgent] = {}

        # Register orchestration tools
        self._register_ceo_tools()

    def _get_agent_instructions(self) -> str:
        """Return CEO-specific instructions."""
        return """You are the CEO Agent - the master orchestrator of the Prototype X1000 brain system.

Your role:
1. Analyze user requests and determine which specialist brains are needed
2. Decompose complex tasks into brain-specific subtasks
3. Coordinate execution across multiple specialist agents
4. Synthesize results into coherent outputs
5. Handle failures gracefully and adapt routing as needed

Available specialist brains:
- engineering: Code, APIs, databases, infrastructure, automation
- design: UI/UX, visual design, user research, branding
- mba: Business strategy, operations, financial analysis
- options_trading: Trading algorithms, market analysis
- product: Product strategy, roadmapping, requirements

Rules:
- Always route tasks to the most appropriate specialist
- Engineering tasks go to engineering brain
- Design tasks go to design brain
- Business tasks go to MBA brain
- For multi-brain tasks, coordinate dependencies properly
- Log all orchestration decisions

You have tools to:
- delegate_to_brain: Route a task to a specialist agent
- synthesize_results: Combine results from multiple agents
- get_brain_capabilities: Understand what each brain can do
"""

    def _register_ceo_tools(self) -> None:
        """Register CEO-specific tools."""
        self.register_tool(
            name="delegate_to_brain",
            description="Delegate a task to a specialist brain agent",
            input_schema={
                "type": "object",
                "properties": {
                    "brain_type": {
                        "type": "string",
                        "enum": ["engineering", "design", "mba", "options_trading", "product"],
                        "description": "The specialist brain to delegate to",
                    },
                    "task": {
                        "type": "string",
                        "description": "The task to delegate",
                    },
                    "context": {
                        "type": "string",
                        "description": "Additional context for the task",
                    },
                },
                "required": ["brain_type", "task"],
            },
            handler=self._delegate_to_brain,
        )

        self.register_tool(
            name="get_brain_capabilities",
            description="Get the capabilities of a specialist brain",
            input_schema={
                "type": "object",
                "properties": {
                    "brain_type": {
                        "type": "string",
                        "enum": ["engineering", "design", "mba", "options_trading", "product"],
                        "description": "The brain to get capabilities for",
                    },
                },
                "required": ["brain_type"],
            },
            handler=self._get_brain_capabilities,
        )

    def _get_specialist(self, brain_type: str) -> BaseAgent:
        """Get or create a specialist agent.

        Args:
            brain_type: The brain type to get.

        Returns:
            Specialist agent instance.
        """
        if brain_type not in self._specialists:
            # Import here to avoid circular imports
            from ..specialists import SpecialistFactory

            self._specialists[brain_type] = SpecialistFactory.create(
                brain_type,
                api_key=self.api_key,
                memory_client=self._memory_client,
            )

        return self._specialists[brain_type]

    def _delegate_to_brain(
        self,
        brain_type: str,
        task: str,
        context: Optional[str] = None,
    ) -> str:
        """Delegate a task to a specialist brain.

        Args:
            brain_type: The brain to delegate to.
            task: The task to execute.
            context: Additional context.

        Returns:
            Result from the specialist agent.
        """
        try:
            specialist = self._get_specialist(brain_type)
            result = specialist.run(task, context=context)

            # Log collaboration
            if self._memory_client:
                self._memory_client.client.table("ceo_brain_collaborations").insert(
                    {
                        "parent_agent": "ceo",
                        "child_agent": brain_type,
                        "task_description": task,
                        "result_summary": result.content[:500] if result.content else None,
                        "success": result.success,
                    }
                ).execute()

            return result.content if result.success else f"Error: {result.error}"

        except Exception as e:
            return f"Delegation failed: {str(e)}"

    def _get_brain_capabilities(self, brain_type: str) -> str:
        """Get capabilities of a brain.

        Args:
            brain_type: The brain to describe.

        Returns:
            Description of brain capabilities.
        """
        try:
            bt = BrainType(brain_type)
            capability = self.selector.get_brain_capability(bt)
            return (
                f"Brain: {brain_type}\n"
                f"Description: {capability.description}\n"
                f"Keywords: {', '.join(capability.keywords[:10])}\n"
                f"Can delegate to: {[b.value for b in capability.can_delegate_to]}"
            )
        except ValueError:
            return f"Unknown brain type: {brain_type}"

    def orchestrate(
        self,
        task: str,
        context: Optional[str] = None,
        skip_decomposition: bool = False,
    ) -> OrchestrationResult:
        """Orchestrate a complex task across multiple brain agents.

        This is the main entry point for multi-agent task execution.

        Args:
            task: The user's task description.
            context: Additional context about the project.
            skip_decomposition: If True, route directly to single brain.

        Returns:
            OrchestrationResult with all subtask results and synthesis.
        """
        result = OrchestrationResult(task=task)

        # Check if simple task
        if skip_decomposition or self.decomposer.is_simple_task(task):
            brain_type = self.decomposer.get_primary_brain(task)
            response = self._delegate_to_brain(brain_type, task, context)
            result.subtask_results["main"] = AgentResponse(
                content=response,
                success="Error" not in response,
            )
            result.final_synthesis = response
            result.brains_used = [brain_type]
            result.success = "Error" not in response
            return result

        # Decompose complex task
        decomposed = self.decomposer.decompose(task, context)

        # Log delegation plan
        if self._memory_client:
            self._memory_client.client.table("ceo_task_delegations").insert(
                {
                    "task_input": task,
                    "decomposed_tasks": [st.model_dump() for st in decomposed.subtasks],
                    "delegated_to": list(set(st.required_brain for st in decomposed.subtasks)),
                    "routing_reasoning": decomposed.reasoning,
                }
            ).execute()

        # Execute subtasks in order
        completed: dict[str, str] = {}
        for subtask_id in decomposed.execution_order:
            subtask = next(
                (st for st in decomposed.subtasks if st.id == subtask_id),
                None,
            )
            if not subtask:
                continue

            # Check dependencies
            deps_met = all(dep in completed for dep in subtask.dependencies)
            if not deps_met:
                result.subtask_results[subtask_id] = AgentResponse(
                    content="",
                    success=False,
                    error="Dependencies not met",
                )
                continue

            # Build context with dependency results
            subtask_context = context or ""
            if subtask.dependencies:
                dep_results = "\n\n".join(
                    f"Result from {dep}:\n{completed[dep]}"
                    for dep in subtask.dependencies
                    if dep in completed
                )
                subtask_context = f"{subtask_context}\n\n## Previous Results\n{dep_results}"

            # Execute subtask
            response = self._delegate_to_brain(
                subtask.required_brain,
                subtask.description,
                subtask_context,
            )

            result.subtask_results[subtask_id] = AgentResponse(
                content=response,
                success="Error" not in response,
            )
            completed[subtask_id] = response
            result.brains_used.append(subtask.required_brain)

        # Synthesize results
        result.brains_used = list(set(result.brains_used))
        result.final_synthesis = self._synthesize(task, completed)
        result.success = all(
            r.success for r in result.subtask_results.values()
        )

        # Update delegation log
        if self._memory_client:
            self._memory_client.client.table("ceo_task_delegations").update(
                {
                    "success": result.success,
                    "completion_summary": result.final_synthesis[:1000],
                }
            ).eq("task_input", task).execute()

        return result

    def _synthesize(self, original_task: str, subtask_results: dict[str, str]) -> str:
        """Synthesize subtask results into a coherent final response.

        Args:
            original_task: The original user task.
            subtask_results: Dict of subtask ID to result.

        Returns:
            Synthesized final response.
        """
        if not subtask_results:
            return "No subtasks were completed."

        if len(subtask_results) == 1:
            return list(subtask_results.values())[0]

        # Use Claude to synthesize multiple results
        synthesis_prompt = f"""Synthesize the following subtask results into a coherent response to the original task.

Original task: {original_task}

Subtask results:
"""
        for task_id, result in subtask_results.items():
            synthesis_prompt += f"\n--- {task_id} ---\n{result}\n"

        synthesis_prompt += "\n\nProvide a unified, coherent response that addresses the original task."

        response = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            messages=[{"role": "user", "content": synthesis_prompt}],
        )

        return response.content[0].text

    def run(
        self,
        task: str,
        context: Optional[str] = None,
        max_iterations: int = 10,
    ) -> AgentResponse:
        """Run the CEO agent on a task.

        For complex tasks, this will orchestrate across multiple brains.
        For simple tasks, it routes directly.

        Args:
            task: The task to execute.
            context: Additional context.
            max_iterations: Maximum iterations for tool use.

        Returns:
            AgentResponse with results.
        """
        # Use orchestration by default
        result = self.orchestrate(task, context)

        return AgentResponse(
            content=result.final_synthesis,
            tool_calls=[],  # Orchestration doesn't track individual calls
            success=result.success,
            tokens_used=result.total_tokens,
        )
