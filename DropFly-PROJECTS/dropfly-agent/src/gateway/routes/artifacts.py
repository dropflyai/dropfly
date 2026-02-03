"""Artifact routes — download files and outputs from builds.

GET /artifacts/{session_id}         — List all artifacts for a session
GET /artifacts/{session_id}/{name}  — Download a specific artifact
"""

from __future__ import annotations

import logging
import mimetypes
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from ..auth import TeamMember, has_permission
from ..session import SessionManager
from ..deps import get_session_manager, get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/artifacts", tags=["artifacts"])


# -------------------------------------------------------------------
# Response models
# -------------------------------------------------------------------


class ArtifactInfo(BaseModel):
    """Metadata about a single artifact."""

    name: str
    type: str = ""         # file, directory, data, url
    path: str | None = None
    size_bytes: int | None = None
    agent_id: str = ""
    description: str = ""
    metadata: dict[str, Any] = {}


class ArtifactListResponse(BaseModel):
    """List of artifacts for a session."""

    session_id: str
    count: int
    artifacts: list[ArtifactInfo]


# -------------------------------------------------------------------
# Routes
# -------------------------------------------------------------------


@router.get("/{session_id}", response_model=ArtifactListResponse)
async def list_artifacts(
    session_id: str,
    user: TeamMember = Depends(get_current_user),
    sessions: SessionManager = Depends(get_session_manager),
) -> ArtifactListResponse:
    """List all artifacts produced by a build session."""
    if not has_permission(user, "artifacts"):
        raise HTTPException(status_code=403, detail="No artifacts permission")

    session = await sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    artifacts: list[ArtifactInfo] = []
    for name, value in session.artifacts.items():
        info = ArtifactInfo(name=name)

        if isinstance(value, dict):
            info.type = value.get("type", "data")
            info.path = value.get("path")
            info.agent_id = value.get("agent_id", "")
            info.description = value.get("description", "")
            info.metadata = {k: v for k, v in value.items() if k not in ("type", "path", "agent_id", "description")}

            if info.path:
                p = Path(info.path)
                if p.exists() and p.is_file():
                    info.size_bytes = p.stat().st_size
        elif isinstance(value, str):
            info.type = "data"
            info.description = value[:200]
        else:
            info.type = "data"

        artifacts.append(info)

    return ArtifactListResponse(
        session_id=session_id,
        count=len(artifacts),
        artifacts=artifacts,
    )


@router.get("/{session_id}/{artifact_name}")
async def download_artifact(
    session_id: str,
    artifact_name: str,
    user: TeamMember = Depends(get_current_user),
    sessions: SessionManager = Depends(get_session_manager),
) -> FileResponse | dict[str, Any]:
    """Download a specific artifact.

    If the artifact is a file, returns the file.
    If it's data, returns it as JSON.
    """
    if not has_permission(user, "artifacts"):
        raise HTTPException(status_code=403, detail="No artifacts permission")

    session = await sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    artifact = session.artifacts.get(artifact_name)
    if artifact is None:
        raise HTTPException(status_code=404, detail=f"Artifact '{artifact_name}' not found")

    # If it has a file path, serve the file
    if isinstance(artifact, dict) and artifact.get("path"):
        file_path = Path(artifact["path"])
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Artifact file not found on disk")

        # Security: ensure path is under workspaces
        # (prevents path traversal attacks)
        try:
            file_path.resolve().relative_to(Path.cwd())
        except ValueError:
            raise HTTPException(status_code=403, detail="Access denied")

        media_type = mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"
        return FileResponse(
            path=str(file_path),
            media_type=media_type,
            filename=file_path.name,
        )

    # Otherwise return as JSON
    return {"name": artifact_name, "data": artifact}
