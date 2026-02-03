"""Build routes — start and manage autonomous builds.

POST /build         — Start a new build from a prompt
POST /build/{id}/cancel — Cancel a running build
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from ..auth import TeamMember, has_permission
from ..session import Session, SessionManager, SessionStatus
from ..deps import get_session_manager, get_current_user, get_build_runner

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/build", tags=["build"])


# -------------------------------------------------------------------
# Request / Response models
# -------------------------------------------------------------------


class BuildRequest(BaseModel):
    """Start a new build."""

    prompt: str = Field(..., min_length=1, description="What to build")
    context: str | None = Field(None, description="Additional context or constraints")
    model: str | None = Field(None, description="Override orchestrator model")
    auto_deploy: bool = Field(False, description="Auto-deploy when build passes QA")


class BuildResponse(BaseModel):
    """Build started response."""

    session_id: str
    status: str
    message: str
    ws_url: str  # WebSocket URL for real-time updates


class BuildStatusResponse(BaseModel):
    """Build status."""

    session_id: str
    status: str
    active_agents: list[str]
    completed_agents: list[str]
    event_count: int
    error: str | None = None
    artifacts: dict[str, Any] = {}


# -------------------------------------------------------------------
# Routes
# -------------------------------------------------------------------


@router.post("", response_model=BuildResponse)
async def start_build(
    request: BuildRequest,
    user: TeamMember = Depends(get_current_user),
    sessions: SessionManager = Depends(get_session_manager),
    runner: Any = Depends(get_build_runner),
) -> BuildResponse:
    """Start a new autonomous build.

    The system will:
    1. Extract requirements (Intake Agent)
    2. Decompose into tasks (CEO Agent)
    3. Spawn parallel agents to build
    4. Report progress via WebSocket
    """
    if not has_permission(user, "build"):
        raise HTTPException(status_code=403, detail="No build permission")

    # Create session
    session = await sessions.create(
        prompt=request.prompt,
        user_id=user.id,
        user_name=user.name,
        team_id=user.team_id,
    )

    # Start the build pipeline in background
    asyncio.create_task(
        runner.run_build(
            session=session,
            prompt=request.prompt,
            context=request.context,
            model_override=request.model,
            auto_deploy=request.auto_deploy,
        )
    )

    return BuildResponse(
        session_id=session.id,
        status=session.status.value,
        message="Build started. Connect via WebSocket for real-time updates.",
        ws_url=f"/ws/{session.id}",
    )


@router.get("/{session_id}", response_model=BuildStatusResponse)
async def get_build_status(
    session_id: str,
    user: TeamMember = Depends(get_current_user),
    sessions: SessionManager = Depends(get_session_manager),
) -> BuildStatusResponse:
    """Get the current status of a build."""
    if not has_permission(user, "status"):
        raise HTTPException(status_code=403, detail="No status permission")

    session = await sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return BuildStatusResponse(
        session_id=session.id,
        status=session.status.value,
        active_agents=session.active_agents,
        completed_agents=session.completed_agents,
        event_count=len(session.events),
        error=session.error,
        artifacts=session.artifacts,
    )


@router.post("/{session_id}/cancel")
async def cancel_build(
    session_id: str,
    user: TeamMember = Depends(get_current_user),
    sessions: SessionManager = Depends(get_session_manager),
) -> dict[str, str]:
    """Cancel a running build."""
    if not has_permission(user, "build"):
        raise HTTPException(status_code=403, detail="No build permission")

    session = await sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.status in (SessionStatus.COMPLETED, SessionStatus.FAILED, SessionStatus.CANCELLED):
        raise HTTPException(status_code=400, detail=f"Build already {session.status.value}")

    session.set_status(SessionStatus.CANCELLED)
    await sessions.add_event(
        session_id=session_id,
        event_type="cancelled",
        content=f"Build cancelled by {user.name}",
    )

    return {"status": "cancelled", "session_id": session_id}
