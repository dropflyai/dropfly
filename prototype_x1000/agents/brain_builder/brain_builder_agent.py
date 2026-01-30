"""Brain Builder Agent - Meta-agent for generating new brains."""

import os
from typing import Any, Optional
from pathlib import Path

from ..core.base_agent import BaseAgent, AgentResponse
from ..core.memory_client import SupabaseMemoryClient
from .quality_validator import QualityValidator, ValidationResult


class BrainBuilderAgent(BaseAgent):
    """Meta-agent for generating new specialist brains.

    The Brain Builder:
    1. Analyzes requirements for a new brain
    2. Studies existing brains for patterns
    3. Generates CLAUDE.md and supporting files
    4. Validates against quality standards
    5. Logs build attempts to Supabase

    Uses claude-opus-4 for best reasoning on brain design.
    """

    AGENT_TYPE = "brain_builder"
    BRAIN_NAME = "engineering"  # Use engineering brain as base
    DEFAULT_MODEL = "claude-opus-4-20250514"

    def __init__(
        self,
        model: Optional[str] = None,
        api_key: Optional[str] = None,
        memory_client: Optional[SupabaseMemoryClient] = None,
        auto_log: bool = True,
        brains_root: Optional[Path] = None,
    ):
        """Initialize the Brain Builder agent.

        Args:
            model: Model to use. Defaults to claude-opus-4.
            api_key: Anthropic API key.
            memory_client: Supabase client for logging.
            auto_log: Whether to auto-log runs.
            brains_root: Root directory for brains.
        """
        super().__init__(
            model=model,
            api_key=api_key,
            memory_client=memory_client,
            auto_log=auto_log,
        )

        self.brains_root = brains_root or Path(__file__).parent.parent.parent
        self.validator = QualityValidator(self.brains_root)
        self._register_builder_tools()

    def _get_agent_instructions(self) -> str:
        """Return brain builder-specific instructions."""
        return """You are the Brain Builder Agent - a meta-agent that creates new specialist brains.

Your role:
1. Analyze requirements for new specialist brains
2. Study the structure and patterns of existing brains
3. Generate high-quality CLAUDE.md files
4. Create supporting folders and files
5. Validate output against quality standards

Reference brains to study:
- engineering_brain: Code, infrastructure, automation
- design_brain: UI/UX, visual design, accessibility
- mba_brain: Business strategy, operations

Quality requirements:
- CLAUDE.md must have all required sections
- Identity must clearly define specialist role
- Authority Hierarchy must be established
- Absolute Rules must be comprehensive
- COMMIT RULE must require user approval
- Calling Other Brains section for inter-brain communication

Tools available:
- read_reference_brain: Read existing brain files for reference
- generate_claude_md: Create CLAUDE.md for new brain
- create_brain_folder: Create brain directory structure
- validate_brain: Run quality validation
- log_brain_build: Record build attempt to database

Process:
1. Read reference brains to understand patterns
2. Generate CLAUDE.md with all required sections
3. Create folder structure
4. Validate against quality standards
5. Iterate if validation fails
"""

    def _register_builder_tools(self) -> None:
        """Register brain builder-specific tools."""
        self.register_tool(
            name="read_reference_brain",
            description="Read a reference brain's CLAUDE.md for patterns",
            input_schema={
                "type": "object",
                "properties": {
                    "brain_name": {
                        "type": "string",
                        "enum": ["engineering", "design", "mba"],
                        "description": "Reference brain to read",
                    },
                },
                "required": ["brain_name"],
            },
            handler=self._read_reference_brain,
        )

        self.register_tool(
            name="generate_claude_md",
            description="Generate CLAUDE.md content for a new brain",
            input_schema={
                "type": "object",
                "properties": {
                    "brain_name": {
                        "type": "string",
                        "description": "Name of the brain (e.g., 'product')",
                    },
                    "domain": {
                        "type": "string",
                        "description": "Domain of expertise",
                    },
                    "capabilities": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of capabilities",
                    },
                    "senior_role": {
                        "type": "string",
                        "description": "Senior role title (e.g., 'senior product manager')",
                    },
                },
                "required": ["brain_name", "domain", "capabilities"],
            },
            handler=self._generate_claude_md,
        )

        self.register_tool(
            name="create_brain_folder",
            description="Create brain directory structure",
            input_schema={
                "type": "object",
                "properties": {
                    "brain_name": {
                        "type": "string",
                        "description": "Name of the brain",
                    },
                    "claude_md_content": {
                        "type": "string",
                        "description": "Content for CLAUDE.md",
                    },
                    "additional_folders": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "Additional folders to create",
                    },
                },
                "required": ["brain_name", "claude_md_content"],
            },
            handler=self._create_brain_folder,
        )

        self.register_tool(
            name="validate_brain",
            description="Validate a brain against quality standards",
            input_schema={
                "type": "object",
                "properties": {
                    "brain_name": {
                        "type": "string",
                        "description": "Name of the brain to validate",
                    },
                },
                "required": ["brain_name"],
            },
            handler=self._validate_brain,
        )

        self.register_tool(
            name="get_template_structure",
            description="Get the template structure for a new brain",
            input_schema={
                "type": "object",
                "properties": {},
            },
            handler=self._get_template_structure,
        )

    def _read_reference_brain(self, brain_name: str) -> str:
        """Read a reference brain's CLAUDE.md.

        Args:
            brain_name: Name of the brain.

        Returns:
            CLAUDE.md content.
        """
        brain_dir = self.brains_root / f"{brain_name}_brain"
        claude_md = brain_dir / "CLAUDE.md"

        if not claude_md.exists():
            return f"Reference brain not found: {brain_name}"

        return claude_md.read_text(encoding="utf-8")

    def _generate_claude_md(
        self,
        brain_name: str,
        domain: str,
        capabilities: list[str],
        senior_role: Optional[str] = None,
    ) -> str:
        """Generate CLAUDE.md content for a new brain.

        Args:
            brain_name: Name of the brain.
            domain: Domain of expertise.
            capabilities: List of capabilities.
            senior_role: Senior role title.

        Returns:
            Generated CLAUDE.md content.
        """
        role = senior_role or f"senior {domain} specialist"
        cap_list = "\n".join(f"- {cap}" for cap in capabilities)
        brain_title = brain_name.upper()

        content = f"""# {brain_title} BRAIN — Authoritative Operating System

This file governs all {domain} work when operating within this brain.

---

## Identity

You are the **{brain_name.title()} Brain** — a specialist system for:
{cap_list}

You operate as a **{role}** at all times.

---

## Authority Hierarchy

1. `CLAUDE.md` — This file (highest authority)
2. Domain-specific protocols and patterns

Lower levels may not contradict higher levels.

---

## Mandatory Preflight (Before Any Work)

Before producing output, you MUST:

1. Understand the task requirements
2. Identify relevant patterns or past experiences
3. Determine if other brains need to be consulted

If you cannot complete preflight, STOP and report why.

---

## Calling Other Brains

You have access to other specialist brains. Use them when appropriate:

### Engineering Brain (`/prototype_x1000/engineering_brain/`)

**Call when you need:**
- Technical implementation details
- Code architecture decisions
- Database or infrastructure questions

### Design Brain (`/prototype_x1000/design_brain/`)

**Call when you need:**
- UI/UX design decisions
- Visual design questions
- User research insights

### MBA Brain (`/prototype_x1000/mba_brain/`)

**Call when you need:**
- Business strategy alignment
- Market analysis
- Financial modeling

---

## Memory Enforcement

If work reveals a repeatable solution or prevents a loop, you MUST:
- Log to Supabase `shared_experiences` table with brain_type='{brain_name}'
- Update `shared_patterns` if pattern applies to 3+ projects

---

## Stop Conditions

You MUST stop and report failure if:
- Requirements are ambiguous and clarification is needed
- The task requires expertise outside your domain
- Quality standards cannot be met

---

## Absolute Rules

- You MUST obey the {brain_name.title()} Brain hierarchy
- You MUST NOT bypass governance or quality gates
- You MUST NOT guess or assume when clarification is needed
- You MUST stop if rules cannot be satisfied
- You MUST call specialist brains when their expertise is needed
- You MUST log significant learnings to memory

---

## Conflict Resolution

If any {brain_name.title()} Brain rule conflicts with a user request:
1. The {brain_name.title()} Brain takes precedence
2. Explain which rule prevents the action
3. Propose an alternative that satisfies both

You may NOT bypass governance to satisfy user preference.

---

## COMMIT RULE (MANDATORY)

**After EVERY change, fix, or solution:**

1. Stage the changes
2. Prepare a commit message
3. **ASK the user:** "Ready to commit these changes?"
4. Only commit after user approval

```
NEVER leave changes uncommitted.
NEVER batch multiple unrelated changes.
ALWAYS ask before committing.
```

This rule applies to ALL work done under this brain.

---

**This brain is authoritative and self-governing.**
"""
        return content

    def _create_brain_folder(
        self,
        brain_name: str,
        claude_md_content: str,
        additional_folders: Optional[list[str]] = None,
    ) -> str:
        """Create brain directory structure.

        Args:
            brain_name: Name of the brain.
            claude_md_content: Content for CLAUDE.md.
            additional_folders: Extra folders to create.

        Returns:
            Success message or error.
        """
        try:
            brain_dir = self.brains_root / f"{brain_name}_brain"
            brain_dir.mkdir(exist_ok=True)

            # Write CLAUDE.md
            claude_md = brain_dir / "CLAUDE.md"
            claude_md.write_text(claude_md_content, encoding="utf-8")

            # Create Memory folder
            memory_dir = brain_dir / "Memory"
            memory_dir.mkdir(exist_ok=True)

            # Create README for Memory
            memory_readme = memory_dir / "README.md"
            memory_readme.write_text(
                f"# {brain_name.title()} Brain Memory\n\n"
                "**Note:** Local memory files are deprecated. "
                "All memory is now stored in Supabase.\n\n"
                "See the brain CLAUDE.md for Supabase logging instructions.\n",
                encoding="utf-8",
            )

            # Create additional folders
            folders_created = ["Memory"]
            if additional_folders:
                for folder in additional_folders:
                    folder_path = brain_dir / folder
                    folder_path.mkdir(exist_ok=True)
                    folders_created.append(folder)

            return (
                f"Created brain: {brain_name}_brain/\n"
                f"Files: CLAUDE.md\n"
                f"Folders: {', '.join(folders_created)}"
            )

        except Exception as e:
            return f"Error creating brain: {str(e)}"

    def _validate_brain(self, brain_name: str) -> str:
        """Validate a brain against quality standards.

        Args:
            brain_name: Name of the brain.

        Returns:
            Validation report.
        """
        result = self.validator.validate_brain(brain_name)

        report = f"# Validation Report: {brain_name}_brain\n\n"
        report += f"**Score:** {result.score:.0f}/100\n"
        report += f"**Passed:** {'Yes' if result.passed else 'No'}\n\n"

        if result.errors:
            report += "## Errors (must fix)\n"
            for error in result.errors:
                report += f"- {error}\n"
            report += "\n"

        if result.warnings:
            report += "## Warnings (should fix)\n"
            for warning in result.warnings:
                report += f"- {warning}\n"
            report += "\n"

        if result.suggestions:
            report += "## Suggestions (nice to have)\n"
            for suggestion in result.suggestions:
                report += f"- {suggestion}\n"

        return report

    def _get_template_structure(self) -> str:
        """Get the template structure for a new brain."""
        return self.validator.get_template_structure()

    def build_brain(
        self,
        brain_name: str,
        domain: str,
        capabilities: list[str],
        senior_role: Optional[str] = None,
        additional_folders: Optional[list[str]] = None,
        max_iterations: int = 3,
    ) -> dict[str, Any]:
        """Build a new brain with validation.

        Args:
            brain_name: Name of the brain (e.g., 'product').
            domain: Domain of expertise.
            capabilities: List of capabilities.
            senior_role: Senior role title.
            additional_folders: Extra folders to create.
            max_iterations: Max validation retries.

        Returns:
            Build result with validation status.
        """
        files_created: list[str] = []

        # Generate CLAUDE.md
        claude_content = self._generate_claude_md(
            brain_name=brain_name,
            domain=domain,
            capabilities=capabilities,
            senior_role=senior_role,
        )

        # Create folder structure
        create_result = self._create_brain_folder(
            brain_name=brain_name,
            claude_md_content=claude_content,
            additional_folders=additional_folders,
        )

        if "Error" in create_result:
            return {
                "success": False,
                "error": create_result,
                "files_created": [],
                "validation": None,
            }

        files_created = [
            f"{brain_name}_brain/CLAUDE.md",
            f"{brain_name}_brain/Memory/README.md",
        ]
        if additional_folders:
            files_created.extend(
                f"{brain_name}_brain/{folder}" for folder in additional_folders
            )

        # Validate
        validation = self.validator.validate_brain(brain_name)

        # Log to Supabase
        if self._memory_client:
            self._memory_client.log_brain_build(
                brain_name=brain_name,
                validation_passed=validation.passed,
                files_created=files_created,
                validation_errors=validation.errors,
            )

        return {
            "success": validation.passed,
            "files_created": files_created,
            "validation": {
                "passed": validation.passed,
                "score": validation.score,
                "errors": validation.errors,
                "warnings": validation.warnings,
                "suggestions": validation.suggestions,
            },
        }

    def run(
        self,
        task: str,
        context: Optional[str] = None,
        max_iterations: int = 10,
    ) -> AgentResponse:
        """Run the Brain Builder on a task.

        For brain building tasks, this provides a high-level interface.

        Args:
            task: Task description (e.g., "Build the product brain").
            context: Additional context.
            max_iterations: Max tool iterations.

        Returns:
            AgentResponse with build results.
        """
        # Use parent's run method which has tool support
        return super().run(task, context, max_iterations)
