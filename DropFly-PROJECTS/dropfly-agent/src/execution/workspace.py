"""Project workspace management.

Creates, manages, and cleans up isolated project directories for builds.
Each build gets its own workspace with git init, dependency isolation, etc.
"""

from __future__ import annotations

import logging
import shutil
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

logger = logging.getLogger(__name__)

DEFAULT_WORKSPACE_ROOT = Path("./workspaces")


@dataclass
class Workspace:
    """A managed project workspace."""

    id: str
    name: str
    path: Path
    created_at: str
    project_type: str = ""
    metadata: dict[str, Any] = field(default_factory=dict)

    @property
    def exists(self) -> bool:
        return self.path.exists()

    @property
    def size_bytes(self) -> int:
        if not self.exists:
            return 0
        total = 0
        for f in self.path.rglob("*"):
            if f.is_file():
                total += f.stat().st_size
        return total

    @property
    def file_count(self) -> int:
        if not self.exists:
            return 0
        return sum(1 for f in self.path.rglob("*") if f.is_file())


class WorkspaceManager:
    """Manages isolated project workspaces.

    Usage:
        mgr = WorkspaceManager()

        # Create a workspace for a new build
        ws = mgr.create("my-saas-app", project_type="nextjs")
        print(ws.path)  # ./workspaces/my-saas-app_abc123/

        # List active workspaces
        for ws in mgr.list():
            print(f"{ws.name}: {ws.file_count} files")

        # Clean up
        mgr.destroy(ws.id)
    """

    def __init__(self, root: str | Path | None = None):
        self.root = Path(root) if root else DEFAULT_WORKSPACE_ROOT
        self.root.mkdir(parents=True, exist_ok=True)
        self._workspaces: dict[str, Workspace] = {}

        # Discover existing workspaces
        self._discover()

    def _discover(self) -> None:
        """Discover existing workspace directories."""
        if not self.root.exists():
            return
        for item in self.root.iterdir():
            if item.is_dir() and not item.name.startswith("."):
                ws_id = item.name
                self._workspaces[ws_id] = Workspace(
                    id=ws_id,
                    name=ws_id.rsplit("_", 1)[0] if "_" in ws_id else ws_id,
                    path=item,
                    created_at=datetime.fromtimestamp(
                        item.stat().st_ctime, tz=timezone.utc
                    ).isoformat(),
                )

    def create(
        self,
        name: str,
        project_type: str = "",
        template: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> Workspace:
        """Create a new workspace.

        Args:
            name: Project name (sanitized for filesystem).
            project_type: Type of project (nextjs, python, react-native, etc.).
            template: Optional template to initialize from.
            metadata: Additional metadata to store.

        Returns:
            Workspace object with the path.
        """
        # Sanitize name
        safe_name = "".join(c if c.isalnum() or c in "-_" else "-" for c in name.lower())
        ws_id = f"{safe_name}_{uuid.uuid4().hex[:8]}"
        ws_path = self.root / ws_id

        ws_path.mkdir(parents=True, exist_ok=True)

        workspace = Workspace(
            id=ws_id,
            name=name,
            path=ws_path,
            created_at=datetime.now(timezone.utc).isoformat(),
            project_type=project_type,
            metadata=metadata or {},
        )

        # Initialize based on project type
        if template:
            self._apply_template(ws_path, template)
        elif project_type:
            self._init_project_type(ws_path, project_type)

        self._workspaces[ws_id] = workspace
        logger.info(f"Created workspace: {ws_id} at {ws_path}")
        return workspace

    def get(self, ws_id: str) -> Workspace | None:
        """Get a workspace by ID."""
        return self._workspaces.get(ws_id)

    def list(self) -> list[Workspace]:
        """List all workspaces."""
        return list(self._workspaces.values())

    def destroy(self, ws_id: str) -> bool:
        """Destroy a workspace and delete all files.

        Args:
            ws_id: Workspace ID.

        Returns:
            True if destroyed successfully.
        """
        ws = self._workspaces.get(ws_id)
        if not ws:
            return False

        try:
            if ws.path.exists():
                shutil.rmtree(ws.path)
            self._workspaces.pop(ws_id, None)
            logger.info(f"Destroyed workspace: {ws_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to destroy workspace {ws_id}: {e}")
            return False

    def cleanup_old(self, max_age_hours: int = 24) -> int:
        """Remove workspaces older than max_age_hours.

        Returns:
            Number of workspaces removed.
        """
        now = datetime.now(timezone.utc)
        removed = 0
        for ws_id, ws in list(self._workspaces.items()):
            try:
                created = datetime.fromisoformat(ws.created_at)
                age_hours = (now - created).total_seconds() / 3600
                if age_hours > max_age_hours:
                    if self.destroy(ws_id):
                        removed += 1
            except (ValueError, TypeError):
                continue
        return removed

    def _init_project_type(self, path: Path, project_type: str) -> None:
        """Initialize a workspace for a specific project type."""
        gitignore_content = "node_modules/\n.env\n.next/\ndist/\n__pycache__/\n*.pyc\n.venv/\n"

        if project_type in ("nextjs", "react", "typescript", "javascript"):
            (path / ".gitignore").write_text(gitignore_content)
        elif project_type in ("python", "fastapi", "django"):
            (path / ".gitignore").write_text(
                "__pycache__/\n*.pyc\n.venv/\n.env\ndist/\n*.egg-info/\n"
            )
        elif project_type in ("react-native", "expo"):
            (path / ".gitignore").write_text(
                "node_modules/\n.expo/\ndist/\n.env\nios/Pods/\n"
            )
        else:
            (path / ".gitignore").write_text(gitignore_content)

    def _apply_template(self, path: Path, template: str) -> None:
        """Apply a project template. Extensible for custom templates."""
        # Templates can be added here or loaded from a templates directory
        logger.info(f"Template '{template}' would be applied to {path}")

    @property
    def total_size_bytes(self) -> int:
        """Total disk usage of all workspaces."""
        return sum(ws.size_bytes for ws in self._workspaces.values())

    @property
    def count(self) -> int:
        return len(self._workspaces)
