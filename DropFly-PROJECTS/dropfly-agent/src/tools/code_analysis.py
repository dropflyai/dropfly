"""Code analysis tools — AST parsing, dependency scanning, code review.

Gives agents the ability to understand codebases structurally,
not just as text.
"""

from __future__ import annotations

import ast
import json
import logging
from pathlib import Path
from typing import Any

from ..core.tool_registry import ToolRegistry, ToolResult

logger = logging.getLogger(__name__)


async def analyze_python_file(path: str) -> ToolResult:
    """Analyze a Python file's structure using AST parsing.

    Returns classes, functions, imports, and their signatures.

    Args:
        path: Path to the Python file.
    """
    try:
        p = Path(path).resolve()
        if not p.exists():
            return ToolResult(output="", success=False, error=f"File not found: {path}")

        source = p.read_text(encoding="utf-8")
        tree = ast.parse(source)

        analysis: dict[str, Any] = {
            "file": str(p),
            "lines": len(source.split("\n")),
            "imports": [],
            "classes": [],
            "functions": [],
            "global_variables": [],
        }

        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    analysis["imports"].append(alias.name)

            elif isinstance(node, ast.ImportFrom):
                module = node.module or ""
                for alias in node.names:
                    analysis["imports"].append(f"{module}.{alias.name}")

            elif isinstance(node, ast.ClassDef):
                methods = []
                for item in node.body:
                    if isinstance(item, (ast.FunctionDef, ast.AsyncFunctionDef)):
                        args = [a.arg for a in item.args.args if a.arg != "self"]
                        methods.append({
                            "name": item.name,
                            "args": args,
                            "async": isinstance(item, ast.AsyncFunctionDef),
                            "line": item.lineno,
                        })

                bases = []
                for base in node.bases:
                    if isinstance(base, ast.Name):
                        bases.append(base.id)
                    elif isinstance(base, ast.Attribute):
                        bases.append(f"{getattr(base.value, 'id', '?')}.{base.attr}")

                analysis["classes"].append({
                    "name": node.name,
                    "bases": bases,
                    "methods": methods,
                    "line": node.lineno,
                })

            elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                # Only top-level functions
                if hasattr(node, "col_offset") and node.col_offset == 0:
                    args = [a.arg for a in node.args.args]
                    analysis["functions"].append({
                        "name": node.name,
                        "args": args,
                        "async": isinstance(node, ast.AsyncFunctionDef),
                        "line": node.lineno,
                    })

        return ToolResult(
            output=json.dumps(analysis, indent=2),
            success=True,
            artifacts=analysis,
        )
    except SyntaxError as e:
        return ToolResult(output="", success=False, error=f"Syntax error in {path}: {e}")
    except Exception as e:
        return ToolResult(output="", success=False, error=str(e))


async def scan_project_structure(path: str = ".", max_depth: int = 4) -> ToolResult:
    """Scan a project directory and return its structure with file types.

    Args:
        path: Project root directory.
        max_depth: Maximum directory depth to scan.
    """
    try:
        root = Path(path).resolve()
        if not root.is_dir():
            return ToolResult(output="", success=False, error=f"Not a directory: {path}")

        structure: dict[str, Any] = {
            "root": str(root),
            "files_by_type": {},
            "directories": [],
            "total_files": 0,
            "notable_files": [],
        }

        skip_dirs = {
            "node_modules", ".git", "__pycache__", ".next", "dist",
            ".venv", "venv", ".expo", "ios/Pods", "build",
        }

        for item in sorted(root.rglob("*")):
            # Check depth
            rel = item.relative_to(root)
            if len(rel.parts) > max_depth:
                continue

            # Skip ignored directories
            if any(p in skip_dirs for p in rel.parts):
                continue

            if item.is_file():
                structure["total_files"] += 1
                ext = item.suffix or "(no ext)"
                structure["files_by_type"].setdefault(ext, 0)
                structure["files_by_type"][ext] += 1

                # Notable files
                notable = {
                    "package.json", "pyproject.toml", "Cargo.toml", "go.mod",
                    "Dockerfile", "docker-compose.yml", ".env.example",
                    "tsconfig.json", "next.config.mjs", "vite.config.ts",
                    "requirements.txt", "Makefile", "CLAUDE.md", "README.md",
                }
                if item.name in notable:
                    structure["notable_files"].append(str(rel))

            elif item.is_dir() and len(rel.parts) <= 2:
                structure["directories"].append(str(rel))

        return ToolResult(
            output=json.dumps(structure, indent=2),
            success=True,
            artifacts=structure,
        )
    except Exception as e:
        return ToolResult(output="", success=False, error=str(e))


async def find_dependencies(path: str = ".") -> ToolResult:
    """Scan a project and list all dependencies.

    Supports: package.json, pyproject.toml, requirements.txt, go.mod, Cargo.toml.

    Args:
        path: Project root.
    """
    try:
        root = Path(path).resolve()
        deps: dict[str, list[str]] = {}

        # package.json
        pkg_json = root / "package.json"
        if pkg_json.exists():
            data = json.loads(pkg_json.read_text())
            deps["npm_dependencies"] = list(data.get("dependencies", {}).keys())
            deps["npm_devDependencies"] = list(data.get("devDependencies", {}).keys())

        # pyproject.toml
        pyproject = root / "pyproject.toml"
        if pyproject.exists():
            content = pyproject.read_text()
            # Simple extraction — not full TOML parsing
            in_deps = False
            py_deps = []
            for line in content.split("\n"):
                if "dependencies" in line and "=" in line and "[" in line:
                    in_deps = True
                    continue
                if in_deps and line.strip().startswith("]"):
                    in_deps = False
                    continue
                if in_deps and line.strip().startswith('"'):
                    dep = line.strip().strip('",')
                    py_deps.append(dep)
            if py_deps:
                deps["python_dependencies"] = py_deps

        # requirements.txt
        req_txt = root / "requirements.txt"
        if req_txt.exists():
            reqs = [
                line.strip()
                for line in req_txt.read_text().split("\n")
                if line.strip() and not line.startswith("#")
            ]
            deps["requirements_txt"] = reqs

        if not deps:
            return ToolResult(output="No dependency files found.", success=True)

        return ToolResult(
            output=json.dumps(deps, indent=2),
            success=True,
            artifacts=deps,
        )
    except Exception as e:
        return ToolResult(output="", success=False, error=str(e))


def register_code_analysis_tools(registry: ToolRegistry) -> None:
    """Register code analysis tools."""
    registry.register(
        name="analyze_python_file",
        description="Analyze a Python file's structure (classes, functions, imports) using AST.",
        parameters={
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Path to Python file"},
            },
            "required": ["path"],
        },
        handler=analyze_python_file,
        tags=["code_analysis"],
    )

    registry.register(
        name="scan_project_structure",
        description="Scan a project directory and return its structure, file types, and notable files.",
        parameters={
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Project root directory"},
                "max_depth": {"type": "integer", "description": "Max directory depth (default 4)"},
            },
        },
        handler=scan_project_structure,
        tags=["code_analysis"],
    )

    registry.register(
        name="find_dependencies",
        description="Find and list all project dependencies (npm, pip, go, cargo).",
        parameters={
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Project root directory"},
            },
        },
        handler=find_dependencies,
        tags=["code_analysis"],
    )
