"""Status routes — system health and session listing.

GET /status         — System health check
GET /sessions       — List all sessions
GET /sessions/{id}/events — Get session event timeline
"""

from __future__ import annotations

import time
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from ..auth import TeamMember, has_permission
from ..session import SessionManager, SessionStatus
from ..deps import get_session_manager, get_current_user

router = APIRouter(tags=["status"])


# -------------------------------------------------------------------
# Response models
# -------------------------------------------------------------------


class HealthResponse(BaseModel):
    """System health."""

    status: str = "ok"
    version: str = "0.1.0"
    uptime_seconds: float = 0
    active_sessions: int = 0


class SessionSummary(BaseModel):
    """Brief session info for listings."""

    id: str
    status: str
    prompt: str
    user_name: str
    created_at: float
    updated_at: float
    active_agents: list[str]
    event_count: int


class EventResponse(BaseModel):
    """A timeline event."""

    id: str
    timestamp: float
    agent_id: str
    agent_type: str
    event_type: str
    content: str
    metadata: dict[str, Any] = {}


# -------------------------------------------------------------------
# Module state
# -------------------------------------------------------------------

_start_time = time.time()


# -------------------------------------------------------------------
# Routes
# -------------------------------------------------------------------


@router.get("/status", response_model=HealthResponse)
async def health_check(
    sessions: SessionManager = Depends(get_session_manager),
) -> HealthResponse:
    """System health check — no auth required."""
    all_sessions = await sessions.list_sessions(limit=1000)
    active = sum(
        1 for s in all_sessions
        if s.status in (SessionStatus.INTAKE, SessionStatus.PLANNING, SessionStatus.BUILDING, SessionStatus.REVIEWING, SessionStatus.DEPLOYING)
    )
    return HealthResponse(
        uptime_seconds=time.time() - _start_time,
        active_sessions=active,
    )


@router.get("/sessions", response_model=list[SessionSummary])
async def list_sessions(
    status: str | None = Query(None, description="Filter by status"),
    limit: int = Query(50, ge=1, le=200),
    user: TeamMember = Depends(get_current_user),
    sessions: SessionManager = Depends(get_session_manager),
) -> list[SessionSummary]:
    """List build sessions for the team."""
    if not has_permission(user, "status"):
        raise HTTPException(status_code=403, detail="No status permission")

    status_filter = SessionStatus(status) if status else None
    results = await sessions.list_sessions(
        team_id=user.team_id,
        status=status_filter,
        limit=limit,
    )

    return [
        SessionSummary(
            id=s.id,
            status=s.status.value,
            prompt=s.original_prompt[:200],
            user_name=s.user_name,
            created_at=s.created_at,
            updated_at=s.updated_at,
            active_agents=s.active_agents,
            event_count=len(s.events),
        )
        for s in results
    ]


@router.get("/sessions/{session_id}/events", response_model=list[EventResponse])
async def get_session_events(
    session_id: str,
    after: float | None = Query(None, description="Only events after this timestamp"),
    limit: int = Query(100, ge=1, le=500),
    user: TeamMember = Depends(get_current_user),
    sessions: SessionManager = Depends(get_session_manager),
) -> list[EventResponse]:
    """Get the event timeline for a session."""
    if not has_permission(user, "status"):
        raise HTTPException(status_code=403, detail="No status permission")

    session = await sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    events = session.events
    if after is not None:
        events = [e for e in events if e.timestamp > after]

    events = events[-limit:]

    return [
        EventResponse(
            id=e.id,
            timestamp=e.timestamp,
            agent_id=e.agent_id,
            agent_type=e.agent_type,
            event_type=e.event_type,
            content=e.content,
            metadata=e.metadata,
        )
        for e in events
    ]
