"""Quality validation for generated brains."""

from typing import Any, Optional
from pathlib import Path
from dataclasses import dataclass, field
import re


@dataclass
class ValidationResult:
    """Result of brain validation."""

    passed: bool
    score: float  # 0-100
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    suggestions: list[str] = field(default_factory=list)


class QualityValidator:
    """Validate generated brains against quality standards.

    Ensures new brains match the quality and structure of existing
    complete brains (engineering, design, mba).
    """

    # Required sections in CLAUDE.md
    REQUIRED_SECTIONS = [
        "Identity",
        "Authority Hierarchy",
        "Absolute Rules",
        "COMMIT RULE",
    ]

    # Required files in a brain directory
    REQUIRED_FILES = [
        "CLAUDE.md",
    ]

    # Recommended sections (not required but add points)
    RECOMMENDED_SECTIONS = [
        "Calling Other Brains",
        "Memory Enforcement",
        "Stop Conditions",
        "Conflict Resolution",
    ]

    def __init__(self, brains_root: Optional[Path] = None):
        """Initialize the validator.

        Args:
            brains_root: Root directory of all brains.
        """
        self.brains_root = brains_root or Path(__file__).parent.parent.parent

    def validate_brain(self, brain_name: str) -> ValidationResult:
        """Validate a brain's structure and content.

        Args:
            brain_name: Name of the brain to validate.

        Returns:
            ValidationResult with score and feedback.
        """
        brain_dir = self.brains_root / f"{brain_name}_brain"

        errors: list[str] = []
        warnings: list[str] = []
        suggestions: list[str] = []
        score = 100.0

        # Check brain directory exists
        if not brain_dir.exists():
            return ValidationResult(
                passed=False,
                score=0,
                errors=[f"Brain directory not found: {brain_dir}"],
            )

        # Check required files
        for required_file in self.REQUIRED_FILES:
            file_path = brain_dir / required_file
            if not file_path.exists():
                errors.append(f"Missing required file: {required_file}")
                score -= 25

        # Validate CLAUDE.md content
        claude_md = brain_dir / "CLAUDE.md"
        if claude_md.exists():
            content = claude_md.read_text(encoding="utf-8")
            claude_result = self._validate_claude_md(content)
            errors.extend(claude_result.errors)
            warnings.extend(claude_result.warnings)
            suggestions.extend(claude_result.suggestions)
            score = min(score, claude_result.score)

        # Check for Memory folder (recommended)
        memory_dir = brain_dir / "Memory"
        if not memory_dir.exists():
            suggestions.append("Consider adding a Memory/ folder for experience logs")

        # Ensure score is not negative
        score = max(0, score)
        passed = len(errors) == 0 and score >= 70

        return ValidationResult(
            passed=passed,
            score=score,
            errors=errors,
            warnings=warnings,
            suggestions=suggestions,
        )

    def _validate_claude_md(self, content: str) -> ValidationResult:
        """Validate CLAUDE.md content.

        Args:
            content: CLAUDE.md file content.

        Returns:
            ValidationResult for the file.
        """
        errors: list[str] = []
        warnings: list[str] = []
        suggestions: list[str] = []
        score = 100.0

        # Check required sections
        for section in self.REQUIRED_SECTIONS:
            if f"## {section}" not in content:
                errors.append(f"Missing required section: ## {section}")
                score -= 15

        # Check recommended sections
        for section in self.RECOMMENDED_SECTIONS:
            if f"## {section}" not in content:
                warnings.append(f"Missing recommended section: ## {section}")
                score -= 5

        # Check for Identity section content
        identity_match = re.search(
            r"## Identity\n\n(.*?)(?=\n## |\n---)",
            content,
            re.DOTALL,
        )
        if identity_match:
            identity_content = identity_match.group(1)
            if len(identity_content) < 100:
                warnings.append("Identity section is very brief")
                score -= 5
            if "specialist" not in identity_content.lower() and "expert" not in identity_content.lower():
                suggestions.append("Consider explicitly stating the brain's specialist role")
        else:
            errors.append("Identity section has no content")
            score -= 10

        # Check for Absolute Rules
        rules_match = re.search(
            r"## Absolute Rules\n\n(.*?)(?=\n## |\n---|\Z)",
            content,
            re.DOTALL,
        )
        if rules_match:
            rules_content = rules_match.group(1)
            rule_count = rules_content.count("- ")
            if rule_count < 3:
                warnings.append(f"Only {rule_count} absolute rules defined (recommend 5+)")
                score -= 5
        else:
            errors.append("Absolute Rules section has no content")
            score -= 10

        # Check COMMIT RULE
        if "ASK the user" not in content and "ask before committing" not in content.lower():
            warnings.append("COMMIT RULE should include user approval step")
            score -= 5

        # Check for placeholder content
        placeholder_patterns = [
            r"\[TODO\]",
            r"\[PLACEHOLDER\]",
            r"XXX",
            r"FIXME",
        ]
        for pattern in placeholder_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                errors.append(f"Contains placeholder content: {pattern}")
                score -= 10

        # Check minimum length
        if len(content) < 1000:
            warnings.append("CLAUDE.md is very short - consider adding more detail")
            score -= 10

        return ValidationResult(
            passed=len(errors) == 0,
            score=max(0, score),
            errors=errors,
            warnings=warnings,
            suggestions=suggestions,
        )

    def validate_against_reference(
        self,
        brain_name: str,
        reference_brain: str = "engineering",
    ) -> ValidationResult:
        """Validate a brain against a reference brain.

        Args:
            brain_name: Brain to validate.
            reference_brain: Brain to compare against.

        Returns:
            ValidationResult with comparison feedback.
        """
        brain_dir = self.brains_root / f"{brain_name}_brain"
        reference_dir = self.brains_root / f"{reference_brain}_brain"

        if not reference_dir.exists():
            return ValidationResult(
                passed=False,
                score=0,
                errors=[f"Reference brain not found: {reference_brain}"],
            )

        errors: list[str] = []
        warnings: list[str] = []
        suggestions: list[str] = []

        # Compare structure
        ref_dirs = {d.name for d in reference_dir.iterdir() if d.is_dir()}
        brain_dirs = {d.name for d in brain_dir.iterdir() if d.is_dir()} if brain_dir.exists() else set()

        missing_dirs = ref_dirs - brain_dirs - {"Memory"}  # Memory is optional
        if missing_dirs:
            for d in missing_dirs:
                suggestions.append(f"Reference brain has {d}/ folder - consider adding")

        # Compare CLAUDE.md structure
        ref_claude = reference_dir / "CLAUDE.md"
        brain_claude = brain_dir / "CLAUDE.md"

        if ref_claude.exists() and brain_claude.exists():
            ref_sections = set(re.findall(r"^## (.+)$", ref_claude.read_text(), re.MULTILINE))
            brain_sections = set(re.findall(r"^## (.+)$", brain_claude.read_text(), re.MULTILINE))

            missing_sections = ref_sections - brain_sections
            for section in missing_sections:
                if section not in self.REQUIRED_SECTIONS:
                    suggestions.append(f"Reference has '## {section}' - consider adding")

        # Score based on structural similarity
        score = 100.0
        score -= len(errors) * 15
        score -= len(warnings) * 5
        score -= len(suggestions) * 2

        return ValidationResult(
            passed=len(errors) == 0,
            score=max(0, score),
            errors=errors,
            warnings=warnings,
            suggestions=suggestions,
        )

    def get_template_structure(self) -> str:
        """Get the recommended brain structure as a template.

        Returns:
            Template string for new brains.
        """
        return """# [BRAIN_NAME] BRAIN — Authoritative Operating System

This file governs all [domain] work when operating within this brain.

---

## Identity

You are the **[Brain Name] Brain** — a specialist system for:
- [Capability 1]
- [Capability 2]
- [Capability 3]

You operate as a **[senior role]** at all times.

---

## Authority Hierarchy

1. `CLAUDE.md` — This file (highest authority)
2. [Additional governance files]

Lower levels may not contradict higher levels.

---

## Calling Other Brains

You have access to other specialist brains. Use them when appropriate:

### Engineering Brain (`/prototype_x1000/engineering_brain/`)

**Call when you need:**
- Technical implementation
- Code architecture
- Infrastructure

### Design Brain (`/prototype_x1000/design_brain/`)

**Call when you need:**
- UI/UX decisions
- Visual design
- User research

---

## Memory Enforcement

If work reveals a repeatable solution, you MUST:
- Log to Supabase `shared_experiences` table
- Update patterns if applicable

---

## Stop Conditions

You MUST stop and report failure if:
- [Condition 1]
- [Condition 2]

---

## Absolute Rules

- You MUST obey the brain hierarchy
- You MUST NOT bypass governance
- You MUST NOT guess or assume
- You MUST stop if rules cannot be satisfied
- You MUST call specialist brains when their expertise is needed

---

## Conflict Resolution

If any rule conflicts with a user request:
1. The brain takes precedence
2. Explain which rule prevents the action
3. Propose an alternative

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

---

**This brain is authoritative and self-governing.**
"""
