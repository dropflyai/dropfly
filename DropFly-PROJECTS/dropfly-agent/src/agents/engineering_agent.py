"""Engineering Agent — Full-stack code builder with computer control.

Creates entire projects from scratch, installs dependencies, writes code,
runs builds, executes tests, and deploys. Has full file system, shell,
and git access.
"""

from __future__ import annotations

from typing import Any

from ..core.base_agent import BaseAgent
from ..core.brain_loader import BrainLoader
from ..core.tool_registry import ToolRegistry
from ..tools.shell import register_shell_tools
from ..tools.file_system import register_file_tools
from ..tools.git_tools import register_git_tools


class EngineeringAgent(BaseAgent):
    """Engineering Agent — builds code, infrastructure, and systems.

    Has access to shell, file system, git, and can ask other agents
    (design, QA) for specs and test requirements via the bus.
    """

    agent_type = "engineering"
    default_model = "anthropic/claude-sonnet-4-20250514"

    def __init__(self, **kwargs: Any):
        self._brain_loader = BrainLoader()
        super().__init__(**kwargs)

    def _get_system_prompt(self, context: str | None = None) -> str:
        # Try to load brain guidance
        try:
            brain_prompt = self._brain_loader.build_system_prompt("engineering", context)
            return brain_prompt + """

## Agent-Specific Instructions

You are the Engineering Agent in the DropFly autonomous builder system.

Your capabilities:
- Full shell access (run_shell) — install packages, run builds, execute scripts
- File system (read_file, write_file, edit_file, list_directory, search_files)
- Git operations (git_init, git_clone, git_add, git_commit, git_push, git_checkout)
- Ask other agents for help via the bus

## Rules
- Write production-quality code — not prototypes
- Always handle errors properly
- Include appropriate logging
- Follow the project's existing patterns and conventions
- When creating new projects, use best practices for the stack
- Run tests after writing code when possible
- Commit changes with meaningful messages
"""
        except FileNotFoundError:
            # Fallback if brain CLAUDE.md isn't available
            return """# ENGINEERING AGENT

You are a senior full-stack engineer. You write production code, set up infrastructure,
and build complete systems.

## Capabilities
- Shell: run commands, install packages, build projects
- Files: create, read, edit, search code
- Git: clone, branch, commit, push, create PRs

## Standards
- Write clean, production-quality code
- Handle errors properly
- Follow project conventions
- Include tests when appropriate
- Use meaningful commit messages
""" + (f"\n## Context\n{context}" if context else "")

    def _register_tools(self, registry: ToolRegistry) -> None:
        register_shell_tools(registry)
        register_file_tools(registry)
        register_git_tools(registry)

        # Engineering-specific tools
        registry.register(
            name="ask_design_agent",
            description="Ask the Design Agent a question (e.g., for UI specs, component details).",
            parameters={
                "type": "object",
                "properties": {
                    "question": {"type": "string", "description": "Question for the design agent"},
                },
                "required": ["question"],
            },
            handler=self._ask_design,
            tags=["collaboration"],
        )

        registry.register(
            name="ask_qa_agent",
            description="Ask the QA Agent a question (e.g., what tests to write, test strategies).",
            parameters={
                "type": "object",
                "properties": {
                    "question": {"type": "string", "description": "Question for the QA agent"},
                },
                "required": ["question"],
            },
            handler=self._ask_qa,
            tags=["collaboration"],
        )

        registry.register(
            name="post_code_artifact",
            description="Share a code artifact with other agents (e.g., API spec, component list).",
            parameters={
                "type": "object",
                "properties": {
                    "key": {"type": "string", "description": "Artifact key (e.g., 'api_routes')"},
                    "content": {"type": "string", "description": "The artifact content"},
                    "artifact_type": {
                        "type": "string",
                        "description": "Type: code, spec, config, etc.",
                    },
                },
                "required": ["key", "content"],
            },
            handler=self._post_artifact,
            tags=["collaboration"],
        )

    async def _ask_design(self, question: str) -> str:
        if self.bus:
            try:
                return await self.bus.request(
                    self.agent_id, "design", question, timeout=60.0
                )
            except Exception:
                pass
        return "Design agent not available. Proceeding with engineering judgment."

    async def _ask_qa(self, question: str) -> str:
        if self.bus:
            try:
                return await self.bus.request(
                    self.agent_id, "qa", question, timeout=60.0
                )
            except Exception:
                pass
        return "QA agent not available. Will write basic tests."

    async def _post_artifact(
        self, key: str, content: str, artifact_type: str = "code"
    ) -> str:
        if self.bus:
            await self.bus.set_artifact(
                key=key,
                value=content,
                owner_agent=self.agent_id,
                artifact_type=artifact_type,
            )
            return f"Artifact '{key}' posted to bus."
        return f"Artifact '{key}' created (no bus available)."
