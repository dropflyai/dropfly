"""Authentication — API key + JWT token auth for the gateway.

Supports:
- API key auth (header: X-API-Key)
- JWT bearer tokens (header: Authorization: Bearer <token>)
- Role-based access (admin, builder, viewer)
"""

from __future__ import annotations

import hashlib
import hmac
import logging
import time
from typing import Any, Optional

import jwt
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# -------------------------------------------------------------------
# Models
# -------------------------------------------------------------------


class TeamMember(BaseModel):
    """Authenticated team member."""

    id: str
    name: str
    role: str = "builder"  # admin | builder | viewer
    team_id: str = "default"


class TokenPayload(BaseModel):
    """JWT token payload."""

    sub: str  # user ID
    name: str
    role: str
    team_id: str
    exp: float
    iat: float


# -------------------------------------------------------------------
# API Key Store  (in-memory for now — back with Supabase later)
# -------------------------------------------------------------------

_API_KEYS: dict[str, TeamMember] = {}


def register_api_key(api_key: str, member: TeamMember) -> None:
    """Register an API key for a team member."""
    hashed = _hash_key(api_key)
    _API_KEYS[hashed] = member


def _hash_key(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()


# -------------------------------------------------------------------
# JWT helpers
# -------------------------------------------------------------------


def create_token(
    member: TeamMember,
    secret_key: str,
    algorithm: str = "HS256",
    expires_in: int = 86400,  # 24h
) -> str:
    """Create a JWT token for a team member."""
    now = time.time()
    payload = {
        "sub": member.id,
        "name": member.name,
        "role": member.role,
        "team_id": member.team_id,
        "iat": now,
        "exp": now + expires_in,
    }
    return jwt.encode(payload, secret_key, algorithm=algorithm)


def decode_token(
    token: str,
    secret_key: str,
    algorithm: str = "HS256",
) -> TokenPayload | None:
    """Decode and validate a JWT token."""
    try:
        data = jwt.decode(token, secret_key, algorithms=[algorithm])
        return TokenPayload(**data)
    except jwt.ExpiredSignatureError:
        logger.warning("Token expired")
        return None
    except jwt.InvalidTokenError as e:
        logger.warning("Invalid token: %s", e)
        return None


# -------------------------------------------------------------------
# Auth resolver — works with both API keys and JWT
# -------------------------------------------------------------------


def authenticate(
    api_key: str | None,
    bearer_token: str | None,
    secret_key: str,
    jwt_algorithm: str = "HS256",
) -> TeamMember | None:
    """Authenticate a request via API key or JWT bearer token.

    Args:
        api_key: Value of X-API-Key header.
        bearer_token: Value of Authorization header (without 'Bearer ').
        secret_key: Server secret for JWT verification.
        jwt_algorithm: JWT algorithm.

    Returns:
        TeamMember if authenticated, None otherwise.
    """
    # Try API key first
    if api_key:
        hashed = _hash_key(api_key)
        member = _API_KEYS.get(hashed)
        if member:
            return member

    # Try JWT
    if bearer_token:
        payload = decode_token(bearer_token, secret_key, jwt_algorithm)
        if payload:
            return TeamMember(
                id=payload.sub,
                name=payload.name,
                role=payload.role,
                team_id=payload.team_id,
            )

    return None


# -------------------------------------------------------------------
# Permission checks
# -------------------------------------------------------------------


ROLE_PERMISSIONS: dict[str, set[str]] = {
    "admin": {"build", "status", "chat", "artifacts", "manage_team", "manage_keys"},
    "builder": {"build", "status", "chat", "artifacts"},
    "viewer": {"status", "artifacts"},
}


def has_permission(member: TeamMember, permission: str) -> bool:
    """Check if a team member has a specific permission."""
    perms = ROLE_PERMISSIONS.get(member.role, set())
    return permission in perms
