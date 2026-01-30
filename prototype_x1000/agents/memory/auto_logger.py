"""Automatic logging for agent tasks."""

from typing import Any, Callable, Optional
from datetime import datetime
from functools import wraps
import traceback

from ..core.memory_client import SupabaseMemoryClient, Experience, AgentRun


class AutoLogger:
    """Automatic logging wrapper for agent operations.

    Wraps agent methods to automatically log:
    - Task inputs and outputs
    - Success/failure status
    - Execution metadata
    - Extracted learnings
    """

    def __init__(
        self,
        memory_client: SupabaseMemoryClient,
        brain_type: str,
        project_id: Optional[str] = None,
    ):
        """Initialize the auto-logger.

        Args:
            memory_client: Supabase client for logging.
            brain_type: Type of brain being logged.
            project_id: Optional project identifier.
        """
        self.memory_client = memory_client
        self.brain_type = brain_type
        self.project_id = project_id

    def log_task(
        self,
        task_summary: str,
        problem: Optional[str] = None,
        solution: Optional[str] = None,
        outcome: Optional[str] = None,
        lessons_learned: Optional[str] = None,
        category: str = "success",
        tags: Optional[list[str]] = None,
    ) -> str:
        """Log a task completion to shared_experiences.

        Args:
            task_summary: Brief summary of the task.
            problem: Problem that was addressed.
            solution: Solution that was applied.
            outcome: Result of the solution.
            lessons_learned: Key takeaway.
            category: Category (success, failure, pattern, learning).
            tags: Tags for categorization.

        Returns:
            Experience ID.
        """
        experience = Experience(
            brain_type=self.brain_type,
            project_id=self.project_id,
            category=category,
            task_summary=task_summary,
            problem=problem,
            solution=solution,
            outcome=outcome,
            lessons_learned=lessons_learned,
            tags=tags or [],
        )

        return self.memory_client.log_experience(experience)

    def log_success(
        self,
        task_summary: str,
        solution: str,
        tags: Optional[list[str]] = None,
    ) -> str:
        """Log a successful task.

        Args:
            task_summary: What was done.
            solution: How it was done.
            tags: Tags for categorization.

        Returns:
            Experience ID.
        """
        return self.log_task(
            task_summary=task_summary,
            solution=solution,
            category="success",
            tags=tags,
        )

    def log_failure(
        self,
        task_summary: str,
        problem: str,
        lessons_learned: str,
        tags: Optional[list[str]] = None,
    ) -> str:
        """Log a failed task.

        Args:
            task_summary: What was attempted.
            problem: What went wrong.
            lessons_learned: What was learned.
            tags: Tags for categorization.

        Returns:
            Experience ID.
        """
        return self.log_task(
            task_summary=task_summary,
            problem=problem,
            category="failure",
            lessons_learned=lessons_learned,
            tags=tags,
        )

    def wrap_function(
        self,
        func: Callable,
        extract_summary: Optional[Callable[[Any], str]] = None,
        extract_tags: Optional[Callable[[Any], list[str]]] = None,
    ) -> Callable:
        """Wrap a function with automatic logging.

        Args:
            func: Function to wrap.
            extract_summary: Function to extract summary from args.
            extract_tags: Function to extract tags from args.

        Returns:
            Wrapped function.
        """

        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            start_time = datetime.utcnow()

            # Extract summary
            if extract_summary:
                try:
                    summary = extract_summary(*args, **kwargs)
                except Exception:
                    summary = f"Called {func.__name__}"
            else:
                summary = f"Called {func.__name__}"

            # Extract tags
            if extract_tags:
                try:
                    tags = extract_tags(*args, **kwargs)
                except Exception:
                    tags = [func.__name__]
            else:
                tags = [func.__name__]

            try:
                result = func(*args, **kwargs)

                # Log success
                self.log_task(
                    task_summary=summary,
                    solution=f"Result: {str(result)[:200]}",
                    category="success",
                    tags=tags,
                )

                return result

            except Exception as e:
                # Log failure
                self.log_task(
                    task_summary=summary,
                    problem=str(e),
                    lessons_learned=traceback.format_exc()[:500],
                    category="failure",
                    tags=tags + ["error"],
                )
                raise

        return wrapper


def auto_log(
    memory_client: SupabaseMemoryClient,
    brain_type: str,
    summary: Optional[str] = None,
    tags: Optional[list[str]] = None,
) -> Callable:
    """Decorator for automatic task logging.

    Args:
        memory_client: Supabase client.
        brain_type: Brain type.
        summary: Optional static summary.
        tags: Optional static tags.

    Returns:
        Decorator function.
    """

    def decorator(func: Callable) -> Callable:
        logger = AutoLogger(memory_client, brain_type)

        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            task_summary = summary or f"Executed {func.__name__}"
            task_tags = tags or [func.__name__]

            try:
                result = func(*args, **kwargs)
                logger.log_success(task_summary, str(result)[:500], task_tags)
                return result
            except Exception as e:
                logger.log_failure(
                    task_summary,
                    str(e),
                    traceback.format_exc()[:500],
                    task_tags + ["error"],
                )
                raise

        return wrapper

    return decorator


class AgentLoggerMixin:
    """Mixin class that adds auto-logging to agents.

    Inherit from this mixin to get automatic logging of all agent runs.
    """

    _memory_client: Optional[SupabaseMemoryClient] = None
    BRAIN_NAME: str = "engineering"

    def _auto_log_run(
        self,
        task: str,
        result: Any,
        success: bool,
        error: Optional[str] = None,
    ) -> Optional[str]:
        """Log an agent run automatically.

        Args:
            task: The task that was executed.
            result: The result (or error message).
            success: Whether it succeeded.
            error: Error message if failed.

        Returns:
            Experience ID if logged.
        """
        if not self._memory_client:
            return None

        try:
            logger = AutoLogger(
                memory_client=self._memory_client,
                brain_type=self.BRAIN_NAME,
            )

            if success:
                return logger.log_success(
                    task_summary=task[:200],
                    solution=str(result)[:500] if result else "Completed",
                    tags=[self.BRAIN_NAME, "agent-run"],
                )
            else:
                return logger.log_failure(
                    task_summary=task[:200],
                    problem=error or "Unknown error",
                    lessons_learned=str(result)[:500] if result else "No additional info",
                    tags=[self.BRAIN_NAME, "agent-run", "error"],
                )

        except Exception:
            # Don't let logging failures break the agent
            return None
