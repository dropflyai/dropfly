"""FastAPI dependency injection — shared singletons for routes.

All route handlers get their dependencies via Depends() from here.
"""

from __future__ import annotations

import logging
from typing import Any

from fastapi import Depends, HTTPException, Request

from .auth import TeamMember, authenticate
from .session import SessionManager

logger = logging.getLogger(__name__)


# -------------------------------------------------------------------
# Singletons  (set during app startup in server.py)
# -------------------------------------------------------------------

_session_manager: SessionManager | None = None
_build_runner: Any = None
_chat_handler: Any = None
_settings: Any = None


def set_session_manager(sm: SessionManager) -> None:
    global _session_manager
    _session_manager = sm


def set_build_runner(runner: Any) -> None:
    global _build_runner
    _build_runner = runner


def set_chat_handler(handler: Any) -> None:
    global _chat_handler
    _chat_handler = handler


def set_settings(s: Any) -> None:
    global _settings
    _settings = s


# -------------------------------------------------------------------
# Dependencies  (used via Depends() in routes)
# -------------------------------------------------------------------


def get_session_manager() -> SessionManager:
    """Get the session manager singleton."""
    if _session_manager is None:
        raise HTTPException(status_code=503, detail="Server not initialized")
    return _session_manager


def get_build_runner() -> Any:
    """Get the build runner singleton."""
    if _build_runner is None:
        raise HTTPException(status_code=503, detail="Build runner not initialized")
    return _build_runner


def get_chat_handler() -> Any:
    """Get the chat handler singleton."""
    if _chat_handler is None:
        raise HTTPException(status_code=503, detail="Chat handler not initialized")
    return _chat_handler


def get_settings() -> Any:
    """Get application settings."""
    return _settings


async def get_current_user(request: Request) -> TeamMember:
    """Extract and validate the current user from request headers.

    Checks X-API-Key header first, then Authorization: Bearer <token>.
    """
    if _settings is None:
        raise HTTPException(status_code=503, detail="Server not initialized")

    api_key = request.headers.get("X-API-Key")

    bearer_token = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        bearer_token = auth_header[7:]

    member = authenticate(
        api_key=api_key,
        bearer_token=bearer_token,
        secret_key=_settings.gateway.secret_key,
        jwt_algorithm=_settings.gateway.jwt_algorithm,
    )

    if not member:
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing authentication",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return member
