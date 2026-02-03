"""QA Agent — Testing and validation specialist.

Writes tests, runs test suites, reviews code for bugs and security issues,
and reports problems back to the Engineering Agent.
"""

from __future__ import annotations

from typing import Any

from ..core.base_agent import BaseAgent
from ..core.tool_registry import ToolRegistry
from ..tools.shell import register_shell_tools
from ..tools.file_system import register_file_tools


class QAAgent(BaseAgent):
    """QA Agent — writes tests, runs suites, reviews code quality."""

    agent_type = "qa"
    default_model = "anthropic/claude-sonnet-4-20250514"

    def _get_system_prompt(self, context: str | None = None) -> str:
        prompt = """# QA AGENT — Testing & Validation Specialist

## Identity
You are a senior QA engineer. You write comprehensive tests, catch bugs before
they ship, and ensure code quality meets production standards.

## Capabilities

1. **Write Tests** — Unit, integration, e2e tests
2. **Run Tests** — Execute test suites, capture results
3. **Code Review** — Find bugs, security issues, performance problems
4. **Read Code** — Analyze the codebase for quality issues

## Test Strategy

For any project, you create:
- **Unit tests** for individual functions/components
- **Integration tests** for API endpoints and data flow
- **E2E tests** for critical user journeys (using Playwright when applicable)

## Standards
- Aim for 80%+ code coverage on critical paths
- Test edge cases and error scenarios
- Security review: check for injection, XSS, auth bypass
- Performance: flag N+1 queries, missing indexes, unbounded loops

## Output
- Test files written to the project
- Test results reported
- Issues filed as artifacts on the bus for Engineering to fix

## Tools
- Shell: run test commands (pytest, jest, vitest, etc.)
- Files: read source code, write test files
- Bus: report issues to Engineering, read code artifacts
"""
        if context:
            prompt += f"\n## Context\n{context}"
        return prompt

    def _register_tools(self, registry: ToolRegistry) -> None:
        register_shell_tools(registry)
        register_file_tools(registry)

        registry.register(
            name="report_issue",
            description="Report a bug or code quality issue to the Engineering Agent.",
            parameters={
                "type": "object",
                "properties": {
                    "title": {"type": "string", "description": "Issue title"},
                    "severity": {
                        "type": "string",
                        "enum": ["critical", "high", "medium", "low"],
                        "description": "Issue severity",
                    },
                    "description": {"type": "string", "description": "Detailed description"},
                    "file_path": {"type": "string", "description": "File where issue was found"},
                    "line_number": {"type": "integer", "description": "Line number if applicable"},
                    "suggested_fix": {"type": "string", "description": "Suggested fix"},
                },
                "required": ["title", "severity", "description"],
            },
            handler=self._report_issue,
            tags=["qa"],
        )

        registry.register(
            name="post_test_results",
            description="Post test results to the agent bus.",
            parameters={
                "type": "object",
                "properties": {
                    "suite_name": {"type": "string", "description": "Test suite name"},
                    "passed": {"type": "integer", "description": "Tests passed"},
                    "failed": {"type": "integer", "description": "Tests failed"},
                    "skipped": {"type": "integer", "description": "Tests skipped"},
                    "details": {"type": "string", "description": "Full test output"},
                },
                "required": ["suite_name", "passed", "failed"],
            },
            handler=self._post_test_results,
            tags=["qa"],
        )

    async def _report_issue(
        self,
        title: str,
        severity: str,
        description: str,
        file_path: str | None = None,
        line_number: int | None = None,
        suggested_fix: str | None = None,
    ) -> str:
        issue = {
            "title": title,
            "severity": severity,
            "description": description,
            "file_path": file_path,
            "line_number": line_number,
            "suggested_fix": suggested_fix,
            "reporter": self.agent_id,
        }

        if self.bus:
            await self.bus.set_artifact(
                key=f"issue_{title.lower().replace(' ', '_')[:30]}",
                value=issue,
                owner_agent=self.agent_id,
                artifact_type="issue",
            )
            await self.bus.send(
                self.agent_id,
                "engineering",
                f"[{severity.upper()}] {title}: {description[:200]}",
            )

        import json

        return f"Issue reported: {json.dumps(issue, indent=2)}"

    async def _post_test_results(
        self,
        suite_name: str,
        passed: int,
        failed: int,
        skipped: int = 0,
        details: str = "",
    ) -> str:
        results = {
            "suite": suite_name,
            "passed": passed,
            "failed": failed,
            "skipped": skipped,
            "total": passed + failed + skipped,
            "pass_rate": f"{passed / max(passed + failed, 1) * 100:.1f}%",
            "details": details[:2000],
        }

        if self.bus:
            await self.bus.set_artifact(
                key=f"test_results_{suite_name}",
                value=results,
                owner_agent=self.agent_id,
                artifact_type="test_results",
            )

        return f"Test results: {passed} passed, {failed} failed, {skipped} skipped"
