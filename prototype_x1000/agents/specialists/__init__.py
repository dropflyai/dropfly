"""Specialist brain agents for Prototype X1000."""

from .engineering_agent import EngineeringAgent
from .design_agent import DesignAgent
from .mba_agent import MBAAgent
from .specialist_factory import SpecialistFactory

__all__ = [
    "EngineeringAgent",
    "DesignAgent",
    "MBAAgent",
    "SpecialistFactory",
]
