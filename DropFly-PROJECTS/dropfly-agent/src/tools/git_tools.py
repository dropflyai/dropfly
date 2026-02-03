"""Git operations for agents.

Clone, commit, branch, push, create PRs — all the git workflows
an autonomous builder needs.
"""

from __future__ import annotations

import logging
from typing import Any

from ..core.tool_registry import ToolRegistry, ToolResult
from .shell import run_shell

logger = logging.getLogger(__name__)


async def git_clone(url: str, directory: str | None = None, branch: str | None = None) -> ToolResult:
    """Clone a git repository.

    Args:
        url: Repository URL.
        directory: Target directory. Defaults to repo name.
        branch: Branch to clone. Defaults to default branch.
    """
    cmd = f"git clone"
    if branch:
        cmd += f" --branch {branch}"
    cmd += f" {url}"
    if directory:
        cmd += f" {directory}"
    return await run_shell(cmd)


async def git_status(working_directory: str = ".") -> ToolResult:
    """Get git status of a repository."""
    return await run_shell("git status", working_directory=working_directory)


async def git_diff(working_directory: str = ".", staged: bool = False) -> ToolResult:
    """Get git diff.

    Args:
        working_directory: Repo directory.
        staged: If True, show staged changes only.
    """
    cmd = "git diff --staged" if staged else "git diff"
    return await run_shell(cmd, working_directory=working_directory)


async def git_add(files: str = ".", working_directory: str = ".") -> ToolResult:
    """Stage files for commit.

    Args:
        files: Files to stage. Use "." for all.
        working_directory: Repo directory.
    """
    return await run_shell(f"git add {files}", working_directory=working_directory)


async def git_commit(message: str, working_directory: str = ".") -> ToolResult:
    """Create a git commit.

    Args:
        message: Commit message.
        working_directory: Repo directory.
    """
    # Escape the message for shell safety
    safe_msg = message.replace('"', '\\"')
    return await run_shell(f'git commit -m "{safe_msg}"', working_directory=working_directory)


async def git_push(
    remote: str = "origin",
    branch: str | None = None,
    working_directory: str = ".",
    set_upstream: bool = False,
) -> ToolResult:
    """Push commits to remote.

    Args:
        remote: Remote name (default: origin).
        branch: Branch to push. Defaults to current branch.
        working_directory: Repo directory.
        set_upstream: Set upstream tracking.
    """
    cmd = f"git push {remote}"
    if branch:
        cmd += f" {branch}"
    if set_upstream:
        cmd = f"git push -u {remote}"
        if branch:
            cmd += f" {branch}"
    return await run_shell(cmd, working_directory=working_directory)


async def git_checkout(
    branch: str,
    create: bool = False,
    working_directory: str = ".",
) -> ToolResult:
    """Checkout a branch.

    Args:
        branch: Branch name.
        create: Create the branch if it doesn't exist.
        working_directory: Repo directory.
    """
    flag = "-b" if create else ""
    return await run_shell(f"git checkout {flag} {branch}".strip(), working_directory=working_directory)


async def git_log(
    limit: int = 10,
    oneline: bool = True,
    working_directory: str = ".",
) -> ToolResult:
    """Get git log.

    Args:
        limit: Number of commits to show.
        oneline: One-line format.
        working_directory: Repo directory.
    """
    fmt = "--oneline" if oneline else ""
    return await run_shell(
        f"git log {fmt} -n {limit}".strip(),
        working_directory=working_directory,
    )


async def git_init(working_directory: str = ".") -> ToolResult:
    """Initialize a new git repository."""
    return await run_shell("git init", working_directory=working_directory)


async def git_create_pr(
    title: str,
    body: str,
    base: str = "main",
    working_directory: str = ".",
) -> ToolResult:
    """Create a GitHub pull request using gh CLI.

    Args:
        title: PR title.
        body: PR description.
        base: Base branch.
        working_directory: Repo directory.
    """
    safe_title = title.replace('"', '\\"')
    safe_body = body.replace('"', '\\"')
    return await run_shell(
        f'gh pr create --title "{safe_title}" --body "{safe_body}" --base {base}',
        working_directory=working_directory,
    )


def register_git_tools(registry: ToolRegistry) -> None:
    """Register all git tools."""
    registry.register(
        name="git_clone",
        description="Clone a git repository to a local directory.",
        parameters={
            "type": "object",
            "properties": {
                "url": {"type": "string", "description": "Repository URL"},
                "directory": {"type": "string", "description": "Target directory"},
                "branch": {"type": "string", "description": "Branch to clone"},
            },
            "required": ["url"],
        },
        handler=git_clone,
        tags=["git"],
    )

    registry.register(
        name="git_status",
        description="Get the git status of a repository (staged, unstaged, untracked files).",
        parameters={
            "type": "object",
            "properties": {
                "working_directory": {"type": "string", "description": "Repo directory"},
            },
            "required": [],
        },
        handler=git_status,
        tags=["git"],
    )

    registry.register(
        name="git_diff",
        description="Show git diff (changes in the working tree).",
        parameters={
            "type": "object",
            "properties": {
                "working_directory": {"type": "string", "description": "Repo directory"},
                "staged": {"type": "boolean", "description": "Show staged changes only"},
            },
            "required": [],
        },
        handler=git_diff,
        tags=["git"],
    )

    registry.register(
        name="git_add",
        description="Stage files for the next commit.",
        parameters={
            "type": "object",
            "properties": {
                "files": {
                    "type": "string",
                    "description": "Files to stage (default: '.' for all)",
                },
                "working_directory": {"type": "string", "description": "Repo directory"},
            },
            "required": [],
        },
        handler=git_add,
        tags=["git"],
    )

    registry.register(
        name="git_commit",
        description="Create a git commit with a message.",
        parameters={
            "type": "object",
            "properties": {
                "message": {"type": "string", "description": "Commit message"},
                "working_directory": {"type": "string", "description": "Repo directory"},
            },
            "required": ["message"],
        },
        handler=git_commit,
        tags=["git"],
    )

    registry.register(
        name="git_push",
        description="Push commits to a remote repository.",
        parameters={
            "type": "object",
            "properties": {
                "remote": {"type": "string", "description": "Remote name (default: origin)"},
                "branch": {"type": "string", "description": "Branch to push"},
                "working_directory": {"type": "string", "description": "Repo directory"},
                "set_upstream": {"type": "boolean", "description": "Set upstream tracking"},
            },
            "required": [],
        },
        handler=git_push,
        tags=["git"],
    )

    registry.register(
        name="git_checkout",
        description="Checkout a git branch. Use create=true to create a new branch.",
        parameters={
            "type": "object",
            "properties": {
                "branch": {"type": "string", "description": "Branch name"},
                "create": {"type": "boolean", "description": "Create new branch"},
                "working_directory": {"type": "string", "description": "Repo directory"},
            },
            "required": ["branch"],
        },
        handler=git_checkout,
        tags=["git"],
    )

    registry.register(
        name="git_log",
        description="Show git commit history.",
        parameters={
            "type": "object",
            "properties": {
                "limit": {"type": "integer", "description": "Number of commits (default 10)"},
                "oneline": {"type": "boolean", "description": "One-line format (default true)"},
                "working_directory": {"type": "string", "description": "Repo directory"},
            },
            "required": [],
        },
        handler=git_log,
        tags=["git"],
    )

    registry.register(
        name="git_init",
        description="Initialize a new git repository.",
        parameters={
            "type": "object",
            "properties": {
                "working_directory": {"type": "string", "description": "Directory to init in"},
            },
            "required": [],
        },
        handler=git_init,
        tags=["git"],
    )

    registry.register(
        name="git_create_pr",
        description="Create a GitHub pull request (requires gh CLI).",
        parameters={
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "PR title"},
                "body": {"type": "string", "description": "PR description body"},
                "base": {"type": "string", "description": "Base branch (default: main)"},
                "working_directory": {"type": "string", "description": "Repo directory"},
            },
            "required": ["title", "body"],
        },
        handler=git_create_pr,
        tags=["git"],
    )
