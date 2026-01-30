"""Engineering Agent - Code, infrastructure, and automation specialist."""

import os
import subprocess
from typing import Any, Optional
from pathlib import Path

from ..core.base_agent import BaseAgent, AgentResponse
from ..core.memory_client import SupabaseMemoryClient, Pattern


class EngineeringAgent(BaseAgent):
    """Engineering specialist agent.

    Handles:
    - Code architecture and implementation
    - Database migrations and schema design
    - API development
    - Automation and CI/CD pipelines
    - Testing and verification
    - Performance optimization
    - Security enforcement
    - DevOps and infrastructure

    Uses the Engineering Brain guidance for all decisions.
    """

    AGENT_TYPE = "engineering"
    BRAIN_NAME = "engineering"
    DEFAULT_MODEL = "claude-sonnet-4-20250514"

    def __init__(
        self,
        model: Optional[str] = None,
        api_key: Optional[str] = None,
        memory_client: Optional[SupabaseMemoryClient] = None,
        auto_log: bool = True,
        working_directory: Optional[str] = None,
    ):
        """Initialize the Engineering agent.

        Args:
            model: Model to use. Defaults to claude-sonnet-4.
            api_key: Anthropic API key.
            memory_client: Supabase client for logging.
            auto_log: Whether to auto-log runs.
            working_directory: Directory for file operations.
        """
        super().__init__(
            model=model,
            api_key=api_key,
            memory_client=memory_client,
            auto_log=auto_log,
        )

        self.working_directory = working_directory or os.getcwd()
        self._register_engineering_tools()

    def _get_agent_instructions(self) -> str:
        """Return engineering-specific instructions."""
        return """You are the Engineering Agent - a principal-level engineer specialist.

Your capabilities:
- Write production-quality code in any language
- Design database schemas and write migrations
- Create REST/GraphQL APIs
- Set up CI/CD pipelines
- Write comprehensive tests
- Optimize performance
- Implement security best practices

Rules (from Engineering Brain):
- Claims require evidence - verify before asserting
- If automation exists, you MUST use it
- Never bypass governance or verification
- Stop and report if verification cannot be completed
- Log solutions to memory for future reference

Tools available:
- write_file: Create or overwrite a file
- read_file: Read file contents
- run_command: Execute shell commands (with safety checks)
- search_code: Search for patterns in codebase
- call_design_brain: Delegate UI/UX questions to Design agent

Output quality:
- Code must be production-ready
- Include error handling
- Add type hints/annotations
- Document public interfaces
- Consider edge cases
"""

    def _register_engineering_tools(self) -> None:
        """Register engineering-specific tools."""
        self.register_tool(
            name="write_file",
            description="Write content to a file. Creates directories if needed.",
            input_schema={
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "File path relative to working directory",
                    },
                    "content": {
                        "type": "string",
                        "description": "Content to write",
                    },
                },
                "required": ["path", "content"],
            },
            handler=self._write_file,
        )

        self.register_tool(
            name="read_file",
            description="Read contents of a file",
            input_schema={
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "File path relative to working directory",
                    },
                },
                "required": ["path"],
            },
            handler=self._read_file,
        )

        self.register_tool(
            name="run_command",
            description="Run a shell command. Use with caution.",
            input_schema={
                "type": "object",
                "properties": {
                    "command": {
                        "type": "string",
                        "description": "Command to execute",
                    },
                    "timeout": {
                        "type": "integer",
                        "description": "Timeout in seconds (default 30)",
                    },
                },
                "required": ["command"],
            },
            handler=self._run_command,
        )

        self.register_tool(
            name="search_code",
            description="Search for a pattern in the codebase",
            input_schema={
                "type": "object",
                "properties": {
                    "pattern": {
                        "type": "string",
                        "description": "Regex pattern to search for",
                    },
                    "file_pattern": {
                        "type": "string",
                        "description": "Glob pattern for files to search (e.g., '*.py')",
                    },
                },
                "required": ["pattern"],
            },
            handler=self._search_code,
        )

        self.register_tool(
            name="call_design_brain",
            description="Delegate a UI/UX question to the Design agent",
            input_schema={
                "type": "object",
                "properties": {
                    "question": {
                        "type": "string",
                        "description": "The design question to ask",
                    },
                    "context": {
                        "type": "string",
                        "description": "Context about the engineering task",
                    },
                },
                "required": ["question"],
            },
            handler=self._call_design_brain,
        )

    def _write_file(self, path: str, content: str) -> str:
        """Write content to a file.

        Args:
            path: File path.
            content: Content to write.

        Returns:
            Success message or error.
        """
        try:
            file_path = Path(self.working_directory) / path
            file_path.parent.mkdir(parents=True, exist_ok=True)
            file_path.write_text(content, encoding="utf-8")
            return f"Successfully wrote {len(content)} bytes to {path}"
        except Exception as e:
            return f"Error writing file: {str(e)}"

    def _read_file(self, path: str) -> str:
        """Read file contents.

        Args:
            path: File path.

        Returns:
            File contents or error.
        """
        try:
            file_path = Path(self.working_directory) / path
            if not file_path.exists():
                return f"File not found: {path}"
            return file_path.read_text(encoding="utf-8")
        except Exception as e:
            return f"Error reading file: {str(e)}"

    def _run_command(self, command: str, timeout: int = 30) -> str:
        """Run a shell command with safety checks.

        Args:
            command: Command to execute.
            timeout: Timeout in seconds.

        Returns:
            Command output or error.
        """
        # Safety checks - block dangerous commands
        dangerous_patterns = [
            "rm -rf /",
            "rm -rf ~",
            "mkfs",
            "dd if=",
            "> /dev/sda",
            "chmod 777 /",
            ":(){:|:&};:",
        ]

        for pattern in dangerous_patterns:
            if pattern in command:
                return f"Blocked dangerous command: {command}"

        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=self.working_directory,
            )
            output = result.stdout
            if result.stderr:
                output += f"\n[stderr]\n{result.stderr}"
            if result.returncode != 0:
                output += f"\n[exit code: {result.returncode}]"
            return output or "(no output)"
        except subprocess.TimeoutExpired:
            return f"Command timed out after {timeout} seconds"
        except Exception as e:
            return f"Command failed: {str(e)}"

    def _search_code(
        self,
        pattern: str,
        file_pattern: Optional[str] = None,
    ) -> str:
        """Search for a pattern in the codebase.

        Args:
            pattern: Regex pattern to search.
            file_pattern: Glob pattern for files.

        Returns:
            Search results.
        """
        try:
            import re
            from pathlib import Path

            results = []
            base = Path(self.working_directory)

            glob_pattern = file_pattern or "**/*"
            for file_path in base.glob(glob_pattern):
                if file_path.is_file():
                    try:
                        content = file_path.read_text(encoding="utf-8")
                        for i, line in enumerate(content.split("\n"), 1):
                            if re.search(pattern, line):
                                rel_path = file_path.relative_to(base)
                                results.append(f"{rel_path}:{i}: {line.strip()}")
                    except (UnicodeDecodeError, PermissionError):
                        continue

            if not results:
                return f"No matches found for pattern: {pattern}"

            return "\n".join(results[:50])  # Limit results

        except Exception as e:
            return f"Search error: {str(e)}"

    def _call_design_brain(
        self,
        question: str,
        context: Optional[str] = None,
    ) -> str:
        """Delegate a question to the Design agent.

        Args:
            question: The design question.
            context: Engineering context.

        Returns:
            Design agent response.
        """
        try:
            from .design_agent import DesignAgent

            design_agent = DesignAgent(
                api_key=self.api_key,
                memory_client=self._memory_client,
            )

            full_prompt = f"Engineering context: {context}\n\nQuestion: {question}" if context else question
            result = design_agent.run(full_prompt)

            return result.content if result.success else f"Design brain error: {result.error}"

        except Exception as e:
            return f"Failed to call design brain: {str(e)}"

    def log_solution(
        self,
        problem: str,
        solution: str,
        tags: Optional[list[str]] = None,
    ) -> Optional[str]:
        """Log a solution pattern for future reference.

        Args:
            problem: The problem that was solved.
            solution: The solution that worked.
            tags: Tags for categorization.

        Returns:
            Pattern ID if logged.
        """
        if not self._memory_client:
            return None

        # Check if pattern already exists
        existing = self._memory_client.find_pattern(
            tags=tags,
            brain_type=self.BRAIN_NAME,
        )

        if existing:
            # Increment observation count
            self._memory_client.increment_pattern_observation(existing["id"])
            return existing["id"]

        # Create new pattern
        pattern = Pattern(
            brain_type=self.BRAIN_NAME,
            pattern_name=problem[:100],
            description=f"Problem: {problem}\n\nSolution: {solution}",
            trigger_conditions=[problem],
            solution_template=solution,
            tags=tags or [],
        )

        return self._memory_client.log_pattern(pattern)
