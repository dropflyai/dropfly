"""Session management — tracks active build sessions and their state.

Each build request creates a session that tracks:
- The original request
- Agent pool state
- Real-time events
- Artifacts produced
"""

from __future__ import annotations

import asyncio
import logging
import time
import uuid
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class SessionStatus(str, Enum):
    """Build session lifecycle."""

    INTAKE = "intake"          # Gathering requirements
    PLANNING = "planning"      # CEO decomposing tasks
    BUILDING = "building"      # Agents working in parallel
    REVIEWING = "reviewing"    # QA reviewing output
    DEPLOYING = "deploying"    # Deploy agent shipping
    COMPLETED = "completed"    # Done
    FAILED = "failed"          # Error
    CANCELLED = "cancelled"    # User cancelled


class SessionEvent(BaseModel):
    """A single event in a session's timeline."""

    id: str = Field(default_factory=lambda: uuid.uuid4().hex[:12])
    timestamp: float = Field(default_factory=time.time)
    agent_id: str = ""
    agent_type: str = ""
    event_type: str = ""       # status_update, tool_call, message, error, artifact
    content: str = ""
    metadata: dict[str, Any] = Field(default_factory=dict)


class Session(BaseModel):
    """A build session."""

    id: str = Field(default_factory=lambda: uuid.uuid4().hex[:16])
    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)
    status: SessionStatus = SessionStatus.INTAKE
    team_id: str = "default"
    user_id: str = ""
    user_name: str = ""

    # Request
    original_prompt: str = ""
    requirements: dict[str, Any] = Field(default_factory=dict)

    # Progress
    events: list[SessionEvent] = Field(default_factory=list)
    active_agents: list[str] = Field(default_factory=list)
    completed_agents: list[str] = Field(default_factory=list)

    # Output
    artifacts: dict[str, Any] = Field(default_factory=dict)
    error: str | None = None

    def add_event(
        self,
        event_type: str,
        content: str,
        agent_id: str = "",
        agent_type: str = "",
        metadata: dict[str, Any] | None = None,
    ) -> SessionEvent:
        """Add an event to the session timeline."""
        event = SessionEvent(
            agent_id=agent_id,
            agent_type=agent_type,
            event_type=event_type,
            content=content,
            metadata=metadata or {},
        )
        self.events.append(event)
        self.updated_at = time.time()
        return event

    def set_status(self, status: SessionStatus) -> None:
        """Update session status."""
        self.status = status
        self.updated_at = time.time()
        self.add_event("status_update", f"Session status: {status.value}")


class SessionManager:
    """Manages active and historical build sessions.

    Thread-safe via asyncio lock.
    """

    def __init__(self, max_sessions: int = 100) -> None:
        self._sessions: dict[str, Session] = {}
        self._lock = asyncio.Lock()
        self._max_sessions = max_sessions
        # Subscribers for real-time events  {session_id: [callback, ...]}
        self._subscribers: dict[str, list[asyncio.Queue]] = {}

    async def create(
        self,
        prompt: str,
        user_id: str = "",
        user_name: str = "",
        team_id: str = "default",
    ) -> Session:
        """Create a new build session."""
        async with self._lock:
            # Evict oldest completed sessions if at capacity
            if len(self._sessions) >= self._max_sessions:
                self._evict_old()

            session = Session(
                original_prompt=prompt,
                user_id=user_id,
                user_name=user_name,
                team_id=team_id,
            )
            self._sessions[session.id] = session
            self._subscribers[session.id] = []
            logger.info("Created session %s for user %s", session.id, user_id)
            return session

    async def get(self, session_id: str) -> Session | None:
        """Get a session by ID."""
        return self._sessions.get(session_id)

    async def list_sessions(
        self,
        team_id: str | None = None,
        status: SessionStatus | None = None,
        limit: int = 50,
    ) -> list[Session]:
        """List sessions with optional filters."""
        sessions = list(self._sessions.values())

        if team_id:
            sessions = [s for s in sessions if s.team_id == team_id]
        if status:
            sessions = [s for s in sessions if s.status == status]

        sessions.sort(key=lambda s: s.updated_at, reverse=True)
        return sessions[:limit]

    async def add_event(
        self,
        session_id: str,
        event_type: str,
        content: str,
        agent_id: str = "",
        agent_type: str = "",
        metadata: dict[str, Any] | None = None,
    ) -> SessionEvent | None:
        """Add an event to a session and notify subscribers."""
        session = self._sessions.get(session_id)
        if not session:
            return None

        event = session.add_event(
            event_type=event_type,
            content=content,
            agent_id=agent_id,
            agent_type=agent_type,
            metadata=metadata,
        )

        # Notify WebSocket subscribers
        for queue in self._subscribers.get(session_id, []):
            try:
                queue.put_nowait(event)
            except asyncio.QueueFull:
                pass  # Drop if subscriber is slow

        return event

    async def subscribe(self, session_id: str) -> asyncio.Queue:
        """Subscribe to real-time events for a session.

        Returns an asyncio.Queue that receives SessionEvent objects.
        """
        queue: asyncio.Queue = asyncio.Queue(maxsize=200)
        if session_id not in self._subscribers:
            self._subscribers[session_id] = []
        self._subscribers[session_id].append(queue)
        return queue

    async def unsubscribe(self, session_id: str, queue: asyncio.Queue) -> None:
        """Unsubscribe from session events."""
        subs = self._subscribers.get(session_id, [])
        if queue in subs:
            subs.remove(queue)

    def _evict_old(self) -> None:
        """Remove oldest completed sessions to make room."""
        completed = [
            s for s in self._sessions.values()
            if s.status in (SessionStatus.COMPLETED, SessionStatus.FAILED, SessionStatus.CANCELLED)
        ]
        completed.sort(key=lambda s: s.updated_at)

        to_remove = len(self._sessions) - self._max_sessions + 10  # Free up 10 slots
        for session in completed[:to_remove]:
            self._sessions.pop(session.id, None)
            self._subscribers.pop(session.id, None)
