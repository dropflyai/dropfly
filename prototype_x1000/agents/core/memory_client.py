"""Supabase memory client for agent logging and retrieval."""

import os
import json
from datetime import datetime
from typing import Any, Optional
from uuid import uuid4

from supabase import create_client, Client
from pydantic import BaseModel


class Experience(BaseModel):
    """Model for shared_experiences table."""

    brain_type: str
    project_id: Optional[str] = None
    category: str  # success, failure, pattern, learning
    task_summary: str
    problem: Optional[str] = None
    solution: Optional[str] = None
    outcome: Optional[str] = None
    lessons_learned: Optional[str] = None
    tags: list[str] = []


class AgentRun(BaseModel):
    """Model for agent_runs table."""

    agent_type: str
    task_input: str
    task_output: Optional[str] = None
    success: bool = False
    tool_calls: list[dict[str, Any]] = []
    tokens_used: Optional[int] = None
    model: Optional[str] = None


class Pattern(BaseModel):
    """Model for shared_patterns table."""

    brain_type: str
    pattern_name: str
    description: str
    trigger_conditions: list[str] = []
    solution_template: Optional[str] = None
    example_usages: list[str] = []
    observation_count: int = 1
    tags: list[str] = []


class SupabaseMemoryClient:
    """Client for all Supabase memory operations."""

    def __init__(
        self,
        url: Optional[str] = None,
        key: Optional[str] = None,
    ):
        """Initialize the Supabase client.

        Args:
            url: Supabase project URL. Defaults to SUPABASE_URL env var.
            key: Supabase service key. Defaults to SUPABASE_SERVICE_KEY env var.
        """
        self.url = url or os.environ.get("SUPABASE_URL")
        self.key = key or os.environ.get("SUPABASE_SERVICE_KEY")

        if not self.url or not self.key:
            raise ValueError(
                "Supabase credentials required. Set SUPABASE_URL and "
                "SUPABASE_SERVICE_KEY environment variables."
            )

        self.client: Client = create_client(self.url, self.key)

    # -------------------------------------------------------------------------
    # Agent Runs
    # -------------------------------------------------------------------------

    def log_agent_run(self, run: AgentRun) -> str:
        """Log an agent execution run.

        Args:
            run: AgentRun model with execution details.

        Returns:
            UUID of the created record.
        """
        run_id = str(uuid4())
        data = {
            "id": run_id,
            "agent_type": run.agent_type,
            "task_input": run.task_input,
            "task_output": run.task_output,
            "success": run.success,
            "tool_calls": run.tool_calls,
            "tokens_used": run.tokens_used,
            "model": run.model,
            "created_at": datetime.utcnow().isoformat(),
        }

        self.client.table("agent_runs").insert(data).execute()
        return run_id

    def get_agent_runs(
        self,
        agent_type: Optional[str] = None,
        limit: int = 10,
        success_only: bool = False,
    ) -> list[dict[str, Any]]:
        """Retrieve recent agent runs.

        Args:
            agent_type: Filter by agent type.
            limit: Maximum number of runs to return.
            success_only: Only return successful runs.

        Returns:
            List of agent run records.
        """
        query = self.client.table("agent_runs").select("*")

        if agent_type:
            query = query.eq("agent_type", agent_type)
        if success_only:
            query = query.eq("success", True)

        query = query.order("created_at", desc=True).limit(limit)
        result = query.execute()
        return result.data

    # -------------------------------------------------------------------------
    # Experiences (Shared Learning)
    # -------------------------------------------------------------------------

    def log_experience(self, experience: Experience) -> str:
        """Log a learning experience to shared_experiences.

        Args:
            experience: Experience model with task details.

        Returns:
            UUID of the created record.
        """
        exp_id = str(uuid4())
        data = {
            "id": exp_id,
            "brain_type": experience.brain_type,
            "project_id": experience.project_id,
            "category": experience.category,
            "task_summary": experience.task_summary,
            "problem": experience.problem,
            "solution": experience.solution,
            "outcome": experience.outcome,
            "lessons_learned": experience.lessons_learned,
            "tags": experience.tags,
            "created_at": datetime.utcnow().isoformat(),
        }

        self.client.table("shared_experiences").insert(data).execute()
        return exp_id

    def search_experiences(
        self,
        brain_type: Optional[str] = None,
        category: Optional[str] = None,
        tags: Optional[list[str]] = None,
        search_text: Optional[str] = None,
        limit: int = 10,
    ) -> list[dict[str, Any]]:
        """Search shared experiences.

        Args:
            brain_type: Filter by brain type.
            category: Filter by category (success, failure, pattern, learning).
            tags: Filter by tags (any match).
            search_text: Full-text search in task_summary.
            limit: Maximum results.

        Returns:
            List of matching experience records.
        """
        query = self.client.table("shared_experiences").select("*")

        if brain_type:
            query = query.eq("brain_type", brain_type)
        if category:
            query = query.eq("category", category)
        if tags:
            query = query.contains("tags", tags)
        if search_text:
            query = query.ilike("task_summary", f"%{search_text}%")

        query = query.order("created_at", desc=True).limit(limit)
        result = query.execute()
        return result.data

    def get_recent_experiences(
        self,
        brain_type: str,
        limit: int = 5,
    ) -> list[dict[str, Any]]:
        """Get recent experiences for a brain type.

        Args:
            brain_type: The brain type to filter by.
            limit: Maximum results.

        Returns:
            List of recent experience records.
        """
        return self.search_experiences(brain_type=brain_type, limit=limit)

    # -------------------------------------------------------------------------
    # Patterns
    # -------------------------------------------------------------------------

    def log_pattern(self, pattern: Pattern) -> str:
        """Log a reusable pattern to shared_patterns.

        Args:
            pattern: Pattern model with pattern details.

        Returns:
            UUID of the created record.
        """
        pattern_id = str(uuid4())
        data = {
            "id": pattern_id,
            "brain_type": pattern.brain_type,
            "pattern_name": pattern.pattern_name,
            "description": pattern.description,
            "trigger_conditions": pattern.trigger_conditions,
            "solution_template": pattern.solution_template,
            "example_usages": pattern.example_usages,
            "observation_count": pattern.observation_count,
            "tags": pattern.tags,
            "created_at": datetime.utcnow().isoformat(),
        }

        self.client.table("shared_patterns").insert(data).execute()
        return pattern_id

    def find_pattern(
        self,
        pattern_name: Optional[str] = None,
        tags: Optional[list[str]] = None,
        brain_type: Optional[str] = None,
    ) -> Optional[dict[str, Any]]:
        """Find a matching pattern.

        Args:
            pattern_name: Exact pattern name match.
            tags: Tags to match.
            brain_type: Brain type filter.

        Returns:
            Pattern record if found, None otherwise.
        """
        query = self.client.table("shared_patterns").select("*")

        if pattern_name:
            query = query.eq("pattern_name", pattern_name)
        if brain_type:
            query = query.eq("brain_type", brain_type)
        if tags:
            query = query.contains("tags", tags)

        query = query.limit(1)
        result = query.execute()
        return result.data[0] if result.data else None

    def increment_pattern_observation(self, pattern_id: str) -> None:
        """Increment the observation count for a pattern.

        Args:
            pattern_id: UUID of the pattern.
        """
        result = (
            self.client.table("shared_patterns")
            .select("observation_count")
            .eq("id", pattern_id)
            .single()
            .execute()
        )

        if result.data:
            new_count = result.data["observation_count"] + 1
            (
                self.client.table("shared_patterns")
                .update({"observation_count": new_count})
                .eq("id", pattern_id)
                .execute()
            )

    def get_established_patterns(
        self,
        min_observations: int = 3,
        brain_type: Optional[str] = None,
    ) -> list[dict[str, Any]]:
        """Get patterns that have been observed multiple times.

        Args:
            min_observations: Minimum observation count (default 3).
            brain_type: Optional brain type filter.

        Returns:
            List of established pattern records.
        """
        query = (
            self.client.table("shared_patterns")
            .select("*")
            .gte("observation_count", min_observations)
        )

        if brain_type:
            query = query.eq("brain_type", brain_type)

        query = query.order("observation_count", desc=True)
        result = query.execute()
        return result.data

    # -------------------------------------------------------------------------
    # Brain Builds (Meta-agent tracking)
    # -------------------------------------------------------------------------

    def log_brain_build(
        self,
        brain_name: str,
        validation_passed: bool,
        files_created: list[str],
        validation_errors: Optional[list[str]] = None,
    ) -> str:
        """Log a brain generation attempt.

        Args:
            brain_name: Name of the brain being built.
            validation_passed: Whether quality validation passed.
            files_created: List of files created.
            validation_errors: List of validation errors if any.

        Returns:
            UUID of the created record.
        """
        build_id = str(uuid4())
        data = {
            "id": build_id,
            "brain_name": brain_name,
            "validation_passed": validation_passed,
            "files_created": files_created,
            "validation_errors": validation_errors or [],
            "created_at": datetime.utcnow().isoformat(),
        }

        self.client.table("brain_builds").insert(data).execute()
        return build_id

    def get_brain_builds(
        self,
        brain_name: Optional[str] = None,
        passed_only: bool = False,
        limit: int = 10,
    ) -> list[dict[str, Any]]:
        """Get brain build records.

        Args:
            brain_name: Filter by brain name.
            passed_only: Only return successful builds.
            limit: Maximum results.

        Returns:
            List of brain build records.
        """
        query = self.client.table("brain_builds").select("*")

        if brain_name:
            query = query.eq("brain_name", brain_name)
        if passed_only:
            query = query.eq("validation_passed", True)

        query = query.order("created_at", desc=True).limit(limit)
        result = query.execute()
        return result.data

    # -------------------------------------------------------------------------
    # Cross-Brain Queries
    # -------------------------------------------------------------------------

    def get_relevant_context(
        self,
        task_description: str,
        brain_types: list[str],
        limit_per_type: int = 3,
    ) -> dict[str, list[dict[str, Any]]]:
        """Get relevant experiences and patterns for a task.

        Args:
            task_description: Description of the task.
            brain_types: List of brain types to search.
            limit_per_type: Max results per brain type.

        Returns:
            Dict mapping brain types to relevant records.
        """
        context: dict[str, list[dict[str, Any]]] = {}

        for brain_type in brain_types:
            experiences = self.search_experiences(
                brain_type=brain_type,
                search_text=task_description,
                limit=limit_per_type,
            )
            patterns = self.get_established_patterns(
                brain_type=brain_type,
                min_observations=2,
            )[:limit_per_type]

            context[brain_type] = {
                "experiences": experiences,
                "patterns": patterns,
            }

        return context
