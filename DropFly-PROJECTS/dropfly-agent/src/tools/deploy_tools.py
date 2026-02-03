"""Deployment tools — Vercel, AWS, EAS, generic.

Ship to any platform from agent code.
"""

from __future__ import annotations

import logging
from typing import Any

from ..core.tool_registry import ToolRegistry, ToolResult
from .shell import run_shell

logger = logging.getLogger(__name__)


async def deploy_vercel(
    project_dir: str = ".",
    production: bool = False,
    token: str | None = None,
) -> ToolResult:
    """Deploy to Vercel.

    Args:
        project_dir: Project directory.
        production: Deploy to production (vs preview).
        token: Vercel token (optional, uses CLI auth).
    """
    cmd = "vercel"
    if production:
        cmd += " --prod"
    cmd += " --yes"
    if token:
        cmd += f" --token {token}"

    return await run_shell(cmd, working_directory=project_dir, timeout=180.0)


async def deploy_aws_s3(
    project_dir: str,
    bucket: str,
    build_dir: str = "dist",
    region: str = "us-east-1",
) -> ToolResult:
    """Deploy a static site to AWS S3.

    Args:
        project_dir: Project directory.
        bucket: S3 bucket name.
        build_dir: Build output directory (relative to project_dir).
        region: AWS region.
    """
    result = await run_shell(
        f"aws s3 sync {build_dir}/ s3://{bucket}/ --delete --region {region}",
        working_directory=project_dir,
        timeout=120.0,
    )
    if result.success:
        # Invalidate CloudFront if configured
        cf_result = await run_shell(
            f"aws cloudfront list-distributions --query 'DistributionList.Items[?Origins.Items[0].DomainName==`{bucket}.s3.amazonaws.com`].Id' --output text",
            timeout=15.0,
        )
        if cf_result.success and cf_result.output.strip():
            dist_id = cf_result.output.strip()
            await run_shell(
                f"aws cloudfront create-invalidation --distribution-id {dist_id} --paths '/*'",
                timeout=15.0,
            )
    return result


async def deploy_eas(
    project_dir: str = ".",
    platform: str = "all",
    profile: str = "preview",
) -> ToolResult:
    """Deploy a React Native/Expo app via EAS Build.

    Args:
        project_dir: Expo project directory.
        platform: Platform (ios, android, all).
        profile: Build profile (development, preview, production).
    """
    return await run_shell(
        f"eas build --platform {platform} --profile {profile} --non-interactive",
        working_directory=project_dir,
        timeout=600.0,
    )


async def deploy_docker(
    project_dir: str = ".",
    image_name: str = "app",
    registry: str | None = None,
    tag: str = "latest",
) -> ToolResult:
    """Build and push a Docker image.

    Args:
        project_dir: Project directory with Dockerfile.
        image_name: Image name.
        registry: Docker registry (e.g., ghcr.io/user).
        tag: Image tag.
    """
    full_name = f"{registry}/{image_name}:{tag}" if registry else f"{image_name}:{tag}"

    build = await run_shell(
        f"docker build -t {full_name} .",
        working_directory=project_dir,
        timeout=300.0,
    )
    if not build.success:
        return build

    if registry:
        push = await run_shell(f"docker push {full_name}", timeout=180.0)
        return push

    return build


async def setup_supabase_project(project_dir: str = ".") -> ToolResult:
    """Initialize and configure a Supabase project.

    Args:
        project_dir: Project directory.
    """
    # Init supabase
    init = await run_shell("supabase init", working_directory=project_dir)
    if not init.success and "already initialized" not in (init.error or ""):
        return init

    # Link to existing project or start local
    return await run_shell(
        "supabase start",
        working_directory=project_dir,
        timeout=120.0,
    )


def register_deploy_tools(registry_obj: ToolRegistry) -> None:
    """Register deployment tools."""
    registry_obj.register(
        name="deploy_vercel",
        description="Deploy a project to Vercel (Next.js, static sites, etc.).",
        parameters={
            "type": "object",
            "properties": {
                "project_dir": {"type": "string", "description": "Project directory"},
                "production": {"type": "boolean", "description": "Deploy to production"},
            },
        },
        handler=deploy_vercel, tags=["deploy"], timeout=180.0,
    )

    registry_obj.register(
        name="deploy_aws_s3",
        description="Deploy a static site to AWS S3.",
        parameters={
            "type": "object",
            "properties": {
                "project_dir": {"type": "string", "description": "Project directory"},
                "bucket": {"type": "string", "description": "S3 bucket name"},
                "build_dir": {"type": "string", "description": "Build output dir (default 'dist')"},
                "region": {"type": "string", "description": "AWS region"},
            },
            "required": ["project_dir", "bucket"],
        },
        handler=deploy_aws_s3, tags=["deploy", "aws"], timeout=120.0,
    )

    registry_obj.register(
        name="deploy_eas",
        description="Deploy a React Native/Expo app via EAS Build.",
        parameters={
            "type": "object",
            "properties": {
                "project_dir": {"type": "string", "description": "Project directory"},
                "platform": {
                    "type": "string",
                    "enum": ["ios", "android", "all"],
                    "description": "Target platform",
                },
                "profile": {
                    "type": "string",
                    "enum": ["development", "preview", "production"],
                    "description": "Build profile",
                },
            },
        },
        handler=deploy_eas, tags=["deploy", "mobile"], timeout=600.0,
    )

    registry_obj.register(
        name="deploy_docker",
        description="Build and optionally push a Docker image.",
        parameters={
            "type": "object",
            "properties": {
                "project_dir": {"type": "string", "description": "Project directory"},
                "image_name": {"type": "string", "description": "Image name"},
                "registry": {"type": "string", "description": "Docker registry URL"},
                "tag": {"type": "string", "description": "Image tag (default 'latest')"},
            },
        },
        handler=deploy_docker, tags=["deploy", "docker"], timeout=300.0,
    )
