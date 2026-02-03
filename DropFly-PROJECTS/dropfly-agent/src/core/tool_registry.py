"""Universal tool registry — any tool, any SDK, any agent.

Tools are simple: a name, a description, a JSON schema for inputs, and an async handler.
Register tools once, give them to any agent regardless of which LLM provider it uses.
"""

from __future__ import annotations

import asyncio
import inspect
import logging
from dataclasses import dataclass, field
from typing import Any, Callable, Awaitable, Optional

from .providers import ToolDefinition

logger = logging.getLogger(__name__)


@dataclass
class ToolResult:
    """Result from executing a tool."""

    output: str
    success: bool = True
    error: Optional[str] = None
    artifacts: dict[str, Any] = field(default_factory=dict)


@dataclass
class RegisteredTool:
    """A tool registered in the system."""

    name: str
    description: str
    parameters: dict[str, Any]  # JSON Schema
    handler: Callable[..., Any]
    is_async: bool = False
    requires_approval: bool = False  # For dangerous operations
    tags: list[str] = field(default_factory=list)  # For categorization
    timeout: float = 120.0  # Seconds before timeout

    def to_definition(self) -> ToolDefinition:
        """Convert to universal ToolDefinition for providers."""
        return ToolDefinition(
            name=self.name,
            description=self.description,
            parameters=self.parameters,
        )


class ToolRegistry:
    """Universal tool registry. Register any callable as a tool.

    Usage:
        registry = ToolRegistry()

        # Register a simple function
        @registry.tool(
            name="read_file",
            description="Read a file from disk",
            parameters={...json schema...}
        )
        async def read_file(path: str) -> str:
            return Path(path).read_text()

        # Or register manually
        registry.register(
            name="run_shell",
            description="Execute a shell command",
            parameters={...},
            handler=my_shell_function,
            requires_approval=True,
        )

        # Execute
        result = await registry.execute("read_file", {"path": "/tmp/foo.txt"})

        # Get definitions for an LLM
        tool_defs = registry.get_definitions(tags=["file_system"])
    """

    def __init__(self) -> None:
        self._tools: dict[str, RegisteredTool] = {}
        self._approval_callback: Optional[Callable[[str, dict], Awaitable[bool]]] = None

    def register(
        self,
        name: str,
        description: str,
        parameters: dict[str, Any],
        handler: Callable[..., Any],
        requires_approval: bool = False,
        tags: list[str] | None = None,
        timeout: float = 120.0,
    ) -> RegisteredTool:
        """Register a tool.

        Args:
            name: Unique tool name.
            description: What the tool does (shown to the LLM).
            parameters: JSON Schema for the tool's input.
            handler: Function to call. Can be sync or async.
            requires_approval: If True, asks for approval before execution.
            tags: Tags for filtering (e.g., ["file_system", "dangerous"]).
            timeout: Max execution time in seconds.

        Returns:
            The registered tool.
        """
        is_async = inspect.iscoroutinefunction(handler)
        tool = RegisteredTool(
            name=name,
            description=description,
            parameters=parameters,
            handler=handler,
            is_async=is_async,
            requires_approval=requires_approval,
            tags=tags or [],
            timeout=timeout,
        )
        self._tools[name] = tool
        logger.debug(f"Registered tool: {name} (async={is_async})")
        return tool

    def tool(
        self,
        name: str,
        description: str,
        parameters: dict[str, Any],
        requires_approval: bool = False,
        tags: list[str] | None = None,
        timeout: float = 120.0,
    ) -> Callable:
        """Decorator to register a function as a tool.

        @registry.tool(
            name="my_tool",
            description="Does something",
            parameters={"type": "object", "properties": {...}}
        )
        async def my_tool(arg1: str) -> str:
            ...
        """

        def decorator(fn: Callable) -> Callable:
            self.register(
                name=name,
                description=description,
                parameters=parameters,
                handler=fn,
                requires_approval=requires_approval,
                tags=tags,
                timeout=timeout,
            )
            return fn

        return decorator

    def set_approval_callback(
        self, callback: Callable[[str, dict], Awaitable[bool]]
    ) -> None:
        """Set a callback for tools that require approval.

        The callback receives (tool_name, arguments) and returns True/False.
        """
        self._approval_callback = callback

    async def execute(self, name: str, arguments: dict[str, Any]) -> ToolResult:
        """Execute a registered tool.

        Args:
            name: Tool name.
            arguments: Tool input arguments.

        Returns:
            ToolResult with output or error.
        """
        if name not in self._tools:
            return ToolResult(
                output="",
                success=False,
                error=f"Unknown tool: {name}. Available: {list(self._tools.keys())}",
            )

        tool = self._tools[name]

        # Check approval
        if tool.requires_approval and self._approval_callback:
            approved = await self._approval_callback(name, arguments)
            if not approved:
                return ToolResult(
                    output="",
                    success=False,
                    error=f"Tool '{name}' execution was not approved",
                )

        try:
            if tool.is_async:
                result = await asyncio.wait_for(
                    tool.handler(**arguments), timeout=tool.timeout
                )
            else:
                result = await asyncio.wait_for(
                    asyncio.get_event_loop().run_in_executor(
                        None, lambda: tool.handler(**arguments)
                    ),
                    timeout=tool.timeout,
                )

            # Normalize result
            if isinstance(result, ToolResult):
                return result
            if isinstance(result, dict):
                return ToolResult(
                    output=str(result.get("output", result)),
                    success=result.get("success", True),
                    artifacts=result.get("artifacts", {}),
                )
            return ToolResult(output=str(result), success=True)

        except asyncio.TimeoutError:
            return ToolResult(
                output="",
                success=False,
                error=f"Tool '{name}' timed out after {tool.timeout}s",
            )
        except Exception as e:
            logger.error(f"Tool '{name}' failed: {e}", exc_info=True)
            return ToolResult(output="", success=False, error=str(e))

    def get(self, name: str) -> RegisteredTool | None:
        """Get a registered tool by name."""
        return self._tools.get(name)

    def get_definitions(
        self,
        names: list[str] | None = None,
        tags: list[str] | None = None,
    ) -> list[ToolDefinition]:
        """Get ToolDefinitions for the LLM.

        Args:
            names: Specific tool names to include. None = all.
            tags: Filter by tags. None = all.

        Returns:
            List of ToolDefinition objects for the provider.
        """
        tools = self._tools.values()

        if names:
            tools = [t for t in tools if t.name in names]

        if tags:
            tools = [t for t in tools if any(tag in t.tags for tag in tags)]

        return [t.to_definition() for t in tools]

    @property
    def available(self) -> list[str]:
        return list(self._tools.keys())

    def merge(self, other: ToolRegistry) -> None:
        """Merge another registry's tools into this one."""
        for name, tool in other._tools.items():
            if name not in self._tools:
                self._tools[name] = tool

    def __contains__(self, name: str) -> bool:
        return name in self._tools

    def __len__(self) -> int:
        return len(self._tools)
