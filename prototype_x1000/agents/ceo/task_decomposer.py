"""Task decomposition for CEO agent."""

from typing import Any, Optional
from pydantic import BaseModel
import anthropic


class SubTask(BaseModel):
    """A decomposed sub-task."""

    id: str
    description: str
    required_brain: str  # engineering, design, mba, etc.
    dependencies: list[str] = []  # IDs of tasks that must complete first
    priority: int = 1  # 1 = highest, 3 = lowest
    estimated_complexity: str = "medium"  # low, medium, high


class DecomposedTask(BaseModel):
    """Result of task decomposition."""

    original_task: str
    subtasks: list[SubTask]
    execution_order: list[str]  # Ordered list of subtask IDs
    reasoning: str


class TaskDecomposer:
    """Decompose complex tasks into brain-specific subtasks.

    Uses Claude to analyze tasks and break them into specialist work items
    that can be routed to the appropriate brain agents.
    """

    DECOMPOSITION_PROMPT = """You are a task decomposition specialist for a multi-agent AI system.

Your job is to analyze user requests and break them into subtasks that can be handled by specialist agents.

## Available Specialist Brains

1. **engineering** - Code, APIs, databases, infrastructure, DevOps, automation, testing
2. **design** - UI/UX, visual design, user research, information architecture, branding
3. **mba** - Business strategy, operations, financial analysis, market research, leadership
4. **options_trading** - Trading algorithms, market analysis, options pricing
5. **product** - Product strategy, roadmapping, feature prioritization, PRDs

## Rules

1. Break tasks into the smallest reasonable units that a specialist can handle
2. Identify dependencies between subtasks (what must be done before what)
3. Assign each subtask to exactly ONE brain
4. Order subtasks so dependencies are respected
5. Keep subtasks focused - don't combine unrelated work

## Output Format

Respond with JSON in this exact format:
```json
{
  "subtasks": [
    {
      "id": "task_1",
      "description": "Clear description of what to do",
      "required_brain": "engineering",
      "dependencies": [],
      "priority": 1,
      "estimated_complexity": "medium"
    }
  ],
  "execution_order": ["task_1", "task_2"],
  "reasoning": "Brief explanation of the decomposition approach"
}
```

## Example

User: "Build a landing page for a SaaS product with user signup"

Response:
```json
{
  "subtasks": [
    {
      "id": "task_1",
      "description": "Research target audience and define value proposition",
      "required_brain": "mba",
      "dependencies": [],
      "priority": 1,
      "estimated_complexity": "medium"
    },
    {
      "id": "task_2",
      "description": "Design landing page layout, visual hierarchy, and component specifications",
      "required_brain": "design",
      "dependencies": ["task_1"],
      "priority": 1,
      "estimated_complexity": "high"
    },
    {
      "id": "task_3",
      "description": "Implement landing page frontend with signup form",
      "required_brain": "engineering",
      "dependencies": ["task_2"],
      "priority": 1,
      "estimated_complexity": "medium"
    },
    {
      "id": "task_4",
      "description": "Create backend API endpoint for user registration",
      "required_brain": "engineering",
      "dependencies": [],
      "priority": 2,
      "estimated_complexity": "medium"
    }
  ],
  "execution_order": ["task_1", "task_4", "task_2", "task_3"],
  "reasoning": "MBA research informs design, design informs frontend. Backend can start in parallel."
}
```

Now analyze the following task and provide decomposition:
"""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = "claude-sonnet-4-20250514",
    ):
        """Initialize the task decomposer.

        Args:
            api_key: Anthropic API key.
            model: Model to use for decomposition.
        """
        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = model

    def decompose(self, task: str, context: Optional[str] = None) -> DecomposedTask:
        """Decompose a task into subtasks.

        Args:
            task: The user's task description.
            context: Additional context about the project.

        Returns:
            DecomposedTask with subtasks and execution order.
        """
        prompt = self.DECOMPOSITION_PROMPT

        if context:
            prompt += f"\n\nAdditional context:\n{context}\n\n"

        prompt += f"Task to decompose:\n{task}"

        response = self.client.messages.create(
            model=self.model,
            max_tokens=2048,
            messages=[{"role": "user", "content": prompt}],
        )

        # Parse the JSON response
        response_text = response.content[0].text

        # Extract JSON from response (handle markdown code blocks)
        import json
        import re

        json_match = re.search(r"```json\s*(.*?)\s*```", response_text, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
        else:
            # Try to find raw JSON
            json_match = re.search(r"\{.*\}", response_text, re.DOTALL)
            if json_match:
                json_str = json_match.group(0)
            else:
                # Fallback: single task
                return DecomposedTask(
                    original_task=task,
                    subtasks=[
                        SubTask(
                            id="task_1",
                            description=task,
                            required_brain="engineering",
                            dependencies=[],
                            priority=1,
                            estimated_complexity="medium",
                        )
                    ],
                    execution_order=["task_1"],
                    reasoning="Could not decompose - treating as single task",
                )

        try:
            data = json.loads(json_str)
            subtasks = [SubTask(**st) for st in data["subtasks"]]
            return DecomposedTask(
                original_task=task,
                subtasks=subtasks,
                execution_order=data["execution_order"],
                reasoning=data["reasoning"],
            )
        except (json.JSONDecodeError, KeyError) as e:
            # Fallback for parsing errors
            return DecomposedTask(
                original_task=task,
                subtasks=[
                    SubTask(
                        id="task_1",
                        description=task,
                        required_brain="engineering",
                        dependencies=[],
                        priority=1,
                        estimated_complexity="medium",
                    )
                ],
                execution_order=["task_1"],
                reasoning=f"Parsing error ({e}) - treating as single task",
            )

    def is_simple_task(self, task: str) -> bool:
        """Check if a task is simple enough to skip decomposition.

        Args:
            task: The task description.

        Returns:
            True if task should be handled directly without decomposition.
        """
        # Simple heuristics for detecting single-brain tasks
        simple_indicators = [
            len(task.split()) < 10,  # Very short task
            "fix" in task.lower() and "bug" in task.lower(),  # Bug fix
            task.lower().startswith("update "),  # Simple update
            task.lower().startswith("add ") and len(task.split()) < 15,
        ]

        return any(simple_indicators)

    def get_primary_brain(self, task: str) -> str:
        """Quickly determine the primary brain for a simple task.

        Args:
            task: The task description.

        Returns:
            Brain name that should handle this task.
        """
        task_lower = task.lower()

        # Keyword matching for quick routing
        if any(
            kw in task_lower
            for kw in [
                "code",
                "api",
                "database",
                "deploy",
                "bug",
                "test",
                "backend",
                "frontend",
                "server",
                "endpoint",
            ]
        ):
            return "engineering"

        if any(
            kw in task_lower
            for kw in [
                "design",
                "ui",
                "ux",
                "layout",
                "color",
                "font",
                "wireframe",
                "mockup",
                "component",
            ]
        ):
            return "design"

        if any(
            kw in task_lower
            for kw in [
                "business",
                "strategy",
                "market",
                "revenue",
                "pricing",
                "competitor",
                "operations",
            ]
        ):
            return "mba"

        if any(
            kw in task_lower
            for kw in [
                "trade",
                "option",
                "stock",
                "portfolio",
                "market analysis",
            ]
        ):
            return "options_trading"

        if any(
            kw in task_lower
            for kw in [
                "product",
                "roadmap",
                "feature",
                "prd",
                "requirements",
                "priorit",
            ]
        ):
            return "product"

        # Default to engineering for technical tasks
        return "engineering"
