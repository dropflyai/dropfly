"""Docker sandbox for safe code execution.

All untrusted code runs inside an isolated Docker container with:
- Resource limits (CPU, memory, disk)
- Network isolation (optional)
- Filesystem isolation (bind-mount workspace only)
- Automatic cleanup
"""

from __future__ import annotations

import asyncio
import logging
import os
import uuid
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional

logger = logging.getLogger(__name__)

DEFAULT_IMAGE = "dropfly-sandbox:latest"
FALLBACK_IMAGE = "python:3.12-slim"


@dataclass
class SandboxConfig:
    """Configuration for a sandbox container."""

    image: str = DEFAULT_IMAGE
    memory_limit: str = "2g"
    cpu_count: float = 2.0
    disk_limit: str = "10g"
    timeout: float = 300.0  # 5 minutes
    network_enabled: bool = True
    env_vars: dict[str, str] = field(default_factory=dict)
    bind_mounts: dict[str, str] = field(default_factory=dict)  # host_path: container_path


@dataclass
class SandboxResult:
    """Result from sandbox execution."""

    stdout: str
    stderr: str
    exit_code: int
    success: bool
    timed_out: bool = False
    container_id: str = ""


class DockerSandbox:
    """Manages Docker containers for isolated code execution.

    Usage:
        sandbox = DockerSandbox()

        # Run a command
        result = await sandbox.run("python script.py", workspace="/path/to/project")

        # Run with custom config
        config = SandboxConfig(memory_limit="4g", timeout=600)
        result = await sandbox.run("npm run build", workspace="/app", config=config)

        # Full lifecycle
        container_id = await sandbox.create(workspace="/app")
        result = await sandbox.exec(container_id, "npm install")
        result = await sandbox.exec(container_id, "npm test")
        await sandbox.destroy(container_id)
    """

    def __init__(self, default_config: SandboxConfig | None = None):
        self.default_config = default_config or SandboxConfig()
        self._active_containers: dict[str, str] = {}  # name -> container_id
        self._docker_available: bool | None = None

    async def is_available(self) -> bool:
        """Check if Docker is available."""
        if self._docker_available is not None:
            return self._docker_available

        try:
            proc = await asyncio.create_subprocess_exec(
                "docker", "info",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            await proc.communicate()
            self._docker_available = proc.returncode == 0
        except FileNotFoundError:
            self._docker_available = False

        return self._docker_available

    async def run(
        self,
        command: str,
        workspace: str | None = None,
        config: SandboxConfig | None = None,
    ) -> SandboxResult:
        """Run a command in an ephemeral sandbox container.

        Creates, executes, and destroys in one call.

        Args:
            command: Shell command to run.
            workspace: Host directory to mount as /workspace.
            config: Sandbox configuration.

        Returns:
            SandboxResult with output.
        """
        if not await self.is_available():
            return SandboxResult(
                stdout="",
                stderr="Docker is not available. Install Docker to use sandboxed execution.",
                exit_code=1,
                success=False,
            )

        cfg = config or self.default_config
        container_name = f"dropfly-sandbox-{uuid.uuid4().hex[:8]}"

        # Build docker run command
        docker_cmd = ["docker", "run", "--rm", "--name", container_name]

        # Resource limits
        docker_cmd.extend(["--memory", cfg.memory_limit])
        docker_cmd.extend(["--cpus", str(cfg.cpu_count)])

        # Network
        if not cfg.network_enabled:
            docker_cmd.extend(["--network", "none"])

        # Environment variables
        for key, value in cfg.env_vars.items():
            docker_cmd.extend(["-e", f"{key}={value}"])

        # Workspace mount
        if workspace:
            abs_workspace = str(Path(workspace).resolve())
            docker_cmd.extend(["-v", f"{abs_workspace}:/workspace"])
            docker_cmd.extend(["-w", "/workspace"])

        # Additional bind mounts
        for host_path, container_path in cfg.bind_mounts.items():
            docker_cmd.extend(["-v", f"{host_path}:{container_path}"])

        # Image and command
        docker_cmd.append(cfg.image)
        docker_cmd.extend(["sh", "-c", command])

        try:
            proc = await asyncio.create_subprocess_exec(
                *docker_cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            try:
                stdout, stderr = await asyncio.wait_for(
                    proc.communicate(), timeout=cfg.timeout
                )
            except asyncio.TimeoutError:
                # Kill the container
                await self._kill_container(container_name)
                return SandboxResult(
                    stdout="",
                    stderr=f"Sandbox timed out after {cfg.timeout}s",
                    exit_code=-1,
                    success=False,
                    timed_out=True,
                    container_id=container_name,
                )

            return SandboxResult(
                stdout=stdout.decode("utf-8", errors="replace"),
                stderr=stderr.decode("utf-8", errors="replace"),
                exit_code=proc.returncode or 0,
                success=proc.returncode == 0,
                container_id=container_name,
            )

        except Exception as e:
            logger.error(f"Sandbox execution failed: {e}")
            return SandboxResult(
                stdout="",
                stderr=str(e),
                exit_code=-1,
                success=False,
            )

    async def create(
        self,
        workspace: str | None = None,
        config: SandboxConfig | None = None,
        name: str | None = None,
    ) -> str:
        """Create a persistent sandbox container.

        Returns the container name for use with exec() and destroy().
        """
        if not await self.is_available():
            raise RuntimeError("Docker not available")

        cfg = config or self.default_config
        container_name = name or f"dropfly-sandbox-{uuid.uuid4().hex[:8]}"

        docker_cmd = [
            "docker", "run", "-d", "--name", container_name,
            "--memory", cfg.memory_limit,
            "--cpus", str(cfg.cpu_count),
        ]

        if not cfg.network_enabled:
            docker_cmd.extend(["--network", "none"])

        for key, value in cfg.env_vars.items():
            docker_cmd.extend(["-e", f"{key}={value}"])

        if workspace:
            abs_workspace = str(Path(workspace).resolve())
            docker_cmd.extend(["-v", f"{abs_workspace}:/workspace", "-w", "/workspace"])

        for host_path, container_path in cfg.bind_mounts.items():
            docker_cmd.extend(["-v", f"{host_path}:{container_path}"])

        # Keep container running with tail
        docker_cmd.extend([cfg.image, "tail", "-f", "/dev/null"])

        proc = await asyncio.create_subprocess_exec(
            *docker_cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc.communicate()

        if proc.returncode != 0:
            raise RuntimeError(f"Failed to create sandbox: {stderr.decode()}")

        container_id = stdout.decode().strip()
        self._active_containers[container_name] = container_id
        logger.info(f"Created sandbox: {container_name}")
        return container_name

    async def exec(
        self,
        container_name: str,
        command: str,
        timeout: float = 300.0,
    ) -> SandboxResult:
        """Execute a command in an existing sandbox container."""
        try:
            proc = await asyncio.create_subprocess_exec(
                "docker", "exec", container_name, "sh", "-c", command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            try:
                stdout, stderr = await asyncio.wait_for(
                    proc.communicate(), timeout=timeout
                )
            except asyncio.TimeoutError:
                return SandboxResult(
                    stdout="",
                    stderr=f"Command timed out after {timeout}s",
                    exit_code=-1,
                    success=False,
                    timed_out=True,
                    container_id=container_name,
                )

            return SandboxResult(
                stdout=stdout.decode("utf-8", errors="replace"),
                stderr=stderr.decode("utf-8", errors="replace"),
                exit_code=proc.returncode or 0,
                success=proc.returncode == 0,
                container_id=container_name,
            )

        except Exception as e:
            return SandboxResult(
                stdout="", stderr=str(e), exit_code=-1, success=False,
            )

    async def destroy(self, container_name: str) -> bool:
        """Stop and remove a sandbox container."""
        try:
            proc = await asyncio.create_subprocess_exec(
                "docker", "rm", "-f", container_name,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            await proc.communicate()
            self._active_containers.pop(container_name, None)
            logger.info(f"Destroyed sandbox: {container_name}")
            return proc.returncode == 0
        except Exception as e:
            logger.error(f"Failed to destroy sandbox {container_name}: {e}")
            return False

    async def cleanup_all(self) -> int:
        """Destroy all active sandbox containers. Returns count destroyed."""
        count = 0
        for name in list(self._active_containers.keys()):
            if await self.destroy(name):
                count += 1
        return count

    async def _kill_container(self, name: str) -> None:
        """Force kill a container."""
        try:
            proc = await asyncio.create_subprocess_exec(
                "docker", "kill", name,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            await proc.communicate()
        except Exception:
            pass

    async def build_sandbox_image(self, dockerfile_path: str | None = None) -> bool:
        """Build the sandbox Docker image."""
        if not dockerfile_path:
            dockerfile_path = str(
                Path(__file__).parent.parent.parent / "infrastructure" / "docker" / "Dockerfile.sandbox"
            )

        if not Path(dockerfile_path).exists():
            logger.warning(f"Dockerfile not found: {dockerfile_path}")
            return False

        proc = await asyncio.create_subprocess_exec(
            "docker", "build", "-t", DEFAULT_IMAGE,
                "-f", dockerfile_path, ".",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        _, stderr = await proc.communicate()
        if proc.returncode != 0:
            logger.error(f"Failed to build sandbox image: {stderr.decode()}")
            return False

        logger.info("Sandbox image built successfully")
        return True

    @property
    def active_count(self) -> int:
        return len(self._active_containers)
