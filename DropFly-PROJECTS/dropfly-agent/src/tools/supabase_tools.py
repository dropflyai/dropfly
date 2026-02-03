"""Supabase database tools for agents.

Direct database operations: query, insert, update, delete.
Also handles project creation and migration management.
"""

from __future__ import annotations

import logging
import os
from typing import Any

from ..core.tool_registry import ToolRegistry, ToolResult

logger = logging.getLogger(__name__)


def _get_supabase() -> Any:
    """Get Supabase client."""
    from supabase import create_client

    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_SERVICE_KEY", "")
    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY required")
    return create_client(url, key)


async def db_query(table: str, select: str = "*", filters: dict[str, Any] | None = None, limit: int = 50) -> ToolResult:
    """Query a Supabase table.

    Args:
        table: Table name.
        select: Columns to select (default: all).
        filters: Key-value filters (equality checks).
        limit: Max rows to return.
    """
    try:
        client = _get_supabase()
        query = client.table(table).select(select)

        if filters:
            for key, value in filters.items():
                query = query.eq(key, value)

        query = query.limit(limit)
        result = query.execute()

        import json
        output = json.dumps(result.data, indent=2, default=str)
        if len(output) > 30_000:
            output = output[:30_000] + "\n... (truncated)"

        return ToolResult(
            output=output,
            success=True,
            artifacts={"table": table, "row_count": len(result.data)},
        )
    except Exception as e:
        return ToolResult(output="", success=False, error=f"Query failed: {e}")


async def db_insert(table: str, data: dict[str, Any]) -> ToolResult:
    """Insert a row into a Supabase table.

    Args:
        table: Table name.
        data: Row data as key-value pairs.
    """
    try:
        client = _get_supabase()
        result = client.table(table).insert(data).execute()

        import json
        return ToolResult(
            output=f"Inserted into {table}: {json.dumps(result.data, default=str)[:500]}",
            success=True,
            artifacts={"table": table},
        )
    except Exception as e:
        return ToolResult(output="", success=False, error=f"Insert failed: {e}")


async def db_update(table: str, data: dict[str, Any], filters: dict[str, Any]) -> ToolResult:
    """Update rows in a Supabase table.

    Args:
        table: Table name.
        data: Fields to update.
        filters: Equality filters to match rows.
    """
    try:
        client = _get_supabase()
        query = client.table(table).update(data)

        for key, value in filters.items():
            query = query.eq(key, value)

        result = query.execute()

        return ToolResult(
            output=f"Updated {len(result.data)} row(s) in {table}",
            success=True,
            artifacts={"table": table, "updated_count": len(result.data)},
        )
    except Exception as e:
        return ToolResult(output="", success=False, error=f"Update failed: {e}")


async def db_delete(table: str, filters: dict[str, Any]) -> ToolResult:
    """Delete rows from a Supabase table.

    Args:
        table: Table name.
        filters: Equality filters to match rows to delete.
    """
    try:
        client = _get_supabase()
        query = client.table(table).delete()

        for key, value in filters.items():
            query = query.eq(key, value)

        result = query.execute()

        return ToolResult(
            output=f"Deleted {len(result.data)} row(s) from {table}",
            success=True,
            artifacts={"table": table, "deleted_count": len(result.data)},
        )
    except Exception as e:
        return ToolResult(output="", success=False, error=f"Delete failed: {e}")


async def db_rpc(function_name: str, params: dict[str, Any] | None = None) -> ToolResult:
    """Call a Supabase RPC function (stored procedure).

    Args:
        function_name: Name of the database function.
        params: Function parameters.
    """
    try:
        client = _get_supabase()
        result = client.rpc(function_name, params or {}).execute()

        import json
        return ToolResult(
            output=json.dumps(result.data, indent=2, default=str)[:10_000],
            success=True,
        )
    except Exception as e:
        return ToolResult(output="", success=False, error=f"RPC failed: {e}")


def register_supabase_tools(registry: ToolRegistry) -> None:
    """Register Supabase database tools."""
    registry.register(
        name="db_query",
        description="Query a Supabase database table. Returns matching rows as JSON.",
        parameters={
            "type": "object",
            "properties": {
                "table": {"type": "string", "description": "Table name"},
                "select": {"type": "string", "description": "Columns to select (default: *)"},
                "filters": {"type": "object", "description": "Equality filters as key:value"},
                "limit": {"type": "integer", "description": "Max rows (default 50)"},
            },
            "required": ["table"],
        },
        handler=db_query, tags=["database", "supabase"],
    )

    registry.register(
        name="db_insert",
        description="Insert a row into a Supabase table.",
        parameters={
            "type": "object",
            "properties": {
                "table": {"type": "string", "description": "Table name"},
                "data": {"type": "object", "description": "Row data as key:value"},
            },
            "required": ["table", "data"],
        },
        handler=db_insert, tags=["database", "supabase"],
    )

    registry.register(
        name="db_update",
        description="Update rows in a Supabase table matching filters.",
        parameters={
            "type": "object",
            "properties": {
                "table": {"type": "string", "description": "Table name"},
                "data": {"type": "object", "description": "Fields to update"},
                "filters": {"type": "object", "description": "Equality filters to match rows"},
            },
            "required": ["table", "data", "filters"],
        },
        handler=db_update, tags=["database", "supabase"],
    )

    registry.register(
        name="db_delete",
        description="Delete rows from a Supabase table matching filters.",
        parameters={
            "type": "object",
            "properties": {
                "table": {"type": "string", "description": "Table name"},
                "filters": {"type": "object", "description": "Equality filters"},
            },
            "required": ["table", "filters"],
        },
        handler=db_delete,
        requires_approval=True,
        tags=["database", "supabase"],
    )
