"""Prototype X1000 Agent System.

Multi-agent framework powered by Anthropic SDK. Agents read frozen brain
guidance, execute tasks, and auto-log learnings to Supabase.

Architecture:
    USER REQUEST
         │
         ▼
    ┌─────────────┐
    │  CEO AGENT  │  ← Orchestrator (claude-opus-4)
    └──────┬──────┘
           │ tool_use calls
       ┌───┼───┬───────────┐
       │   │   │           │
       ▼   ▼   ▼           ▼
    ┌────┐┌────┐┌────┐ ┌──────────┐
    │ENG ││DES ││MBA │ │BRAIN     │
    │    ││    ││    │ │BUILDER   │
    └────┘└────┘└────┘ └──────────┘

Usage:
    from prototype_x1000.agents import CEOAgent, EngineeringAgent

    # Direct specialist use
    eng = EngineeringAgent()
    result = eng.run("Create a REST API endpoint for user registration")

    # Orchestrated multi-agent task
    ceo = CEOAgent()
    result = ceo.orchestrate("Build a landing page with signup form")
"""

__version__ = "0.1.0"

# Core components
from .core import BaseAgent, BrainLoader, SupabaseMemoryClient

# CEO Agent
from .ceo import CEOAgent, TaskDecomposer, BrainSelector

# Specialist Agents
from .specialists import (
    EngineeringAgent,
    DesignAgent,
    MBAAgent,
    SpecialistFactory,
)

# Brain Builder
from .brain_builder import BrainBuilderAgent, QualityValidator

# Memory System
from .memory import AutoLogger, PatternExtractor

__all__ = [
    # Core
    "BaseAgent",
    "BrainLoader",
    "SupabaseMemoryClient",
    # CEO
    "CEOAgent",
    "TaskDecomposer",
    "BrainSelector",
    # Specialists
    "EngineeringAgent",
    "DesignAgent",
    "MBAAgent",
    "SpecialistFactory",
    # Brain Builder
    "BrainBuilderAgent",
    "QualityValidator",
    # Memory
    "AutoLogger",
    "PatternExtractor",
    # Version
    "__version__",
]
