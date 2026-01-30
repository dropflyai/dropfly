"""Pattern extraction from agent experiences."""

from typing import Any, Optional
from collections import Counter
import re

from ..core.memory_client import SupabaseMemoryClient, Pattern


class PatternExtractor:
    """Extract reusable patterns from agent experiences.

    Analyzes shared_experiences to identify:
    - Recurring solutions (3+ similar observations)
    - Common failure modes
    - Cross-brain patterns

    Automatically promotes patterns to shared_patterns table
    when threshold is reached.
    """

    # Minimum observations before promoting to pattern
    DEFAULT_THRESHOLD = 3

    def __init__(
        self,
        memory_client: SupabaseMemoryClient,
        threshold: int = DEFAULT_THRESHOLD,
    ):
        """Initialize the pattern extractor.

        Args:
            memory_client: Supabase client for data access.
            threshold: Min observations to become a pattern.
        """
        self.memory_client = memory_client
        self.threshold = threshold

    def extract_patterns(
        self,
        brain_type: Optional[str] = None,
        limit: int = 100,
    ) -> list[dict[str, Any]]:
        """Extract patterns from recent experiences.

        Args:
            brain_type: Filter by brain type.
            limit: Max experiences to analyze.

        Returns:
            List of potential patterns.
        """
        # Get recent experiences
        experiences = self.memory_client.search_experiences(
            brain_type=brain_type,
            category="success",
            limit=limit,
        )

        if not experiences:
            return []

        # Group by similar task summaries
        groups = self._group_similar_tasks(experiences)

        patterns = []
        for group_key, group_experiences in groups.items():
            if len(group_experiences) >= self.threshold:
                pattern = self._create_pattern_from_group(
                    group_key,
                    group_experiences,
                    brain_type or "shared",
                )
                patterns.append(pattern)

        return patterns

    def _group_similar_tasks(
        self,
        experiences: list[dict[str, Any]],
    ) -> dict[str, list[dict[str, Any]]]:
        """Group experiences by similar task summaries.

        Args:
            experiences: List of experience records.

        Returns:
            Dict mapping normalized keys to experience lists.
        """
        groups: dict[str, list[dict[str, Any]]] = {}

        for exp in experiences:
            summary = exp.get("task_summary", "")
            key = self._normalize_for_grouping(summary)

            if key not in groups:
                groups[key] = []
            groups[key].append(exp)

        return groups

    def _normalize_for_grouping(self, text: str) -> str:
        """Normalize text for grouping similar tasks.

        Args:
            text: Task summary text.

        Returns:
            Normalized key for grouping.
        """
        # Convert to lowercase
        text = text.lower()

        # Remove specific identifiers (UUIDs, numbers, etc.)
        text = re.sub(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", "[id]", text)
        text = re.sub(r"\b\d+\b", "[num]", text)

        # Remove project-specific names (quoted strings)
        text = re.sub(r'"[^"]*"', "[name]", text)
        text = re.sub(r"'[^']*'", "[name]", text)

        # Normalize whitespace
        text = " ".join(text.split())

        return text

    def _create_pattern_from_group(
        self,
        group_key: str,
        experiences: list[dict[str, Any]],
        brain_type: str,
    ) -> dict[str, Any]:
        """Create a pattern from a group of similar experiences.

        Args:
            group_key: Normalized grouping key.
            experiences: List of similar experiences.
            brain_type: Brain type for the pattern.

        Returns:
            Pattern dictionary.
        """
        # Extract common tags
        all_tags: list[str] = []
        for exp in experiences:
            all_tags.extend(exp.get("tags", []))
        common_tags = [
            tag for tag, count in Counter(all_tags).items()
            if count >= len(experiences) // 2
        ]

        # Extract common solutions
        solutions = [
            exp.get("solution", "")
            for exp in experiences
            if exp.get("solution")
        ]

        # Get most representative solution
        representative_solution = max(solutions, key=len) if solutions else ""

        # Get example usages (task summaries)
        example_usages = [
            exp.get("task_summary", "")
            for exp in experiences[:3]
        ]

        return {
            "pattern_name": self._generate_pattern_name(group_key),
            "description": f"Pattern observed in {len(experiences)} experiences: {group_key}",
            "brain_type": brain_type,
            "trigger_conditions": [group_key],
            "solution_template": representative_solution,
            "example_usages": example_usages,
            "observation_count": len(experiences),
            "tags": common_tags,
        }

    def _generate_pattern_name(self, group_key: str) -> str:
        """Generate a pattern name from group key.

        Args:
            group_key: Normalized grouping key.

        Returns:
            Human-readable pattern name.
        """
        # Extract key words
        words = group_key.split()[:5]
        name = " ".join(words).title()

        # Truncate if too long
        if len(name) > 50:
            name = name[:47] + "..."

        return name

    def promote_to_shared_patterns(
        self,
        brain_type: Optional[str] = None,
        dry_run: bool = False,
    ) -> list[str]:
        """Promote qualifying patterns to shared_patterns table.

        Args:
            brain_type: Filter by brain type.
            dry_run: If True, don't actually save.

        Returns:
            List of pattern IDs created.
        """
        patterns = self.extract_patterns(brain_type)
        created_ids: list[str] = []

        for pattern_data in patterns:
            # Check if pattern already exists
            existing = self.memory_client.find_pattern(
                pattern_name=pattern_data["pattern_name"],
                brain_type=pattern_data["brain_type"],
            )

            if existing:
                # Update observation count
                if not dry_run:
                    self.memory_client.increment_pattern_observation(existing["id"])
                continue

            # Create new pattern
            if not dry_run:
                pattern = Pattern(
                    brain_type=pattern_data["brain_type"],
                    pattern_name=pattern_data["pattern_name"],
                    description=pattern_data["description"],
                    trigger_conditions=pattern_data["trigger_conditions"],
                    solution_template=pattern_data["solution_template"],
                    example_usages=pattern_data["example_usages"],
                    observation_count=pattern_data["observation_count"],
                    tags=pattern_data["tags"],
                )
                pattern_id = self.memory_client.log_pattern(pattern)
                created_ids.append(pattern_id)

        return created_ids

    def get_relevant_patterns(
        self,
        task: str,
        brain_type: Optional[str] = None,
        min_observations: int = 2,
    ) -> list[dict[str, Any]]:
        """Get patterns relevant to a task.

        Args:
            task: Task description.
            brain_type: Filter by brain type.
            min_observations: Minimum observation count.

        Returns:
            List of relevant patterns.
        """
        # Get established patterns
        patterns = self.memory_client.get_established_patterns(
            min_observations=min_observations,
            brain_type=brain_type,
        )

        # Score relevance
        task_normalized = self._normalize_for_grouping(task)
        task_words = set(task_normalized.split())

        scored_patterns = []
        for pattern in patterns:
            trigger_words = set()
            for condition in pattern.get("trigger_conditions", []):
                trigger_words.update(condition.split())

            # Calculate overlap
            overlap = len(task_words & trigger_words)
            if overlap > 0:
                score = overlap / max(len(task_words), len(trigger_words))
                scored_patterns.append((score, pattern))

        # Sort by relevance score
        scored_patterns.sort(key=lambda x: x[0], reverse=True)

        return [p for _, p in scored_patterns[:5]]

    def analyze_failures(
        self,
        brain_type: Optional[str] = None,
        limit: int = 50,
    ) -> dict[str, Any]:
        """Analyze failure patterns.

        Args:
            brain_type: Filter by brain type.
            limit: Max failures to analyze.

        Returns:
            Failure analysis report.
        """
        failures = self.memory_client.search_experiences(
            brain_type=brain_type,
            category="failure",
            limit=limit,
        )

        if not failures:
            return {
                "total_failures": 0,
                "common_problems": [],
                "recommendations": [],
            }

        # Extract problems
        problems = [f.get("problem", "") for f in failures if f.get("problem")]

        # Group similar problems
        problem_groups = self._group_similar_tasks(
            [{"task_summary": p} for p in problems]
        )

        # Get most common
        common_problems = sorted(
            [
                {"problem": key, "count": len(items)}
                for key, items in problem_groups.items()
            ],
            key=lambda x: x["count"],
            reverse=True,
        )[:5]

        # Extract lessons
        lessons = [
            f.get("lessons_learned", "")
            for f in failures
            if f.get("lessons_learned")
        ]

        return {
            "total_failures": len(failures),
            "common_problems": common_problems,
            "lessons_learned": lessons[:10],
            "recommendations": [
                "Review common problems for systemic issues",
                "Consider adding guardrails for top failure modes",
                "Update brain guidance with learned lessons",
            ],
        }

    def cross_brain_analysis(self, limit: int = 100) -> dict[str, Any]:
        """Analyze patterns across all brains.

        Args:
            limit: Max experiences per brain.

        Returns:
            Cross-brain analysis report.
        """
        brain_types = ["engineering", "design", "mba"]
        cross_patterns: list[dict] = []

        # Get patterns from each brain
        brain_patterns: dict[str, list[dict]] = {}
        for brain_type in brain_types:
            patterns = self.extract_patterns(brain_type, limit)
            brain_patterns[brain_type] = patterns

        # Find patterns that appear across brains
        all_keys = set()
        for patterns in brain_patterns.values():
            for p in patterns:
                all_keys.add(p["pattern_name"])

        for key in all_keys:
            brains_with_pattern = [
                bt for bt, patterns in brain_patterns.items()
                if any(p["pattern_name"] == key for p in patterns)
            ]

            if len(brains_with_pattern) > 1:
                cross_patterns.append({
                    "pattern": key,
                    "brains": brains_with_pattern,
                })

        return {
            "brain_patterns": {
                bt: len(patterns) for bt, patterns in brain_patterns.items()
            },
            "cross_brain_patterns": cross_patterns,
            "total_unique_patterns": len(all_keys),
        }
