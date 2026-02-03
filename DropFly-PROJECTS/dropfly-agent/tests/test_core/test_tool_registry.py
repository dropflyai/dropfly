"""Tests for the universal tool registry."""

import asyncio
import pytest
from src.core.tool_registry import ToolRegistry, ToolResult


@pytest.fixture
def registry():
    return ToolRegistry()


class TestToolRegistry:
    def test_register_sync_tool(self, registry):
        def my_tool(x: int) -> str:
            return f"result: {x}"

        registry.register(
            name="my_tool",
            description="Test tool",
            parameters={"type": "object", "properties": {"x": {"type": "integer"}}},
            handler=my_tool,
        )

        assert "my_tool" in registry
        assert len(registry) == 1

    def test_register_async_tool(self, registry):
        async def my_async_tool(x: int) -> str:
            return f"async result: {x}"

        registry.register(
            name="my_async_tool",
            description="Async test tool",
            parameters={"type": "object", "properties": {"x": {"type": "integer"}}},
            handler=my_async_tool,
        )

        tool = registry.get("my_async_tool")
        assert tool is not None
        assert tool.is_async

    @pytest.mark.asyncio
    async def test_execute_sync_tool(self, registry):
        def add(a: int, b: int) -> str:
            return str(a + b)

        registry.register(
            name="add",
            description="Add two numbers",
            parameters={
                "type": "object",
                "properties": {
                    "a": {"type": "integer"},
                    "b": {"type": "integer"},
                },
            },
            handler=add,
        )

        result = await registry.execute("add", {"a": 2, "b": 3})
        assert result.success
        assert result.output == "5"

    @pytest.mark.asyncio
    async def test_execute_async_tool(self, registry):
        async def greet(name: str) -> str:
            return f"Hello, {name}!"

        registry.register(
            name="greet",
            description="Greet someone",
            parameters={"type": "object", "properties": {"name": {"type": "string"}}},
            handler=greet,
        )

        result = await registry.execute("greet", {"name": "DropFly"})
        assert result.success
        assert result.output == "Hello, DropFly!"

    @pytest.mark.asyncio
    async def test_execute_unknown_tool(self, registry):
        result = await registry.execute("nonexistent", {})
        assert not result.success
        assert "Unknown tool" in result.error

    @pytest.mark.asyncio
    async def test_tool_error_handling(self, registry):
        def broken_tool() -> str:
            raise ValueError("something went wrong")

        registry.register(
            name="broken",
            description="Breaks",
            parameters={"type": "object", "properties": {}},
            handler=broken_tool,
        )

        result = await registry.execute("broken", {})
        assert not result.success
        assert "something went wrong" in result.error

    def test_get_definitions(self, registry):
        registry.register(
            name="tool_a",
            description="Tool A",
            parameters={"type": "object"},
            handler=lambda: "a",
            tags=["group1"],
        )
        registry.register(
            name="tool_b",
            description="Tool B",
            parameters={"type": "object"},
            handler=lambda: "b",
            tags=["group2"],
        )

        all_defs = registry.get_definitions()
        assert len(all_defs) == 2

        group1_defs = registry.get_definitions(tags=["group1"])
        assert len(group1_defs) == 1
        assert group1_defs[0].name == "tool_a"

    def test_decorator_registration(self, registry):
        @registry.tool(
            name="decorated",
            description="Decorated tool",
            parameters={"type": "object", "properties": {}},
        )
        def my_decorated_tool():
            return "decorated!"

        assert "decorated" in registry

    def test_merge_registries(self):
        r1 = ToolRegistry()
        r2 = ToolRegistry()

        r1.register("tool1", "T1", {"type": "object"}, lambda: "1")
        r2.register("tool2", "T2", {"type": "object"}, lambda: "2")

        r1.merge(r2)
        assert "tool1" in r1
        assert "tool2" in r1
