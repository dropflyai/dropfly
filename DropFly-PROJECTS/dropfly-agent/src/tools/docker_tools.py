"""Docker container management tools for agents.

Build images, run containers, manage volumes — used by Deploy Agent
and for sandboxed execution.
"""

from __future__ import annotations

import logging
from typing import Any

from ..core.tool_registry import ToolRegistry, ToolResult
from ..tools.shell import run_shell

logger = logging.getLogger(__name__)


async def docker_build(
    path: str = ".",
    tag: str = "dropfly-build:latest",
    dockerfile: str | None = None,
) -> ToolResult:
    """Build a Docker image.

    Args:
        path: Build context directory.
        tag: Image tag.
        dockerfile: Path to Dockerfile (relative to build context).
    """
    cmd = f"docker build -t {tag}"
    if dockerfile:
        cmd += f" -f {dockerfile}"
    cmd += f" {path}"
    return await run_shell(cmd, timeout=300.0)


async def docker_run(
    image: str,
    command: str = "",
    name: str | None = None,
    ports: str | None = None,
    volumes: str | None = None,
    env_vars: dict[str, str] | None = None,
    detach: bool = False,
    remove: bool = True,
    network: str | None = None,
) -> ToolResult:
    """Run a Docker container.

    Args:
        image: Docker image to run.
        command: Command to execute in the container.
        name: Container name.
        ports: Port mapping (e.g., "3000:3000").
        volumes: Volume mount (e.g., "/host:/container").
        env_vars: Environment variables.
        detach: Run in background.
        remove: Auto-remove when stopped.
        network: Docker network to connect to.
    """
    cmd = "docker run"
    if detach:
        cmd += " -d"
    if remove and not detach:
        cmd += " --rm"
    if name:
        cmd += f" --name {name}"
    if ports:
        cmd += f" -p {ports}"
    if volumes:
        cmd += f" -v {volumes}"
    if network:
        cmd += f" --network {network}"
    if env_vars:
        for k, v in env_vars.items():
            cmd += f" -e {k}={v}"
    cmd += f" {image}"
    if command:
        cmd += f" {command}"

    return await run_shell(cmd, timeout=120.0)


async def docker_ps(all_containers: bool = False) -> ToolResult:
    """List running Docker containers."""
    flag = "-a" if all_containers else ""
    return await run_shell(f"docker ps {flag} --format 'table {{{{.Names}}}}\\t{{{{.Image}}}}\\t{{{{.Status}}}}\\t{{{{.Ports}}}}'")


async def docker_logs(container: str, tail: int = 100) -> ToolResult:
    """Get container logs.

    Args:
        container: Container name or ID.
        tail: Number of lines to show.
    """
    return await run_shell(f"docker logs --tail {tail} {container}")


async def docker_stop(container: str) -> ToolResult:
    """Stop a running container."""
    return await run_shell(f"docker stop {container}")


async def docker_rm(container: str, force: bool = False) -> ToolResult:
    """Remove a container."""
    flag = "-f" if force else ""
    return await run_shell(f"docker rm {flag} {container}")


async def docker_compose_up(
    path: str = ".",
    detach: bool = True,
    build: bool = False,
) -> ToolResult:
    """Run docker compose up.

    Args:
        path: Directory containing docker-compose.yml.
        detach: Run in background.
        build: Build images before starting.
    """
    cmd = "docker compose up"
    if detach:
        cmd += " -d"
    if build:
        cmd += " --build"
    return await run_shell(cmd, working_directory=path, timeout=300.0)


async def docker_compose_down(path: str = ".", remove_volumes: bool = False) -> ToolResult:
    """Run docker compose down."""
    cmd = "docker compose down"
    if remove_volumes:
        cmd += " -v"
    return await run_shell(cmd, working_directory=path)


def register_docker_tools(registry: ToolRegistry) -> None:
    """Register Docker management tools."""
    registry.register(
        name="docker_build",
        description="Build a Docker image from a Dockerfile.",
        parameters={
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Build context path (default '.')"},
                "tag": {"type": "string", "description": "Image tag"},
                "dockerfile": {"type": "string", "description": "Dockerfile path"},
            },
        },
        handler=docker_build, tags=["docker"], timeout=300.0,
    )

    registry.register(
        name="docker_run",
        description="Run a Docker container.",
        parameters={
            "type": "object",
            "properties": {
                "image": {"type": "string", "description": "Docker image"},
                "command": {"type": "string", "description": "Command to run"},
                "name": {"type": "string", "description": "Container name"},
                "ports": {"type": "string", "description": "Port mapping (e.g., '3000:3000')"},
                "volumes": {"type": "string", "description": "Volume mount"},
                "detach": {"type": "boolean", "description": "Run in background"},
            },
            "required": ["image"],
        },
        handler=docker_run, tags=["docker"],
    )

    registry.register(
        name="docker_ps",
        description="List Docker containers.",
        parameters={
            "type": "object",
            "properties": {
                "all_containers": {"type": "boolean", "description": "Show all (including stopped)"},
            },
        },
        handler=docker_ps, tags=["docker"],
    )

    registry.register(
        name="docker_logs",
        description="Get logs from a Docker container.",
        parameters={
            "type": "object",
            "properties": {
                "container": {"type": "string", "description": "Container name or ID"},
                "tail": {"type": "integer", "description": "Number of lines"},
            },
            "required": ["container"],
        },
        handler=docker_logs, tags=["docker"],
    )

    registry.register(
        name="docker_stop",
        description="Stop a running Docker container.",
        parameters={
            "type": "object",
            "properties": {
                "container": {"type": "string", "description": "Container name or ID"},
            },
            "required": ["container"],
        },
        handler=docker_stop, tags=["docker"],
    )

    registry.register(
        name="docker_compose_up",
        description="Start services with docker compose up.",
        parameters={
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Directory with docker-compose.yml"},
                "detach": {"type": "boolean", "description": "Run in background (default true)"},
                "build": {"type": "boolean", "description": "Build images first"},
            },
        },
        handler=docker_compose_up, tags=["docker"], timeout=300.0,
    )

    registry.register(
        name="docker_compose_down",
        description="Stop and remove docker compose services.",
        parameters={
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Directory with docker-compose.yml"},
                "remove_volumes": {"type": "boolean", "description": "Remove volumes too"},
            },
        },
        handler=docker_compose_down, tags=["docker"],
    )
