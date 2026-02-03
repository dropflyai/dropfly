"""Playwright browser automation tools.

Full browser control: navigate, click, fill forms, extract content,
screenshot, evaluate JavaScript. Used by Research Agent and Engineering Agent.
"""

from __future__ import annotations

import logging
from typing import Any

from ..core.tool_registry import ToolRegistry, ToolResult
from ..execution.computer_control import ComputerControl

logger = logging.getLogger(__name__)

# Module-level shared browser instance
_computer_control: ComputerControl | None = None


def _get_cc() -> ComputerControl:
    global _computer_control
    if _computer_control is None:
        _computer_control = ComputerControl(sandbox_mode=False)
    return _computer_control


async def browser_navigate(url: str, wait_until: str = "networkidle") -> ToolResult:
    """Navigate to a URL and return the page title and text.

    Args:
        url: URL to navigate to.
        wait_until: Wait condition (load, domcontentloaded, networkidle).
    """
    try:
        cc = _get_cc()
        title = await cc.browser_open(url, wait_until=wait_until)
        text = await cc.browser_get_text()
        # Truncate for LLM context
        if len(text) > 30_000:
            text = text[:30_000] + "\n... (truncated)"
        return ToolResult(
            output=f"Title: {title}\n\n{text}",
            success=True,
            artifacts={"url": url, "title": title},
        )
    except Exception as e:
        return ToolResult(output="", success=False, error=str(e))


async def browser_interact(
    action: str,
    selector: str,
    value: str | None = None,
) -> ToolResult:
    """Interact with a page element.

    Args:
        action: Action to perform (click, fill, hover, select).
        selector: CSS selector of the target element.
        value: Value for fill/select actions.
    """
    try:
        cc = _get_cc()

        if action == "click":
            ok = await cc.browser_click(selector)
            return ToolResult(output=f"Clicked '{selector}': {'ok' if ok else 'failed'}", success=ok)

        elif action == "fill":
            if not value:
                return ToolResult(output="", success=False, error="'value' required for fill action")
            ok = await cc.browser_fill(selector, value)
            return ToolResult(output=f"Filled '{selector}': {'ok' if ok else 'failed'}", success=ok)

        elif action == "hover":
            page = cc._browser_page
            if page:
                await page.hover(selector, timeout=10000)
                return ToolResult(output=f"Hovered '{selector}'", success=True)
            return ToolResult(output="", success=False, error="Browser not initialized")

        elif action == "select":
            page = cc._browser_page
            if page and value:
                await page.select_option(selector, value, timeout=10000)
                return ToolResult(output=f"Selected '{value}' in '{selector}'", success=True)
            return ToolResult(output="", success=False, error="Browser not initialized or value missing")

        else:
            return ToolResult(output="", success=False, error=f"Unknown action: {action}")

    except Exception as e:
        return ToolResult(output="", success=False, error=str(e))


async def browser_screenshot(path: str = "/tmp/dropfly_screenshot.png") -> ToolResult:
    """Take a screenshot of the current page.

    Args:
        path: File path to save the screenshot.
    """
    try:
        cc = _get_cc()
        capture = await cc.browser_screenshot(path)
        return ToolResult(
            output=f"Screenshot saved: {capture.path}",
            success=True,
            artifacts={"path": capture.path, "width": capture.width, "height": capture.height},
        )
    except Exception as e:
        return ToolResult(output="", success=False, error=str(e))


async def browser_evaluate(expression: str) -> ToolResult:
    """Run JavaScript in the browser and return the result.

    Args:
        expression: JavaScript expression or code block.
    """
    try:
        cc = _get_cc()
        result = await cc.browser_evaluate(expression)
        return ToolResult(output=str(result), success=True)
    except Exception as e:
        return ToolResult(output="", success=False, error=str(e))


async def browser_extract_links() -> ToolResult:
    """Extract all links from the current page."""
    try:
        cc = _get_cc()
        links = await cc.browser_evaluate("""
            Array.from(document.querySelectorAll('a[href]')).map(a => ({
                text: a.innerText.trim().substring(0, 100),
                href: a.href
            })).filter(l => l.text && l.href.startsWith('http'))
        """)
        formatted = "\n".join(f"- [{l['text']}]({l['href']})" for l in links[:100])
        return ToolResult(
            output=formatted or "No links found.",
            success=True,
            artifacts={"count": len(links)},
        )
    except Exception as e:
        return ToolResult(output="", success=False, error=str(e))


def register_browser_tools(registry: ToolRegistry) -> None:
    """Register browser automation tools."""
    registry.register(
        name="browser_navigate",
        description=(
            "Navigate to a URL in the browser and get the page text. "
            "Renders JavaScript, unlike simple HTTP fetch."
        ),
        parameters={
            "type": "object",
            "properties": {
                "url": {"type": "string", "description": "URL to navigate to"},
                "wait_until": {
                    "type": "string",
                    "enum": ["load", "domcontentloaded", "networkidle"],
                    "description": "Wait condition (default: networkidle)",
                },
            },
            "required": ["url"],
        },
        handler=browser_navigate,
        tags=["browser"],
    )

    registry.register(
        name="browser_interact",
        description="Interact with elements on the current page (click, fill, hover, select).",
        parameters={
            "type": "object",
            "properties": {
                "action": {
                    "type": "string",
                    "enum": ["click", "fill", "hover", "select"],
                    "description": "Action to perform",
                },
                "selector": {"type": "string", "description": "CSS selector of target element"},
                "value": {"type": "string", "description": "Value for fill/select actions"},
            },
            "required": ["action", "selector"],
        },
        handler=browser_interact,
        tags=["browser"],
    )

    registry.register(
        name="browser_screenshot",
        description="Take a screenshot of the current browser page.",
        parameters={
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "File path to save screenshot"},
            },
        },
        handler=browser_screenshot,
        tags=["browser"],
    )

    registry.register(
        name="browser_evaluate",
        description="Execute JavaScript code in the browser and return the result.",
        parameters={
            "type": "object",
            "properties": {
                "expression": {"type": "string", "description": "JavaScript code to execute"},
            },
            "required": ["expression"],
        },
        handler=browser_evaluate,
        tags=["browser"],
    )

    registry.register(
        name="browser_extract_links",
        description="Extract all hyperlinks from the current page.",
        parameters={"type": "object", "properties": {}},
        handler=browser_extract_links,
        tags=["browser"],
    )
