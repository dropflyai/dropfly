"""DropFly Agent — Tool library.

Register all tools into a single registry:
    from src.tools import create_default_registry
    registry = create_default_registry()
"""

from ..core.tool_registry import ToolRegistry
from .shell import register_shell_tools
from .file_system import register_file_tools
from .git_tools import register_git_tools
from .web_search import register_web_tools
from .browser import register_browser_tools
from .docker_tools import register_docker_tools
from .twilio_tools import register_twilio_tools
from .email_tools import register_email_tools
from .voice_tools import register_voice_tools
from .supabase_tools import register_supabase_tools
from .code_analysis import register_code_analysis_tools
from .deploy_tools import register_deploy_tools


def create_default_registry() -> ToolRegistry:
    """Create a ToolRegistry with all built-in tools registered."""
    registry = ToolRegistry()

    # Phase 1: Core tools
    register_shell_tools(registry)
    register_file_tools(registry)
    register_git_tools(registry)
    register_web_tools(registry)

    # Phase 3: Execution tools
    register_browser_tools(registry)
    register_docker_tools(registry)

    # Phase 4: Communication & extended tools
    register_twilio_tools(registry)
    register_email_tools(registry)
    register_voice_tools(registry)
    register_supabase_tools(registry)
    register_code_analysis_tools(registry)
    register_deploy_tools(registry)

    return registry


__all__ = ["create_default_registry"]
