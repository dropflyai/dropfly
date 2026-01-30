"""Brain selection and routing logic for CEO agent."""

from typing import Any, Optional
from dataclasses import dataclass
from enum import Enum


class BrainType(Enum):
    """Available brain types in the system."""

    ENGINEERING = "engineering"
    DESIGN = "design"
    MBA = "mba"
    OPTIONS_TRADING = "options_trading"
    PRODUCT = "product"
    CEO = "ceo"
    BRAIN_BUILDER = "brain_builder"


@dataclass
class BrainCapability:
    """Describes what a brain can do."""

    brain_type: BrainType
    keywords: list[str]
    description: str
    can_delegate_to: list[BrainType]
    model_preference: str  # sonnet or opus


class BrainSelector:
    """Select and route tasks to appropriate brain agents.

    Uses keyword matching and heuristics for fast routing decisions.
    For complex routing, the CEO agent can use Claude to make decisions.
    """

    BRAIN_CAPABILITIES = {
        BrainType.ENGINEERING: BrainCapability(
            brain_type=BrainType.ENGINEERING,
            keywords=[
                "code",
                "api",
                "database",
                "deploy",
                "bug",
                "test",
                "backend",
                "frontend",
                "server",
                "endpoint",
                "function",
                "class",
                "module",
                "package",
                "build",
                "compile",
                "debug",
                "refactor",
                "migrate",
                "schema",
                "query",
                "orm",
                "rest",
                "graphql",
                "webhook",
                "ci",
                "cd",
                "docker",
                "kubernetes",
                "aws",
                "infrastructure",
                "script",
                "automation",
                "performance",
                "security",
                "authentication",
                "authorization",
            ],
            description="Code, APIs, databases, infrastructure, DevOps, automation",
            can_delegate_to=[BrainType.DESIGN],
            model_preference="sonnet",
        ),
        BrainType.DESIGN: BrainCapability(
            brain_type=BrainType.DESIGN,
            keywords=[
                "design",
                "ui",
                "ux",
                "layout",
                "color",
                "font",
                "typography",
                "wireframe",
                "mockup",
                "component",
                "interface",
                "visual",
                "brand",
                "logo",
                "icon",
                "illustration",
                "spacing",
                "grid",
                "responsive",
                "mobile",
                "accessibility",
                "a11y",
                "wcag",
                "persona",
                "user research",
                "journey",
                "flow",
                "onboarding",
                "empty state",
                "error state",
                "loading",
                "animation",
                "motion",
                "prototype",
            ],
            description="UI/UX, visual design, user research, information architecture",
            can_delegate_to=[BrainType.ENGINEERING],
            model_preference="sonnet",
        ),
        BrainType.MBA: BrainCapability(
            brain_type=BrainType.MBA,
            keywords=[
                "business",
                "strategy",
                "market",
                "revenue",
                "pricing",
                "competitor",
                "operations",
                "finance",
                "budget",
                "forecast",
                "kpi",
                "metric",
                "growth",
                "retention",
                "acquisition",
                "churn",
                "ltv",
                "cac",
                "unit economics",
                "go-to-market",
                "gtm",
                "positioning",
                "target market",
                "swot",
                "okr",
                "leadership",
                "team",
                "hiring",
                "culture",
                "process",
                "workflow",
                "efficiency",
            ],
            description="Business strategy, operations, financial analysis, leadership",
            can_delegate_to=[BrainType.DESIGN, BrainType.ENGINEERING],
            model_preference="sonnet",
        ),
        BrainType.OPTIONS_TRADING: BrainCapability(
            brain_type=BrainType.OPTIONS_TRADING,
            keywords=[
                "trade",
                "trading",
                "option",
                "options",
                "stock",
                "equity",
                "portfolio",
                "market",
                "analysis",
                "technical analysis",
                "fundamental",
                "chart",
                "indicator",
                "signal",
                "algorithm",
                "backtest",
                "hedge",
                "volatility",
                "greeks",
                "delta",
                "gamma",
                "theta",
                "vega",
                "strike",
                "expiration",
                "call",
                "put",
                "spread",
                "straddle",
                "strangle",
            ],
            description="Trading algorithms, market analysis, options strategies",
            can_delegate_to=[BrainType.ENGINEERING],
            model_preference="sonnet",
        ),
        BrainType.PRODUCT: BrainCapability(
            brain_type=BrainType.PRODUCT,
            keywords=[
                "product",
                "roadmap",
                "feature",
                "prd",
                "requirements",
                "spec",
                "specification",
                "priority",
                "prioritize",
                "backlog",
                "sprint",
                "agile",
                "user story",
                "acceptance criteria",
                "mvp",
                "iteration",
                "release",
                "launch",
                "feedback",
                "validation",
                "hypothesis",
                "experiment",
                "a/b test",
                "metric",
                "north star",
                "discovery",
                "ideation",
            ],
            description="Product strategy, roadmapping, feature prioritization",
            can_delegate_to=[BrainType.DESIGN, BrainType.ENGINEERING, BrainType.MBA],
            model_preference="sonnet",
        ),
    }

    def __init__(self):
        """Initialize the brain selector."""
        self._keyword_index = self._build_keyword_index()

    def _build_keyword_index(self) -> dict[str, list[BrainType]]:
        """Build an inverted index of keywords to brain types.

        Returns:
            Dict mapping keywords to list of brain types that handle them.
        """
        index: dict[str, list[BrainType]] = {}
        for brain_type, capability in self.BRAIN_CAPABILITIES.items():
            for keyword in capability.keywords:
                if keyword not in index:
                    index[keyword] = []
                index[keyword].append(brain_type)
        return index

    def select_brain(self, task: str) -> BrainType:
        """Select the best brain for a task based on keyword matching.

        Args:
            task: The task description.

        Returns:
            BrainType that should handle this task.
        """
        task_lower = task.lower()
        scores: dict[BrainType, float] = {bt: 0 for bt in BrainType}

        # Score based on keyword matches
        for keyword, brain_types in self._keyword_index.items():
            if keyword in task_lower:
                for brain_type in brain_types:
                    scores[brain_type] += 1

        # Find highest scoring brain
        best_brain = max(scores.items(), key=lambda x: x[1])

        # Default to engineering if no matches
        if best_brain[1] == 0:
            return BrainType.ENGINEERING

        return best_brain[0]

    def select_brains(self, task: str, max_brains: int = 3) -> list[BrainType]:
        """Select multiple relevant brains for a complex task.

        Args:
            task: The task description.
            max_brains: Maximum number of brains to return.

        Returns:
            List of BrainTypes sorted by relevance.
        """
        task_lower = task.lower()
        scores: dict[BrainType, float] = {bt: 0 for bt in BrainType}

        # Score based on keyword matches
        for keyword, brain_types in self._keyword_index.items():
            if keyword in task_lower:
                for brain_type in brain_types:
                    scores[brain_type] += 1

        # Sort by score and filter zeros
        sorted_brains = sorted(
            [(bt, score) for bt, score in scores.items() if score > 0],
            key=lambda x: x[1],
            reverse=True,
        )

        if not sorted_brains:
            return [BrainType.ENGINEERING]

        return [bt for bt, _ in sorted_brains[:max_brains]]

    def get_brain_capability(self, brain_type: BrainType) -> BrainCapability:
        """Get the capability description for a brain.

        Args:
            brain_type: The brain type.

        Returns:
            BrainCapability with full description.
        """
        return self.BRAIN_CAPABILITIES.get(
            brain_type,
            BrainCapability(
                brain_type=brain_type,
                keywords=[],
                description="Unknown brain type",
                can_delegate_to=[],
                model_preference="sonnet",
            ),
        )

    def can_delegate(self, from_brain: BrainType, to_brain: BrainType) -> bool:
        """Check if one brain can delegate to another.

        Args:
            from_brain: The brain making the delegation.
            to_brain: The brain receiving the delegation.

        Returns:
            True if delegation is allowed.
        """
        capability = self.BRAIN_CAPABILITIES.get(from_brain)
        if not capability:
            return False
        return to_brain in capability.can_delegate_to

    def get_routing_explanation(self, task: str) -> str:
        """Get an explanation of why certain brains were selected.

        Args:
            task: The task description.

        Returns:
            Human-readable explanation.
        """
        task_lower = task.lower()
        matches: dict[BrainType, list[str]] = {}

        for keyword, brain_types in self._keyword_index.items():
            if keyword in task_lower:
                for brain_type in brain_types:
                    if brain_type not in matches:
                        matches[brain_type] = []
                    matches[brain_type].append(keyword)

        if not matches:
            return "No specific keywords matched. Defaulting to Engineering brain."

        explanation_parts = []
        for brain_type, keywords in sorted(
            matches.items(), key=lambda x: len(x[1]), reverse=True
        ):
            kw_str = ", ".join(keywords[:5])
            if len(keywords) > 5:
                kw_str += f", ... (+{len(keywords) - 5} more)"
            explanation_parts.append(
                f"- {brain_type.value}: matched [{kw_str}]"
            )

        return "Keyword matches:\n" + "\n".join(explanation_parts)
