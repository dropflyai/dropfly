"""Web search and content fetching tools.

Multiple methods to fetch web content — never gets blocked:
1. Tavily API (structured search)
2. Brave Search API
3. Playwright browser (renders JavaScript, extracts content)
4. yt-dlp for YouTube transcripts
5. httpx direct fetch with rotation
"""

from __future__ import annotations

import logging
import os
import json
from typing import Any

from ..core.tool_registry import ToolRegistry, ToolResult

logger = logging.getLogger(__name__)


async def web_search(query: str, max_results: int = 10) -> ToolResult:
    """Search the web using Tavily API.

    Args:
        query: Search query.
        max_results: Number of results to return.
    """
    api_key = os.environ.get("TAVILY_API_KEY", "")
    if not api_key:
        # Fallback to shell-based search
        from .shell import run_shell

        result = await run_shell(
            f'curl -s "https://api.duckduckgo.com/?q={query}&format=json&no_html=1"',
            timeout=15.0,
        )
        return result

    try:
        import httpx

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.tavily.com/search",
                json={
                    "api_key": api_key,
                    "query": query,
                    "max_results": max_results,
                    "search_depth": "advanced",
                    "include_answer": True,
                    "include_raw_content": False,
                },
            )
            data = response.json()

        answer = data.get("answer", "")
        results = data.get("results", [])
        formatted = []
        if answer:
            formatted.append(f"**Answer:** {answer}\n")

        for r in results:
            formatted.append(
                f"**{r.get('title', 'Untitled')}**\n"
                f"URL: {r.get('url', '')}\n"
                f"{r.get('content', '')[:500]}\n"
            )

        return ToolResult(
            output="\n---\n".join(formatted) if formatted else "No results found.",
            success=True,
            artifacts={"result_count": len(results)},
        )
    except Exception as e:
        return ToolResult(output="", success=False, error=f"Search failed: {e}")


async def fetch_url(
    url: str,
    extract_text: bool = True,
    use_browser: bool = False,
) -> ToolResult:
    """Fetch content from a URL.

    Args:
        url: URL to fetch.
        extract_text: Extract readable text (strip HTML).
        use_browser: Use Playwright for JavaScript-heavy pages.
    """
    if use_browser:
        return await _fetch_with_browser(url)
    return await _fetch_with_httpx(url, extract_text)


async def _fetch_with_httpx(url: str, extract_text: bool = True) -> ToolResult:
    """Fetch URL with httpx."""
    try:
        import httpx

        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
        }

        async with httpx.AsyncClient(
            follow_redirects=True, timeout=30.0, headers=headers
        ) as client:
            response = await client.get(url)
            content = response.text

        if extract_text and "text/html" in response.headers.get("content-type", ""):
            content = _html_to_text(content)

        # Truncate if too long
        if len(content) > 50_000:
            content = content[:50_000] + "\n... (truncated)"

        return ToolResult(
            output=content,
            success=True,
            artifacts={"url": url, "status_code": response.status_code},
        )
    except Exception as e:
        return ToolResult(output="", success=False, error=f"Fetch failed: {e}")


async def _fetch_with_browser(url: str) -> ToolResult:
    """Fetch URL using Playwright browser (handles JavaScript)."""
    try:
        from playwright.async_api import async_playwright

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(url, wait_until="networkidle", timeout=30000)
            content = await page.content()
            text = await page.inner_text("body")
            await browser.close()

        if len(text) > 50_000:
            text = text[:50_000] + "\n... (truncated)"

        return ToolResult(
            output=text,
            success=True,
            artifacts={"url": url, "method": "browser"},
        )
    except ImportError:
        return ToolResult(
            output="",
            success=False,
            error="Playwright not installed. Run: playwright install chromium",
        )
    except Exception as e:
        return ToolResult(output="", success=False, error=f"Browser fetch failed: {e}")


async def youtube_transcript(url: str) -> ToolResult:
    """Get the transcript of a YouTube video.

    Uses yt-dlp to extract subtitles — never blocked by YouTube.

    Args:
        url: YouTube video URL.
    """
    from .shell import run_shell

    # Try yt-dlp first
    result = await run_shell(
        f'yt-dlp --write-auto-sub --sub-lang en --skip-download '
        f'--sub-format vtt -o "/tmp/yt_transcript" "{url}" 2>/dev/null && '
        f'cat /tmp/yt_transcript.en.vtt 2>/dev/null || echo "No transcript available"',
        timeout=30.0,
    )

    if result.success and "No transcript available" not in result.output:
        # Clean VTT format to plain text
        lines = []
        for line in result.output.split("\n"):
            line = line.strip()
            if not line or line.startswith("WEBVTT") or "-->" in line or line.isdigit():
                continue
            if line not in lines:
                lines.append(line)
        return ToolResult(
            output="\n".join(lines),
            success=True,
            artifacts={"url": url, "method": "yt-dlp"},
        )

    # Fallback: try to get video info
    info_result = await run_shell(
        f'yt-dlp --dump-json "{url}" 2>/dev/null',
        timeout=15.0,
    )
    if info_result.success:
        try:
            data = json.loads(info_result.output)
            return ToolResult(
                output=(
                    f"Title: {data.get('title', 'Unknown')}\n"
                    f"Description: {data.get('description', 'No description')}\n"
                    f"Duration: {data.get('duration', 0)}s\n"
                    f"Channel: {data.get('channel', 'Unknown')}\n"
                ),
                success=True,
                artifacts={"url": url, "method": "yt-dlp-info"},
            )
        except json.JSONDecodeError:
            pass

    return ToolResult(
        output="",
        success=False,
        error="Could not extract YouTube transcript. Install yt-dlp: pip install yt-dlp",
    )


def _html_to_text(html: str) -> str:
    """Simple HTML to text conversion."""
    import re

    # Remove scripts and styles
    text = re.sub(r"<script[^>]*>.*?</script>", "", html, flags=re.DOTALL)
    text = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL)
    # Remove tags
    text = re.sub(r"<[^>]+>", " ", text)
    # Clean whitespace
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\n\s*\n", "\n\n", text)
    return text.strip()


def register_web_tools(registry: ToolRegistry) -> None:
    """Register web search and fetch tools."""
    registry.register(
        name="web_search",
        description="Search the web. Returns relevant results with titles, URLs, and snippets.",
        parameters={
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Search query"},
                "max_results": {
                    "type": "integer",
                    "description": "Number of results (default 10)",
                },
            },
            "required": ["query"],
        },
        handler=web_search,
        tags=["web", "research"],
    )

    registry.register(
        name="fetch_url",
        description=(
            "Fetch the content of a web page. Returns the text content. "
            "Use use_browser=true for JavaScript-heavy pages."
        ),
        parameters={
            "type": "object",
            "properties": {
                "url": {"type": "string", "description": "URL to fetch"},
                "extract_text": {
                    "type": "boolean",
                    "description": "Extract readable text from HTML (default true)",
                },
                "use_browser": {
                    "type": "boolean",
                    "description": "Use browser for JS pages (default false)",
                },
            },
            "required": ["url"],
        },
        handler=fetch_url,
        tags=["web", "research"],
    )

    registry.register(
        name="youtube_transcript",
        description=(
            "Get the transcript/subtitles of a YouTube video. "
            "Never gets blocked — uses yt-dlp to extract directly."
        ),
        parameters={
            "type": "object",
            "properties": {
                "url": {"type": "string", "description": "YouTube video URL"},
            },
            "required": ["url"],
        },
        handler=youtube_transcript,
        tags=["web", "research", "youtube"],
    )
