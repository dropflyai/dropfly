"""CLI interface for Prototype X1000 agent system.

Usage:
    px1000 orchestrate "Build a landing page"
    px1000 run engineering "Create a REST API"
    px1000 build-brain product
    px1000 patterns --brain engineering
"""

import os
import sys
from pathlib import Path
from typing import Optional

import click
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.markdown import Markdown
from dotenv import load_dotenv

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

console = Console()


def load_env():
    """Load environment variables from credentials."""
    env_paths = [
        Path(__file__).parent.parent.parent / "credentials" / ".env",
        Path.cwd() / ".env",
    ]
    for env_path in env_paths:
        if env_path.exists():
            load_dotenv(env_path)
            return
    console.print("[yellow]Warning: No .env file found[/yellow]")


@click.group()
@click.version_option(version="0.1.0")
def cli():
    """Prototype X1000 Agent System CLI.

    Multi-agent framework for building with specialist brain agents.
    """
    load_env()


@cli.command()
@click.argument("task")
@click.option("--context", "-c", help="Additional context for the task")
@click.option("--verbose", "-v", is_flag=True, help="Verbose output")
def orchestrate(task: str, context: Optional[str], verbose: bool):
    """Orchestrate a task across multiple brain agents.

    Uses the CEO agent to decompose and route tasks to specialists.

    Example:
        px1000 orchestrate "Build a landing page with signup form"
    """
    from agents.ceo import CEOAgent

    console.print(Panel(f"[bold]Orchestrating:[/bold] {task}", title="CEO Agent"))

    try:
        ceo = CEOAgent()

        if verbose:
            console.print("[dim]Decomposing task...[/dim]")

        result = ceo.orchestrate(task, context)

        # Display results
        if result.success:
            console.print("[green]Task completed successfully![/green]\n")
        else:
            console.print("[red]Task completed with errors[/red]\n")

        console.print(Panel(
            Markdown(result.final_synthesis),
            title="Result",
            border_style="green" if result.success else "red",
        ))

        if verbose and result.brains_used:
            console.print(f"\n[dim]Brains used: {', '.join(result.brains_used)}[/dim]")

    except Exception as e:
        console.print(f"[red]Error: {str(e)}[/red]")
        raise click.Abort()


@cli.command()
@click.argument("brain", type=click.Choice(["engineering", "design", "mba"]))
@click.argument("task")
@click.option("--context", "-c", help="Additional context")
@click.option("--model", "-m", help="Override model")
def run(brain: str, task: str, context: Optional[str], model: Optional[str]):
    """Run a task with a specific specialist agent.

    Example:
        px1000 run engineering "Create a REST API endpoint"
        px1000 run design "Design a login form"
    """
    from agents.specialists import SpecialistFactory

    console.print(Panel(f"[bold]{brain.upper()} Brain[/bold]\n{task}", title="Running"))

    try:
        agent = SpecialistFactory.create(brain, model=model)
        result = agent.run(task, context)

        if result.success:
            console.print(Panel(
                Markdown(result.content),
                title="Result",
                border_style="green",
            ))
        else:
            console.print(f"[red]Error: {result.error}[/red]")

        if result.tokens_used:
            console.print(f"[dim]Tokens used: {result.tokens_used}[/dim]")

    except Exception as e:
        console.print(f"[red]Error: {str(e)}[/red]")
        raise click.Abort()


@cli.command("build-brain")
@click.argument("brain_name")
@click.option("--domain", "-d", required=True, help="Domain of expertise")
@click.option("--capabilities", "-c", multiple=True, required=True, help="Capabilities (can repeat)")
@click.option("--role", "-r", help="Senior role title")
@click.option("--dry-run", is_flag=True, help="Validate only, don't create")
def build_brain(
    brain_name: str,
    domain: str,
    capabilities: tuple,
    role: Optional[str],
    dry_run: bool,
):
    """Build a new specialist brain.

    Example:
        px1000 build-brain product -d "product management" \\
            -c "Product strategy" -c "Roadmapping" -c "Requirements"
    """
    from agents.brain_builder import BrainBuilderAgent

    console.print(Panel(
        f"[bold]Building:[/bold] {brain_name}_brain\n"
        f"[dim]Domain:[/dim] {domain}\n"
        f"[dim]Capabilities:[/dim] {len(capabilities)} defined",
        title="Brain Builder",
    ))

    try:
        builder = BrainBuilderAgent()

        if dry_run:
            console.print("[yellow]Dry run - validating only[/yellow]")

            # Just validate template
            from agents.brain_builder import QualityValidator
            validator = QualityValidator()
            template = validator.get_template_structure()
            console.print(Panel(template[:1000] + "...", title="Template"))
            return

        result = builder.build_brain(
            brain_name=brain_name,
            domain=domain,
            capabilities=list(capabilities),
            senior_role=role,
        )

        if result["success"]:
            console.print("[green]Brain created successfully![/green]\n")
            console.print("Files created:")
            for f in result["files_created"]:
                console.print(f"  - {f}")
        else:
            console.print("[red]Brain creation failed[/red]")

        # Show validation
        if result.get("validation"):
            val = result["validation"]
            console.print(f"\n[bold]Validation Score:[/bold] {val['score']:.0f}/100")

            if val.get("errors"):
                console.print("[red]Errors:[/red]")
                for err in val["errors"]:
                    console.print(f"  - {err}")

            if val.get("warnings"):
                console.print("[yellow]Warnings:[/yellow]")
                for warn in val["warnings"]:
                    console.print(f"  - {warn}")

    except Exception as e:
        console.print(f"[red]Error: {str(e)}[/red]")
        raise click.Abort()


@cli.command()
@click.option("--brain", "-b", help="Filter by brain type")
@click.option("--promote", is_flag=True, help="Promote patterns to shared_patterns")
@click.option("--analyze-failures", is_flag=True, help="Analyze failure patterns")
def patterns(brain: Optional[str], promote: bool, analyze_failures: bool):
    """View and manage learned patterns.

    Example:
        px1000 patterns --brain engineering
        px1000 patterns --promote
        px1000 patterns --analyze-failures
    """
    from agents.core import SupabaseMemoryClient
    from agents.memory import PatternExtractor

    try:
        memory = SupabaseMemoryClient()
        extractor = PatternExtractor(memory)

        if analyze_failures:
            console.print("[bold]Failure Analysis[/bold]\n")
            analysis = extractor.analyze_failures(brain)

            console.print(f"Total failures: {analysis['total_failures']}")

            if analysis.get("common_problems"):
                table = Table(title="Common Problems")
                table.add_column("Problem")
                table.add_column("Count")

                for prob in analysis["common_problems"]:
                    table.add_row(prob["problem"][:50], str(prob["count"]))

                console.print(table)

            return

        if promote:
            console.print("[bold]Promoting patterns...[/bold]\n")
            created = extractor.promote_to_shared_patterns(brain)
            console.print(f"Created {len(created)} new patterns")
            return

        # Default: show extracted patterns
        console.print("[bold]Extracted Patterns[/bold]\n")
        patterns = extractor.extract_patterns(brain)

        if not patterns:
            console.print("[dim]No patterns found[/dim]")
            return

        table = Table()
        table.add_column("Pattern")
        table.add_column("Brain")
        table.add_column("Observations")
        table.add_column("Tags")

        for p in patterns:
            table.add_row(
                p["pattern_name"][:40],
                p["brain_type"],
                str(p["observation_count"]),
                ", ".join(p["tags"][:3]),
            )

        console.print(table)

    except Exception as e:
        console.print(f"[red]Error: {str(e)}[/red]")
        raise click.Abort()


@cli.command()
@click.option("--brain", "-b", help="Filter by brain type")
@click.option("--limit", "-l", default=10, help="Number of runs to show")
@click.option("--success-only", is_flag=True, help="Only show successful runs")
def runs(brain: Optional[str], limit: int, success_only: bool):
    """View recent agent runs.

    Example:
        px1000 runs --brain engineering --limit 5
    """
    from agents.core import SupabaseMemoryClient

    try:
        memory = SupabaseMemoryClient()
        runs = memory.get_agent_runs(
            agent_type=brain,
            limit=limit,
            success_only=success_only,
        )

        if not runs:
            console.print("[dim]No runs found[/dim]")
            return

        table = Table(title="Recent Agent Runs")
        table.add_column("Agent")
        table.add_column("Task")
        table.add_column("Success")
        table.add_column("Tokens")
        table.add_column("Time")

        for r in runs:
            task = r.get("task_input", "")[:40]
            success = "[green]Yes[/green]" if r.get("success") else "[red]No[/red]"
            tokens = str(r.get("tokens_used", "-"))
            time = r.get("created_at", "")[:16]

            table.add_row(r.get("agent_type", "-"), task, success, tokens, time)

        console.print(table)

    except Exception as e:
        console.print(f"[red]Error: {str(e)}[/red]")
        raise click.Abort()


@cli.command()
def brains():
    """List available brains and their status."""
    from agents.specialists import SpecialistFactory
    from agents.core import BrainLoader

    console.print("[bold]Available Brains[/bold]\n")

    table = Table()
    table.add_column("Brain")
    table.add_column("Status")
    table.add_column("Description")

    loader = BrainLoader()
    available = loader.get_available_brains()

    for brain in ["engineering", "design", "mba", "options_trading", "product", "ceo"]:
        if brain in available:
            status = "[green]Available[/green]"
        else:
            status = "[yellow]Placeholder[/yellow]"

        desc = SpecialistFactory.get_description(brain) if brain in SpecialistFactory.SPECIALISTS else "-"
        table.add_row(brain, status, desc[:50])

    console.print(table)


@cli.command()
def status():
    """Show system status and configuration."""
    console.print("[bold]System Status[/bold]\n")

    # Check API key
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if api_key:
        console.print(f"[green]✓[/green] Anthropic API key configured")
    else:
        console.print(f"[red]✗[/red] Anthropic API key missing")

    # Check Supabase
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
    if supabase_url and supabase_key:
        console.print(f"[green]✓[/green] Supabase configured")
    else:
        console.print(f"[yellow]![/yellow] Supabase not configured (memory disabled)")

    # Show paths
    console.print(f"\n[bold]Paths:[/bold]")
    console.print(f"  Brains: {Path(__file__).parent.parent.parent}")
    console.print(f"  Working dir: {Path.cwd()}")


if __name__ == "__main__":
    cli()
