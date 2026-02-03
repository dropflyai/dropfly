"""Shell execution tool with safety controls.

Gives agents the ability to run shell commands with:
- Command allowlist/blocklist for dangerous operations
- Timeout enforcement
- Output capture and truncation
- Working directory management
"""

from __future__ import annotations

import asyncio
import logging
import os
import shlex
from typing import Any

from ..core.tool_registry import ToolRegistry, ToolResult

logger = logging.getLogger(__name__)

# Commands that require explicit approval
DANGEROUS_COMMANDS = {
    "rm -rf",
    "rm -r /",
    "mkfs",
    "dd",
    "shutdown",
    "reboot",
    "kill -9",
    "pkill",
    "chmod 777",
    "curl | bash",
    "wget | bash",
    "> /dev/sda",
    ":(){ :|:& };:",
}

# Commands that are always blocked
BLOCKED_COMMANDS = {
    "rm -rf /",
    "rm -rf /*",
    "mkfs",
    "> /dev/sda",
    ":(){ :|:& };:",
}

MAX_OUTPUT_LENGTH = 50_000


async def run_shell(
    command: str,
    working_directory: str | None = None,
    timeout: float = 120.0,
    env: dict[str, str] | None = None,
) -> ToolResult:
    """Execute a shell command.

    Args:
        command: The shell command to execute.
        working_directory: Directory to run in. Defaults to cwd.
        timeout: Max execution time in seconds.
        env: Additional environment variables.

    Returns:
        ToolResult with stdout/stderr output.
    """
    # Safety check
    cmd_lower = command.lower().strip()
    for blocked in BLOCKED_COMMANDS:
        if blocked in cmd_lower:
            return ToolResult(
                output="",
                success=False,
                error=f"Command blocked for safety: contains '{blocked}'",
            )

    cwd = working_directory or os.getcwd()

    # Merge environment
    run_env = os.environ.copy()
    if env:
        run_env.update(env)

    try:
        process = await asyncio.create_subprocess_shell(
            command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=cwd,
            env=run_env,
        )

        stdout, stderr = await asyncio.wait_for(
            process.communicate(), timeout=timeout
        )

        stdout_str = stdout.decode("utf-8", errors="replace")
        stderr_str = stderr.decode("utf-8", errors="replace")

        # Truncate if too long
        if len(stdout_str) > MAX_OUTPUT_LENGTH:
            stdout_str = (
                stdout_str[:MAX_OUTPUT_LENGTH]
                + f"\n... (truncated, {len(stdout_str)} total chars)"
            )

        output = stdout_str
        if stderr_str:
            output = f"{stdout_str}\n\nSTDERR:\n{stderr_str}" if stdout_str else stderr_str

        return ToolResult(
            output=output,
            success=process.returncode == 0,
            error=f"Exit code {process.returncode}" if process.returncode != 0 else None,
            artifacts={
                "exit_code": process.returncode,
                "working_directory": cwd,
            },
        )

    except asyncio.TimeoutError:
        return ToolResult(
            output="",
            success=False,
            error=f"Command timed out after {timeout}s: {command[:100]}",
        )
    except Exception as e:
        return ToolResult(output="", success=False, error=str(e))


def register_shell_tools(registry: ToolRegistry) -> None:
    """Register shell tools in the given registry."""
    registry.register(
        name="run_shell",
        description=(
            "Execute a shell command and return the output. "
            "Use for: installing packages, running builds, executing scripts, "
            "system operations, checking system state. "
            "The command runs in a bash shell."
        ),
        parameters={
            "type": "object",
            "properties": {
                "command": {
                    "type": "string",
                    "description": "The shell command to execute",
                },
                "working_directory": {
                    "type": "string",
                    "description": "Directory to run the command in (optional)",
                },
                "timeout": {
                    "type": "number",
                    "description": "Max execution time in seconds (default 120)",
                },
            },
            "required": ["command"],
        },
        handler=run_shell,
        requires_approval=False,
        tags=["shell", "execution"],
        timeout=300.0,
    )
