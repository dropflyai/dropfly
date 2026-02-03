"""Supabase memory client for agent logging and retrieval.

Ported from prototype_x1000 with enhancements for async support
and the new agent architecture.
"""

from __future__ import annotations

import logging
import os
from datetime import datetime, timezone
from typing import Any, Optional
from uuid import uuid4

from pydantic import BaseModel

logger = logging.getLogger(__name__)


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
    agent_id: str = ""
    task_input: str
    task_output: Optional[str] = None
    success: bool = False
    tool_calls: list[dict[str, Any]] = []
    tokens_used: Optional[int] = None
    model: Optional[str] = None
    duration_ms: Optional[int] = None


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
    """Client for all Supabase memory operations.

    Works both sync and can be wrapped for async use.
    Gracefully degrades if Supabase is not configured.
    """

    def __init__(
        self,
        url: str | None = None,
        key: str | None = None,
    ):
        self.url = url or os.environ.get("SUPABASE_URL", "")
        self.key = key or os.environ.get("SUPABASE_SERVICE_KEY", "")

        if not self.url or not self.key:
            raise ValueError(
                "Supabase credentials required. Set SUPABASE_URL and "
                "SUPABASE_SERVICE_KEY environment variables."
            )

        from supabase import create_client, Client

        self.client: Client = create_client(self.url, self.key)

    # ------------------------------------------------------------------
    # Agent Runs
    # ------------------------------------------------------------------

    def log_agent_run(self, run: AgentRun) -> str:
        """Log an agent execution run. Returns the record ID."""
        run_id = str(uuid4())
        data = {
            "id": run_id,
            "agent_type": run.agent_type,
            "agent_id": run.agent_id,
            "task_input": run.task_input,
            "task_output": run.task_output,
            "success": run.success,
            "tool_calls": run.tool_calls,
            "tokens_used": run.tokens_used,
            "model": run.model,
            "duration_ms": run.duration_ms,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self.client.table("agent_runs").insert(data).execute()
        return run_id

    def get_agent_runs(
        self,
        agent_type: str | None = None,
        limit: int = 10,
        success_only: bool = False,
    ) -> list[dict[str, Any]]:
        """Retrieve recent agent runs."""
        query = self.client.table("agent_runs").select("*")
        if agent_type:
            query = query.eq("agent_type", agent_type)
        if success_only:
            query = query.eq("success", True)
        query = query.order("created_at", desc=True).limit(limit)
        return query.execute().data

    # ------------------------------------------------------------------
    # Experiences
    # ------------------------------------------------------------------

    def log_experience(self, experience: Experience) -> str:
        """Log a learning experience. Returns the record ID."""
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
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self.client.table("shared_experiences").insert(data).execute()
        return exp_id

    def search_experiences(
        self,
        brain_type: str | None = None,
        category: str | None = None,
        tags: list[str] | None = None,
        search_text: str | None = None,
        limit: int = 10,
    ) -> list[dict[str, Any]]:
        """Search shared experiences."""
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
        return query.execute().data

    def get_recent_experiences(
        self,
        brain_type: str,
        limit: int = 5,
    ) -> list[dict[str, Any]]:
        """Get recent experiences for a brain type."""
        return self.search_experiences(brain_type=brain_type, limit=limit)

    # ------------------------------------------------------------------
    # Patterns
    # ------------------------------------------------------------------

    def log_pattern(self, pattern: Pattern) -> str:
        """Log a reusable pattern. Returns the record ID."""
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
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self.client.table("shared_patterns").insert(data).execute()
        return pattern_id

    def get_established_patterns(
        self,
        min_observations: int = 3,
        brain_type: str | None = None,
    ) -> list[dict[str, Any]]:
        """Get patterns observed multiple times."""
        query = (
            self.client.table("shared_patterns")
            .select("*")
            .gte("observation_count", min_observations)
        )
        if brain_type:
            query = query.eq("brain_type", brain_type)
        query = query.order("observation_count", desc=True)
        return query.execute().data

    # ------------------------------------------------------------------
    # Cross-brain context
    # ------------------------------------------------------------------

    def get_relevant_context(
        self,
        task_description: str,
        brain_types: list[str],
        limit_per_type: int = 3,
    ) -> dict[str, Any]:
        """Get relevant experiences and patterns for a task across brains."""
        context: dict[str, Any] = {}
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
