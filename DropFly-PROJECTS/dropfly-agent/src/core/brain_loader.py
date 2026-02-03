"""Load brain CLAUDE.md files as context for agents.

Enhanced from prototype_x1000 — now auto-discovers all brains in the brains root
directory instead of maintaining a hardcoded map.
"""

from __future__ import annotations

import logging
import re
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


class BrainLoader:
    """Load and parse brain guidance files.

    Auto-discovers all brains by scanning for directories ending in '_brain'
    that contain a CLAUDE.md file.
    """

    def __init__(self, brains_root: str | Path | None = None):
        if brains_root:
            self._root = Path(brains_root)
        else:
            # Default: prototype_x1000/ relative to this project
            self._root = Path(__file__).parent.parent.parent.parent / "prototype_x1000"

        self._cache: dict[str, str] = {}
        self._brain_paths: dict[str, Path] | None = None

    @property
    def brain_paths(self) -> dict[str, Path]:
        """Auto-discover all brain directories."""
        if self._brain_paths is None:
            self._brain_paths = {}
            if self._root.exists():
                for item in sorted(self._root.iterdir()):
                    if item.is_dir() and item.name.endswith("_brain"):
                        claude_md = item / "CLAUDE.md"
                        if claude_md.exists():
                            # Convert "engineering_brain" -> "engineering"
                            brain_name = item.name.replace("_brain", "")
                            self._brain_paths[brain_name] = item
            logger.info(f"Discovered {len(self._brain_paths)} brains")
        return self._brain_paths

    def load_brain(self, brain_name: str) -> str:
        """Load the CLAUDE.md for a specific brain.

        Args:
            brain_name: Name of the brain (e.g., "engineering", "design").

        Returns:
            Contents of the brain's CLAUDE.md.

        Raises:
            FileNotFoundError: If brain doesn't exist.
        """
        if brain_name in self._cache:
            return self._cache[brain_name]

        if brain_name not in self.brain_paths:
            available = ", ".join(sorted(self.brain_paths.keys()))
            raise FileNotFoundError(
                f"Brain '{brain_name}' not found. Available: {available}"
            )

        claude_md = self.brain_paths[brain_name] / "CLAUDE.md"
        content = claude_md.read_text(encoding="utf-8")
        self._cache[brain_name] = content
        return content

    def load_supporting_file(self, brain_name: str, relative_path: str) -> str:
        """Load a supporting file from within a brain directory."""
        if brain_name not in self.brain_paths:
            raise FileNotFoundError(f"Brain '{brain_name}' not found")

        file_path = self.brain_paths[brain_name] / relative_path
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        return file_path.read_text(encoding="utf-8")

    def extract_identity(self, brain_content: str) -> str:
        """Extract the Identity section from brain content."""
        pattern = r"## Identity\n\n(.*?)(?=\n---|\n## )"
        match = re.search(pattern, brain_content, re.DOTALL)
        return match.group(1).strip() if match else ""

    def extract_rules(self, brain_content: str) -> list[str]:
        """Extract absolute rules from brain content."""
        rules: list[str] = []
        pattern = r"## Absolute Rules\n\n(.*?)(?=\n---|\n## |$)"
        match = re.search(pattern, brain_content, re.DOTALL)
        if match:
            for line in match.group(1).split("\n"):
                line = line.strip()
                if line.startswith("- "):
                    rules.append(line[2:])
        return rules

    def extract_section(self, brain_content: str, section_name: str) -> str:
        """Extract any named section from brain content."""
        pattern = rf"## {re.escape(section_name)}\n\n(.*?)(?=\n---|\n## |$)"
        match = re.search(pattern, brain_content, re.DOTALL)
        return match.group(1).strip() if match else ""

    def build_system_prompt(
        self,
        brain_name: str,
        additional_context: str | None = None,
    ) -> str:
        """Build a complete system prompt using brain guidance.

        Args:
            brain_name: Brain to load.
            additional_context: Extra context to append.

        Returns:
            Complete system prompt.
        """
        brain_content = self.load_brain(brain_name)
        identity = self.extract_identity(brain_content)
        rules = self.extract_rules(brain_content)

        parts = [
            f"# {brain_name.upper()} AGENT",
            "",
            "## Identity",
            identity,
            "",
        ]

        if rules:
            parts.extend(["## Absolute Rules", *[f"- {rule}" for rule in rules], ""])

        parts.extend(["## Full Brain Guidance", brain_content])

        if additional_context:
            parts.extend(["", "## Additional Context", additional_context])

        return "\n".join(parts)

    def get_available_brains(self) -> list[str]:
        """Get list of available brain names."""
        return sorted(self.brain_paths.keys())

    def get_brain_summary(self, brain_name: str) -> dict[str, str]:
        """Get a summary of a brain (identity + rules)."""
        try:
            content = self.load_brain(brain_name)
            return {
                "name": brain_name,
                "identity": self.extract_identity(content)[:200],
                "rules_count": str(len(self.extract_rules(content))),
                "path": str(self.brain_paths.get(brain_name, "")),
            }
        except FileNotFoundError:
            return {"name": brain_name, "error": "not found"}

    def clear_cache(self) -> None:
        """Clear the brain content cache."""
        self._cache.clear()
        self._brain_paths = None
