"""Research Agent — Deep research better than Perplexity.

Multi-tool research: web search, GitHub code search, browser automation,
YouTube transcripts, document analysis. Can be spawned multiple times
in parallel for different research threads.
"""

from __future__ import annotations

from typing import Any

from ..core.base_agent import BaseAgent
from ..core.tool_registry import ToolRegistry
from ..tools.web_search import register_web_tools
from ..tools.shell import register_shell_tools


class ResearchAgent(BaseAgent):
    """Research Agent — PhD-level research capabilities.

    Tools: web search, URL fetching, browser automation, YouTube transcripts,
    GitHub code search, shell for advanced operations.
    """

    agent_type = "research"
    default_model = "anthropic/claude-opus-4-5-20250514"

    def _get_system_prompt(self, context: str | None = None) -> str:
        prompt = """# RESEARCH AGENT — Deep Research Specialist

## Identity
You are a senior research analyst with PhD-level research skills. You find information
that others can't. You cross-reference sources, verify claims, and produce comprehensive
research reports.

## Your Capabilities

1. **Web Search** — Search the internet for any topic
2. **URL Fetching** — Read any webpage, extract content
3. **YouTube Analysis** — Get video transcripts and analyze content
4. **GitHub Search** — Find relevant code, libraries, implementations
5. **Browser Automation** — Render JavaScript-heavy pages, interact with web apps
6. **Shell Commands** — Run any tool (curl, jq, etc.) for advanced data gathering

## Research Methodology

1. **Understand the Question** — What exactly needs to be researched?
2. **Multi-Source Search** — Search from multiple angles, not just one query
3. **Cross-Reference** — Verify facts across sources
4. **Analyze Competitors** — Find existing solutions, learn from them
5. **Synthesize** — Produce a clear, structured report

## Output Format

Always produce a research report with:
- **Executive Summary** (2-3 sentences)
- **Key Findings** (bulleted, prioritized)
- **Detailed Analysis** (organized by topic)
- **Recommendations** (actionable next steps)
- **Sources** (URLs, with brief descriptions)

## Rules

- Never present unverified information as fact
- Always cite sources
- If you can't find information, say so — don't fabricate
- Prefer primary sources over secondary
- When researching tech, actually look at the code/docs, not just blog posts
- Post research artifacts to the bus for other agents to consume
"""
        if context:
            prompt += f"\n\n## Research Context\n{context}"
        return prompt

    def _register_tools(self, registry: ToolRegistry) -> None:
        """Register research-specific tools."""
        register_web_tools(registry)
        register_shell_tools(registry)

        registry.register(
            name="github_search",
            description="Search GitHub for repositories, code, or issues.",
            parameters={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query"},
                    "search_type": {
                        "type": "string",
                        "enum": ["repositories", "code", "issues"],
                        "description": "Type of GitHub search",
                    },
                    "language": {
                        "type": "string",
                        "description": "Filter by programming language",
                    },
                },
                "required": ["query"],
            },
            handler=self._github_search,
            tags=["research", "github"],
        )

        registry.register(
            name="post_research",
            description="Post a research report to the agent bus for other agents.",
            parameters={
                "type": "object",
                "properties": {
                    "topic": {"type": "string", "description": "Research topic"},
                    "report": {"type": "string", "description": "Full research report"},
                    "key_findings": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Key findings as bullets",
                    },
                },
                "required": ["topic", "report"],
            },
            handler=self._post_research,
            tags=["research"],
        )

    async def _github_search(
        self,
        query: str,
        search_type: str = "repositories",
        language: str | None = None,
    ) -> str:
        """Search GitHub using the gh CLI."""
        from ..tools.shell import run_shell

        lang_filter = f" language:{language}" if language else ""

        if search_type == "repositories":
            result = await run_shell(
                f'gh search repos "{query}{lang_filter}" --limit 10 --json name,url,description,stargazersCount',
                timeout=15.0,
            )
        elif search_type == "code":
            result = await run_shell(
                f'gh search code "{query}{lang_filter}" --limit 10 --json path,repository,textMatches',
                timeout=15.0,
            )
        elif search_type == "issues":
            result = await run_shell(
                f'gh search issues "{query}" --limit 10 --json title,url,state,body',
                timeout=15.0,
            )
        else:
            return f"Unknown search type: {search_type}"

        return result.output if result.success else f"Search failed: {result.error}"

    async def _post_research(
        self,
        topic: str,
        report: str,
        key_findings: list[str] | None = None,
    ) -> str:
        """Post research to the bus."""
        if self.bus:
            await self.bus.set_artifact(
                key=f"research_{topic.lower().replace(' ', '_')}",
                value={
                    "topic": topic,
                    "report": report,
                    "key_findings": key_findings or [],
                },
                owner_agent=self.agent_id,
                artifact_type="research",
            )
            return f"Research on '{topic}' posted to bus."
        return f"Research on '{topic}' completed (no bus available)."
