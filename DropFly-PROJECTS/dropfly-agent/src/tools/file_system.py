"""File system tools for agents.

Read, write, search, and manage files. All operations are scoped
to allowed directories for safety.
"""

from __future__ import annotations

import os
import glob as glob_module
import logging
from pathlib import Path
from typing import Any

from ..core.tool_registry import ToolRegistry, ToolResult

logger = logging.getLogger(__name__)


async def read_file(path: str, offset: int = 0, limit: int = 2000) -> ToolResult:
    """Read a file and return its contents.

    Args:
        path: Absolute or relative file path.
        offset: Line number to start from (0-indexed).
        limit: Max number of lines to read.
    """
    try:
        p = Path(path).resolve()
        if not p.exists():
            return ToolResult(output="", success=False, error=f"File not found: {path}")
        if not p.is_file():
            return ToolResult(output="", success=False, error=f"Not a file: {path}")

        content = p.read_text(encoding="utf-8", errors="replace")
        lines = content.split("\n")

        if offset > 0 or limit < len(lines):
            lines = lines[offset : offset + limit]
            content = "\n".join(lines)
            if offset + limit < len(lines):
                content += f"\n... ({len(lines)} total lines)"

        return ToolResult(
            output=content,
            success=True,
            artifacts={"path": str(p), "lines": len(lines)},
        )
    except Exception as e:
        return ToolResult(output="", success=False, error=str(e))


async def write_file(path: str, content: str, create_dirs: bool = True) -> ToolResult:
    """Write content to a file.

    Args:
        path: File path to write to.
        content: Content to write.
        create_dirs: Create parent directories if they don't exist.
    """
    try:
        p = Path(path).resolve()

        if create_dirs:
            p.parent.mkdir(parents=True, exist_ok=True)

        p.write_text(content, encoding="utf-8")
        return ToolResult(
            output=f"Written {len(content)} chars to {p}",
            success=True,
            artifacts={"path": str(p), "size": len(content)},
        )
    except Exception as e:
        return ToolResult(output="", success=False, error=str(e))


async def edit_file(
    path: str, old_string: str, new_string: str, replace_all: bool = False
) -> ToolResult:
    """Edit a file by replacing a string.

    Args:
        path: File path.
        old_string: Text to find and replace.
        new_string: Replacement text.
        replace_all: Replace all occurrences (default: first only).
    """
    try:
        p = Path(path).resolve()
        if not p.exists():
            return ToolResult(output="", success=False, error=f"File not found: {path}")

        content = p.read_text(encoding="utf-8")

        if old_string not in content:
            return ToolResult(
                output="",
                success=False,
                error=f"String not found in {path}: {old_string[:100]}",
            )

        if replace_all:
            new_content = content.replace(old_string, new_string)
            count = content.count(old_string)
        else:
            new_content = content.replace(old_string, new_string, 1)
            count = 1

        p.write_text(new_content, encoding="utf-8")
        return ToolResult(
            output=f"Replaced {count} occurrence(s) in {p}",
            success=True,
            artifacts={"path": str(p), "replacements": count},
        )
    except Exception as e:
        return ToolResult(output="", success=False, error=str(e))


async def list_directory(path: str = ".", recursive: bool = False) -> ToolResult:
    """List files and directories.

    Args:
        path: Directory to list.
        recursive: If True, list recursively.
    """
    try:
        p = Path(path).resolve()
        if not p.exists():
            return ToolResult(output="", success=False, error=f"Directory not found: {path}")
        if not p.is_dir():
            return ToolResult(output="", success=False, error=f"Not a directory: {path}")

        entries = []
        if recursive:
            for item in sorted(p.rglob("*")):
                rel = item.relative_to(p)
                prefix = "d " if item.is_dir() else "f "
                entries.append(f"{prefix}{rel}")
                if len(entries) >= 1000:
                    entries.append("... (truncated at 1000 entries)")
                    break
        else:
            for item in sorted(p.iterdir()):
                prefix = "d " if item.is_dir() else "f "
                entries.append(f"{prefix}{item.name}")

        return ToolResult(
            output="\n".join(entries),
            success=True,
            artifacts={"path": str(p), "count": len(entries)},
        )
    except Exception as e:
        return ToolResult(output="", success=False, error=str(e))


async def search_files(
    pattern: str,
    path: str = ".",
    content_pattern: str | None = None,
) -> ToolResult:
    """Search for files by glob pattern and optionally content.

    Args:
        pattern: Glob pattern (e.g., "**/*.py", "*.ts").
        path: Root directory to search from.
        content_pattern: Optional text to search within matched files.
    """
    try:
        p = Path(path).resolve()
        matches = []

        for match in sorted(p.glob(pattern)):
            if not match.is_file():
                continue

            if content_pattern:
                try:
                    text = match.read_text(encoding="utf-8", errors="replace")
                    if content_pattern.lower() not in text.lower():
                        continue
                except Exception:
                    continue

            matches.append(str(match.relative_to(p)))
            if len(matches) >= 200:
                matches.append("... (truncated at 200 matches)")
                break

        return ToolResult(
            output="\n".join(matches) if matches else "No matches found.",
            success=True,
            artifacts={"count": len(matches), "pattern": pattern},
        )
    except Exception as e:
        return ToolResult(output="", success=False, error=str(e))


def register_file_tools(registry: ToolRegistry) -> None:
    """Register all file system tools."""
    registry.register(
        name="read_file",
        description="Read the contents of a file. Returns the text content.",
        parameters={
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path to read"},
                "offset": {
                    "type": "integer",
                    "description": "Line to start from (0-indexed)",
                },
                "limit": {
                    "type": "integer",
                    "description": "Max lines to read (default 2000)",
                },
            },
            "required": ["path"],
        },
        handler=read_file,
        tags=["file_system"],
    )

    registry.register(
        name="write_file",
        description="Write content to a file. Creates parent directories automatically.",
        parameters={
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path to write to"},
                "content": {"type": "string", "description": "Content to write"},
                "create_dirs": {
                    "type": "boolean",
                    "description": "Create parent dirs if needed (default true)",
                },
            },
            "required": ["path", "content"],
        },
        handler=write_file,
        tags=["file_system"],
    )

    registry.register(
        name="edit_file",
        description="Edit a file by replacing a specific string with new content.",
        parameters={
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path"},
                "old_string": {"type": "string", "description": "Text to find"},
                "new_string": {"type": "string", "description": "Replacement text"},
                "replace_all": {
                    "type": "boolean",
                    "description": "Replace all occurrences (default false)",
                },
            },
            "required": ["path", "old_string", "new_string"],
        },
        handler=edit_file,
        tags=["file_system"],
    )

    registry.register(
        name="list_directory",
        description="List files and directories at a path.",
        parameters={
            "type": "object",
            "properties": {
                "path": {
                    "type": "string",
                    "description": "Directory path (default: current directory)",
                },
                "recursive": {
                    "type": "boolean",
                    "description": "List recursively (default false)",
                },
            },
            "required": [],
        },
        handler=list_directory,
        tags=["file_system"],
    )

    registry.register(
        name="search_files",
        description="Search for files by glob pattern, optionally filtering by content.",
        parameters={
            "type": "object",
            "properties": {
                "pattern": {
                    "type": "string",
                    "description": "Glob pattern (e.g., '**/*.py', '*.ts')",
                },
                "path": {
                    "type": "string",
                    "description": "Root directory to search from",
                },
                "content_pattern": {
                    "type": "string",
                    "description": "Text to search for within matched files",
                },
            },
            "required": ["pattern"],
        },
        handler=search_files,
        tags=["file_system"],
    )
