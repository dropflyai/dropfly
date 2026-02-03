"""Full computer control — shell, browser, file system, orchestrated.

Provides a unified interface for agents to control the computer,
combining shell execution, browser automation, file system access,
and Docker sandboxing into a single coherent module.
"""

from __future__ import annotations

import asyncio
import logging
import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional

from ..core.tool_registry import ToolRegistry, ToolResult
from .sandbox import DockerSandbox, SandboxConfig

logger = logging.getLogger(__name__)


@dataclass
class ScreenCapture:
    """A screenshot or page snapshot."""

    path: str
    width: int = 0
    height: int = 0
    format: str = "png"


class ComputerControl:
    """Full computer control for agents.

    Combines:
    - Shell execution (direct or sandboxed)
    - Browser automation (Playwright)
    - File system operations
    - Screenshot/screen capture

    Usage:
        cc = ComputerControl(sandbox_mode=True)

        # Shell
        result = await cc.shell("ls -la")
        result = await cc.shell("npm install", cwd="/my/project")

        # Browser
        page = await cc.browser_open("https://example.com")
        text = await cc.browser_get_text()
        await cc.browser_click("button.submit")
        await cc.browser_screenshot("/tmp/screenshot.png")

        # Combined: browse and extract
        data = await cc.browse_and_extract("https://api.example.com/data", "Extract the JSON response")
    """

    def __init__(
        self,
        sandbox_mode: bool = False,
        sandbox_config: SandboxConfig | None = None,
        workspace_dir: str | None = None,
    ):
        self.sandbox_mode = sandbox_mode
        self.sandbox = DockerSandbox(sandbox_config) if sandbox_mode else None
        self.workspace_dir = workspace_dir or os.getcwd()
        self._browser: Any = None
        self._browser_page: Any = None
        self._playwright: Any = None

    # ------------------------------------------------------------------
    # Shell
    # ------------------------------------------------------------------

    async def shell(
        self,
        command: str,
        cwd: str | None = None,
        timeout: float = 120.0,
        env: dict[str, str] | None = None,
    ) -> ToolResult:
        """Execute a shell command, optionally sandboxed.

        Args:
            command: Shell command.
            cwd: Working directory.
            timeout: Max execution time.
            env: Extra environment variables.
        """
        if self.sandbox_mode and self.sandbox:
            result = await self.sandbox.run(
                command,
                workspace=cwd or self.workspace_dir,
                config=SandboxConfig(timeout=timeout, env_vars=env or {}),
            )
            return ToolResult(
                output=result.stdout or result.stderr,
                success=result.success,
                error=result.stderr if not result.success else None,
            )

        from ..tools.shell import run_shell

        return await run_shell(
            command,
            working_directory=cwd or self.workspace_dir,
            timeout=timeout,
            env=env,
        )

    # ------------------------------------------------------------------
    # Browser
    # ------------------------------------------------------------------

    async def browser_open(self, url: str, wait_until: str = "networkidle") -> str:
        """Open a URL in the browser.

        Args:
            url: URL to navigate to.
            wait_until: Wait condition (load, domcontentloaded, networkidle).

        Returns:
            Page title.
        """
        await self._ensure_browser()
        await self._browser_page.goto(url, wait_until=wait_until, timeout=30000)
        return await self._browser_page.title()

    async def browser_get_text(self, selector: str = "body") -> str:
        """Get text content from the current page.

        Args:
            selector: CSS selector (default: body = entire page text).
        """
        await self._ensure_browser()
        text = await self._browser_page.inner_text(selector)
        if len(text) > 50_000:
            text = text[:50_000] + "\n... (truncated)"
        return text

    async def browser_get_html(self, selector: str = "html") -> str:
        """Get HTML content from the current page."""
        await self._ensure_browser()
        html = await self._browser_page.inner_html(selector)
        if len(html) > 100_000:
            html = html[:100_000] + "\n... (truncated)"
        return html

    async def browser_click(self, selector: str) -> bool:
        """Click an element on the page.

        Args:
            selector: CSS selector of element to click.
        """
        await self._ensure_browser()
        try:
            await self._browser_page.click(selector, timeout=10000)
            return True
        except Exception as e:
            logger.warning(f"Click failed on '{selector}': {e}")
            return False

    async def browser_fill(self, selector: str, value: str) -> bool:
        """Fill a form input.

        Args:
            selector: CSS selector of input element.
            value: Value to type.
        """
        await self._ensure_browser()
        try:
            await self._browser_page.fill(selector, value, timeout=10000)
            return True
        except Exception as e:
            logger.warning(f"Fill failed on '{selector}': {e}")
            return False

    async def browser_screenshot(self, path: str = "/tmp/screenshot.png") -> ScreenCapture:
        """Take a screenshot of the current page.

        Args:
            path: File path to save the screenshot.
        """
        await self._ensure_browser()
        await self._browser_page.screenshot(path=path, full_page=True)
        viewport = self._browser_page.viewport_size or {}
        return ScreenCapture(
            path=path,
            width=viewport.get("width", 0),
            height=viewport.get("height", 0),
        )

    async def browser_evaluate(self, expression: str) -> Any:
        """Evaluate JavaScript in the browser.

        Args:
            expression: JavaScript expression to evaluate.
        """
        await self._ensure_browser()
        return await self._browser_page.evaluate(expression)

    async def browser_wait_for(self, selector: str, timeout: float = 10.0) -> bool:
        """Wait for an element to appear.

        Args:
            selector: CSS selector.
            timeout: Max wait time in seconds.
        """
        await self._ensure_browser()
        try:
            await self._browser_page.wait_for_selector(
                selector, timeout=int(timeout * 1000)
            )
            return True
        except Exception:
            return False

    async def browse_and_extract(self, url: str, instruction: str) -> str:
        """Open a URL and extract information based on instructions.

        Uses the browser to render the page, then extracts the requested data.

        Args:
            url: URL to visit.
            instruction: What to extract (e.g., "get all product names and prices").
        """
        await self.browser_open(url)
        text = await self.browser_get_text()
        return f"Page content from {url}:\n\n{text}"

    async def _ensure_browser(self) -> None:
        """Ensure the browser is launched."""
        if self._browser_page:
            return

        try:
            from playwright.async_api import async_playwright

            self._playwright = await async_playwright().start()
            self._browser = await self._playwright.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-dev-shm-usage"],
            )
            self._browser_page = await self._browser.new_page(
                viewport={"width": 1280, "height": 800},
                user_agent=(
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0.0.0 Safari/537.36"
                ),
            )
        except ImportError:
            raise RuntimeError(
                "Playwright not installed. Run: pip install playwright && playwright install chromium"
            )

    async def close_browser(self) -> None:
        """Close the browser."""
        if self._browser:
            await self._browser.close()
            self._browser = None
            self._browser_page = None
        if self._playwright:
            await self._playwright.stop()
            self._playwright = None

    # ------------------------------------------------------------------
    # Cleanup
    # ------------------------------------------------------------------

    async def cleanup(self) -> None:
        """Clean up all resources."""
        await self.close_browser()
        if self.sandbox:
            await self.sandbox.cleanup_all()


def register_computer_control_tools(registry: ToolRegistry, cc: ComputerControl) -> None:
    """Register computer control tools in a registry."""

    async def _shell(command: str, cwd: str | None = None, timeout: float = 120.0) -> ToolResult:
        return await cc.shell(command, cwd=cwd, timeout=timeout)

    async def _browser_open(url: str) -> str:
        title = await cc.browser_open(url)
        return f"Opened: {title}"

    async def _browser_text(selector: str = "body") -> str:
        return await cc.browser_get_text(selector)

    async def _browser_click(selector: str) -> str:
        ok = await cc.browser_click(selector)
        return "Clicked" if ok else "Click failed"

    async def _browser_fill(selector: str, value: str) -> str:
        ok = await cc.browser_fill(selector, value)
        return "Filled" if ok else "Fill failed"

    async def _browser_screenshot(path: str = "/tmp/screenshot.png") -> str:
        cap = await cc.browser_screenshot(path)
        return f"Screenshot saved: {cap.path} ({cap.width}x{cap.height})"

    registry.register(
        name="computer_shell", description="Run a shell command on the system.",
        parameters={
            "type": "object",
            "properties": {
                "command": {"type": "string", "description": "Shell command"},
                "cwd": {"type": "string", "description": "Working directory"},
                "timeout": {"type": "number", "description": "Timeout in seconds"},
            },
            "required": ["command"],
        },
        handler=_shell, tags=["computer", "shell"],
    )

    registry.register(
        name="browser_open", description="Open a URL in the browser.",
        parameters={
            "type": "object",
            "properties": {"url": {"type": "string", "description": "URL to open"}},
            "required": ["url"],
        },
        handler=_browser_open, tags=["computer", "browser"],
    )

    registry.register(
        name="browser_text", description="Get text from the current browser page.",
        parameters={
            "type": "object",
            "properties": {
                "selector": {"type": "string", "description": "CSS selector (default: body)"},
            },
        },
        handler=_browser_text, tags=["computer", "browser"],
    )

    registry.register(
        name="browser_click", description="Click an element on the page.",
        parameters={
            "type": "object",
            "properties": {"selector": {"type": "string", "description": "CSS selector"}},
            "required": ["selector"],
        },
        handler=_browser_click, tags=["computer", "browser"],
    )

    registry.register(
        name="browser_fill", description="Fill a form field on the page.",
        parameters={
            "type": "object",
            "properties": {
                "selector": {"type": "string", "description": "CSS selector of input"},
                "value": {"type": "string", "description": "Value to type"},
            },
            "required": ["selector", "value"],
        },
        handler=_browser_fill, tags=["computer", "browser"],
    )

    registry.register(
        name="browser_screenshot", description="Take a screenshot of the current page.",
        parameters={
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Save path (default: /tmp/screenshot.png)"},
            },
        },
        handler=_browser_screenshot, tags=["computer", "browser"],
    )
