"""Chat routes — conversational interface to the agent system.

POST /chat          — Send a message to an active session or start new
POST /chat/{id}     — Continue a conversation in a session
"""

from __future__ import annotations

import asyncio
import logging
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from ..auth import TeamMember, has_permission
from ..session import SessionManager, SessionStatus
from ..deps import get_session_manager, get_current_user, get_chat_handler

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["chat"])


# -------------------------------------------------------------------
# Request / Response models
# -------------------------------------------------------------------


class ChatMessage(BaseModel):
    """A single chat message."""

    role: str = "user"
    content: str


class ChatRequest(BaseModel):
    """Chat request — send a message."""

    message: str = Field(..., min_length=1)
    session_id: str | None = Field(None, description="Existing session to continue")
    stream: bool = Field(False, description="Stream the response via SSE")
    model: str | None = Field(None, description="Override model for this message")


class ChatResponse(BaseModel):
    """Chat response."""

    session_id: str
    message: str
    agent_type: str = ""
    tool_calls: list[dict[str, Any]] = []
    done: bool = True


# -------------------------------------------------------------------
# Routes
# -------------------------------------------------------------------


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    user: TeamMember = Depends(get_current_user),
    sessions: SessionManager = Depends(get_session_manager),
    handler: Any = Depends(get_chat_handler),
) -> ChatResponse | StreamingResponse:
    """Send a message to the agent system.

    If session_id is provided, continues that session.
    If not, creates a new session with the Intake Agent.
    """
    if not has_permission(user, "chat"):
        raise HTTPException(status_code=403, detail="No chat permission")

    # Get or create session
    session = None
    if request.session_id:
        session = await sessions.get(request.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

    if not session:
        session = await sessions.create(
            prompt=request.message,
            user_id=user.id,
            user_name=user.name,
            team_id=user.team_id,
        )

    # Log the user message
    await sessions.add_event(
        session_id=session.id,
        event_type="user_message",
        content=request.message,
    )

    # Stream response via SSE
    if request.stream:
        return StreamingResponse(
            _stream_response(handler, session, request.message, request.model),
            media_type="text/event-stream",
        )

    # Non-streaming response
    result = await handler.handle_message(
        session=session,
        message=request.message,
        model_override=request.model,
    )

    await sessions.add_event(
        session_id=session.id,
        event_type="agent_response",
        content=result.get("message", ""),
        agent_type=result.get("agent_type", ""),
    )

    return ChatResponse(
        session_id=session.id,
        message=result.get("message", ""),
        agent_type=result.get("agent_type", ""),
        tool_calls=result.get("tool_calls", []),
        done=result.get("done", True),
    )


@router.post("/{session_id}", response_model=ChatResponse)
async def chat_in_session(
    session_id: str,
    request: ChatRequest,
    user: TeamMember = Depends(get_current_user),
    sessions: SessionManager = Depends(get_session_manager),
    handler: Any = Depends(get_chat_handler),
) -> ChatResponse | StreamingResponse:
    """Continue a conversation in an existing session."""
    request.session_id = session_id
    return await chat(request, user, sessions, handler)


async def _stream_response(handler: Any, session: Any, message: str, model: str | None):
    """Generator for SSE streaming."""
    import json

    try:
        async for chunk in handler.stream_message(
            session=session,
            message=message,
            model_override=model,
        ):
            data = json.dumps(chunk)
            yield f"data: {data}\n\n"
    except Exception as e:
        error = json.dumps({"error": str(e)})
        yield f"data: {error}\n\n"
    finally:
        yield "data: [DONE]\n\n"
