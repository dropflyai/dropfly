"""Deploy Agent — handles deployment to any platform.

Vercel, AWS, EAS, Docker, Supabase — sets up CI/CD, configures domains,
manages environment variables, and ships to production.
"""

from __future__ import annotations

from typing import Any

from ..core.base_agent import BaseAgent
from ..core.tool_registry import ToolRegistry
from ..tools.shell import register_shell_tools
from ..tools.file_system import register_file_tools
from ..tools.git_tools import register_git_tools


class DeployAgent(BaseAgent):
    """Deploy Agent — ships code to production on any platform."""

    agent_type = "deploy"
    default_model = "anthropic/claude-sonnet-4-20250514"

    def _get_system_prompt(self, context: str | None = None) -> str:
        prompt = """# DEPLOY AGENT — Deployment & Infrastructure Specialist

## Identity
You are a senior DevOps/platform engineer. You deploy applications to any platform,
set up CI/CD, configure infrastructure, and ensure reliable production environments.

## Supported Platforms
- **Vercel** — Next.js, static sites, serverless functions
- **AWS** — EC2, ECS, Lambda, S3, CloudFront
- **EAS** — Expo Application Services (React Native)
- **Docker** — Containerized deployments anywhere
- **Supabase** — Database setup, migrations, edge functions
- **Cloudflare** — Workers, Pages, R2

## Deployment Process
1. Verify build succeeds locally
2. Set up environment variables
3. Configure deployment platform
4. Deploy
5. Verify deployment health
6. Report back with URLs and status

## Rules
- Always verify builds before deploying
- Never expose secrets in logs or configs
- Set up proper environment variable management
- Test the deployed version
- Report deployment URLs and health status
"""
        if context:
            prompt += f"\n## Context\n{context}"
        return prompt

    def _register_tools(self, registry: ToolRegistry) -> None:
        register_shell_tools(registry)
        register_file_tools(registry)
        register_git_tools(registry)

        registry.register(
            name="deploy_vercel",
            description="Deploy a project to Vercel.",
            parameters={
                "type": "object",
                "properties": {
                    "project_dir": {"type": "string", "description": "Project directory"},
                    "production": {
                        "type": "boolean",
                        "description": "Deploy to production (default: preview)",
                    },
                },
                "required": ["project_dir"],
            },
            handler=self._deploy_vercel,
            tags=["deploy"],
        )

        registry.register(
            name="post_deployment_status",
            description="Post deployment status to the agent bus.",
            parameters={
                "type": "object",
                "properties": {
                    "platform": {"type": "string", "description": "Deployment platform"},
                    "url": {"type": "string", "description": "Deployed URL"},
                    "status": {
                        "type": "string",
                        "enum": ["success", "failed", "pending"],
                        "description": "Deployment status",
                    },
                    "details": {"type": "string", "description": "Additional details"},
                },
                "required": ["platform", "status"],
            },
            handler=self._post_deployment,
            tags=["deploy"],
        )

    async def _deploy_vercel(
        self, project_dir: str, production: bool = False
    ) -> str:
        from ..tools.shell import run_shell

        flag = "--prod" if production else ""
        result = await run_shell(
            f"vercel {flag} --yes",
            working_directory=project_dir,
            timeout=120.0,
        )
        return result.output if result.success else f"Deploy failed: {result.error}"

    async def _post_deployment(
        self,
        platform: str,
        status: str,
        url: str = "",
        details: str = "",
    ) -> str:
        deployment = {
            "platform": platform,
            "url": url,
            "status": status,
            "details": details,
        }

        if self.bus:
            await self.bus.set_artifact(
                key=f"deployment_{platform}",
                value=deployment,
                owner_agent=self.agent_id,
                artifact_type="deployment",
            )
            await self.bus.broadcast(
                self.agent_id,
                f"Deployment to {platform}: {status}" + (f" — {url}" if url else ""),
            )

        return f"Deployment status posted: {platform} = {status}"
