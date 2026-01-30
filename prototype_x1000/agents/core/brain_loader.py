"""Load brain CLAUDE.md files as context for agents."""

from pathlib import Path
from typing import Optional
import re


class BrainLoader:
    """Load and parse brain guidance files for agent context."""

    BRAINS_ROOT = Path(__file__).parent.parent.parent  # prototype_x1000/

    BRAIN_PATHS = {
        "engineering": "engineering_brain",
        "design": "design_brain",
        "mba": "mba_brain",
        "options_trading": "options_trading_brain",
        "ceo": "ceo_brain",
    }

    def __init__(self):
        self._cache: dict[str, str] = {}

    def load_brain(self, brain_name: str) -> str:
        """Load the CLAUDE.md for a specific brain.

        Args:
            brain_name: Name of the brain (engineering, design, mba, etc.)

        Returns:
            Contents of the brain's CLAUDE.md file.

        Raises:
            FileNotFoundError: If brain CLAUDE.md doesn't exist.
            ValueError: If brain_name is not recognized.
        """
        if brain_name not in self.BRAIN_PATHS:
            available = ", ".join(self.BRAIN_PATHS.keys())
            raise ValueError(
                f"Unknown brain: {brain_name}. Available brains: {available}"
            )

        if brain_name in self._cache:
            return self._cache[brain_name]

        brain_dir = self.BRAINS_ROOT / self.BRAIN_PATHS[brain_name]
        claude_md = brain_dir / "CLAUDE.md"

        if not claude_md.exists():
            raise FileNotFoundError(f"Brain file not found: {claude_md}")

        content = claude_md.read_text(encoding="utf-8")
        self._cache[brain_name] = content
        return content

    def load_supporting_file(self, brain_name: str, relative_path: str) -> str:
        """Load a supporting file from within a brain directory.

        Args:
            brain_name: Name of the brain.
            relative_path: Path relative to the brain directory.

        Returns:
            Contents of the file.
        """
        if brain_name not in self.BRAIN_PATHS:
            raise ValueError(f"Unknown brain: {brain_name}")

        brain_dir = self.BRAINS_ROOT / self.BRAIN_PATHS[brain_name]
        file_path = brain_dir / relative_path

        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        return file_path.read_text(encoding="utf-8")

    def extract_identity(self, brain_content: str) -> str:
        """Extract the Identity section from brain content.

        Args:
            brain_content: Full CLAUDE.md content.

        Returns:
            Identity section text.
        """
        pattern = r"## Identity\n\n(.*?)(?=\n---|\n## )"
        match = re.search(pattern, brain_content, re.DOTALL)
        if match:
            return match.group(1).strip()
        return ""

    def extract_rules(self, brain_content: str) -> list[str]:
        """Extract absolute rules from brain content.

        Args:
            brain_content: Full CLAUDE.md content.

        Returns:
            List of rules as strings.
        """
        rules: list[str] = []

        pattern = r"## Absolute Rules\n\n(.*?)(?=\n---|\n## |$)"
        match = re.search(pattern, brain_content, re.DOTALL)
        if match:
            rules_text = match.group(1)
            for line in rules_text.split("\n"):
                line = line.strip()
                if line.startswith("- "):
                    rules.append(line[2:])

        return rules

    def build_system_prompt(
        self,
        brain_name: str,
        additional_context: Optional[str] = None,
    ) -> str:
        """Build a complete system prompt for an agent using brain guidance.

        Args:
            brain_name: Name of the brain to load.
            additional_context: Extra context to append.

        Returns:
            Complete system prompt string.
        """
        brain_content = self.load_brain(brain_name)
        identity = self.extract_identity(brain_content)
        rules = self.extract_rules(brain_content)

        prompt_parts = [
            f"# {brain_name.upper()} AGENT",
            "",
            "## Identity",
            identity,
            "",
            "## Absolute Rules",
            *[f"- {rule}" for rule in rules],
            "",
            "## Full Brain Guidance",
            brain_content,
        ]

        if additional_context:
            prompt_parts.extend(["", "## Additional Context", additional_context])

        return "\n".join(prompt_parts)

    def get_available_brains(self) -> list[str]:
        """Get list of available brain names.

        Returns:
            List of brain names that have CLAUDE.md files.
        """
        available = []
        for name, path in self.BRAIN_PATHS.items():
            brain_dir = self.BRAINS_ROOT / path
            if (brain_dir / "CLAUDE.md").exists():
                available.append(name)
        return available

    def clear_cache(self) -> None:
        """Clear the brain content cache."""
        self._cache.clear()
