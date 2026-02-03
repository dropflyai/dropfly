"""DropFly Agent — FastAPI Gateway Server.

The single entry point for the autonomous builder system.
Exposes REST + WebSocket endpoints for builds, chat, status, and artifacts.

Usage:
    python -m src.gateway.server          # Direct run
    uvicorn src.gateway.server:app        # Uvicorn
"""

from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Any, AsyncIterator

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from ..config.settings import get_settings
from .auth import TeamMember, register_api_key, create_token
from .session import SessionManager
from .websocket import ConnectionManager
from . import deps
from .routes import build, status, chat, artifacts

logger = logging.getLogger(__name__)


# -------------------------------------------------------------------
# Build Runner (orchestrates the full build pipeline)
# -------------------------------------------------------------------


class BuildRunner:
    """Runs the full build pipeline: intake → CEO → agents → QA → deploy."""

    def __init__(self, settings: Any, session_manager: SessionManager) -> None:
        self._settings = settings
        self._sessions = session_manager

    async def run_build(
        self,
        session: Any,
        prompt: str,
        context: str | None = None,
        model_override: str | None = None,
        auto_deploy: bool = False,
    ) -> None:
        """Execute the full build pipeline."""
        from ..agents.factory import AgentFactory
        from ..core.providers import ProviderRegistry
        from ..core.agent_bus import AgentBus
        from ..core.tool_registry import ToolRegistry
        from ..tools import create_default_registry
        from .session import SessionStatus

        try:
            session.set_status(SessionStatus.INTAKE)
            await self._sessions.add_event(
                session_id=session.id,
                event_type="pipeline_start",
                content=f"Starting build: {prompt[:100]}",
            )

            # Set up shared infrastructure
            provider_registry = ProviderRegistry()
            provider_registry.auto_register()
            bus = AgentBus()
            tools = create_default_registry()

            model = model_override or self._settings.llm.orchestrator_model

            # Phase 1: Intake — extract requirements
            intake = AgentFactory.create(
                "intake",
                provider_registry=provider_registry,
                model=model,
                tools=tools,
                bus=bus,
            )

            session.active_agents = ["intake"]
            await self._sessions.add_event(
                session_id=session.id,
                event_type="agent_started",
                content="Intake agent extracting requirements",
                agent_type="intake",
            )

            intake_result = await intake.run(
                task=prompt,
                context=context,
            )

            session.active_agents = []
            session.completed_agents.append("intake")

            # Store requirements
            requirements = bus._artifacts.get("requirements", None)
            if requirements:
                session.requirements = requirements.value if hasattr(requirements, "value") else {}
                session.artifacts["requirements"] = session.requirements

            await self._sessions.add_event(
                session_id=session.id,
                event_type="agent_completed",
                content="Requirements extracted",
                agent_type="intake",
            )

            # Phase 2: CEO — decompose and orchestrate
            session.set_status(SessionStatus.PLANNING)

            ceo = AgentFactory.create(
                "ceo",
                provider_registry=provider_registry,
                model=model,
                tools=tools,
                bus=bus,
            )

            session.active_agents = ["ceo"]
            await self._sessions.add_event(
                session_id=session.id,
                event_type="agent_started",
                content="CEO agent planning build",
                agent_type="ceo",
            )

            ceo_task = (
                f"Build this project based on the requirements:\n\n"
                f"Original prompt: {prompt}\n\n"
                f"Requirements: {intake_result.output[:2000]}"
            )

            session.set_status(SessionStatus.BUILDING)
            ceo_result = await ceo.run(task=ceo_task)

            session.active_agents = []
            session.completed_agents.append("ceo")

            # Collect all artifacts from bus
            for key, artifact in bus._artifacts.items():
                val = artifact.value if hasattr(artifact, "value") else artifact
                session.artifacts[key] = val

            await self._sessions.add_event(
                session_id=session.id,
                event_type="agent_completed",
                content=f"Build complete: {ceo_result.output[:500]}",
                agent_type="ceo",
            )

            session.set_status(SessionStatus.COMPLETED)

        except Exception as e:
            logger.exception("Build pipeline failed for session %s", session.id)
            session.error = str(e)
            session.set_status(SessionStatus.FAILED)
            await self._sessions.add_event(
                session_id=session.id,
                event_type="error",
                content=f"Build failed: {e}",
            )


# -------------------------------------------------------------------
# Chat Handler (conversational interface)
# -------------------------------------------------------------------


class ChatHandler:
    """Handles conversational messages — routes to the right agent."""

    def __init__(self, settings: Any, session_manager: SessionManager) -> None:
        self._settings = settings
        self._sessions = session_manager

    async def handle_message(
        self,
        session: Any,
        message: str,
        model_override: str | None = None,
    ) -> dict[str, Any]:
        """Handle a single chat message."""
        from ..agents.factory import AgentFactory
        from ..core.providers import ProviderRegistry
        from ..core.agent_bus import AgentBus
        from ..tools import create_default_registry

        provider_registry = ProviderRegistry()
        provider_registry.auto_register()
        bus = AgentBus()
        tools = create_default_registry()
        model = model_override or self._settings.llm.fast_model

        # Use intake agent for conversational interface
        agent = AgentFactory.create(
            "intake",
            provider_registry=provider_registry,
            model=model,
            tools=tools,
            bus=bus,
        )

        result = await agent.run(task=message)

        return {
            "message": result.output,
            "agent_type": "intake",
            "tool_calls": [],
            "done": True,
        }

    async def stream_message(
        self,
        session: Any,
        message: str,
        model_override: str | None = None,
    ) -> AsyncIterator[dict[str, Any]]:
        """Stream a chat response."""
        from ..agents.factory import AgentFactory
        from ..core.providers import ProviderRegistry
        from ..core.agent_bus import AgentBus
        from ..tools import create_default_registry

        provider_registry = ProviderRegistry()
        provider_registry.auto_register()
        bus = AgentBus()
        tools = create_default_registry()
        model = model_override or self._settings.llm.fast_model

        agent = AgentFactory.create(
            "intake",
            provider_registry=provider_registry,
            model=model,
            tools=tools,
            bus=bus,
        )

        async for event in agent.run_streaming(task=message):
            yield {
                "type": event.event_type if hasattr(event, "event_type") else "chunk",
                "content": event.content if hasattr(event, "content") else str(event),
            }


# -------------------------------------------------------------------
# App lifecycle
# -------------------------------------------------------------------


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """App startup and shutdown."""
    settings = get_settings()

    # Initialize singletons
    session_manager = SessionManager(max_sessions=200)
    build_runner = BuildRunner(settings, session_manager)
    chat_handler = ChatHandler(settings, session_manager)

    deps.set_settings(settings)
    deps.set_session_manager(session_manager)
    deps.set_build_runner(build_runner)
    deps.set_chat_handler(chat_handler)

    # Register a default admin API key for development
    if settings.gateway.secret_key == "change-me-in-production":
        logger.warning("Using default secret key — set GATEWAY_SECRET_KEY in production")
        register_api_key(
            "dev-key-dropfly-2024",
            TeamMember(id="admin", name="Admin", role="admin"),
        )

    # Store connection manager on app state for WebSocket access
    app.state.ws_manager = ConnectionManager(session_manager)

    logger.info(
        "DropFly Agent Gateway started on %s:%s",
        settings.gateway.host,
        settings.gateway.port,
    )

    yield

    logger.info("DropFly Agent Gateway shutting down")


# -------------------------------------------------------------------
# FastAPI app
# -------------------------------------------------------------------


app = FastAPI(
    title="DropFly Agent",
    description="Autonomous builder system — API Gateway",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow all origins in dev, lock down in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount route modules
app.include_router(build.router)
app.include_router(status.router)
app.include_router(chat.router)
app.include_router(artifacts.router)


# -------------------------------------------------------------------
# WebSocket endpoint
# -------------------------------------------------------------------


@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str) -> None:
    """WebSocket endpoint for real-time build updates.

    Connect to /ws/{session_id} to receive events as agents work.
    """
    manager: ConnectionManager = app.state.ws_manager
    await manager.connect(websocket, session_id)

    try:
        while True:
            # Keep connection alive, handle client messages
            data = await websocket.receive_json()

            # Client can send messages (e.g., cancel, provide input)
            msg_type = data.get("type", "")
            if msg_type == "ping":
                await websocket.send_json({"type": "pong"})
            elif msg_type == "cancel":
                session_mgr = deps.get_session_manager()
                session = await session_mgr.get(session_id)
                if session:
                    from .session import SessionStatus
                    session.set_status(SessionStatus.CANCELLED)
                    await manager.broadcast_to_session(
                        session_id, {"type": "cancelled", "message": "Build cancelled"}
                    )
    except WebSocketDisconnect:
        await manager.disconnect(websocket, session_id)
    except Exception:
        logger.exception("WebSocket error for session %s", session_id)
        await manager.disconnect(websocket, session_id)


# -------------------------------------------------------------------
# CLI entry point
# -------------------------------------------------------------------


def main() -> None:
    """Run the server directly."""
    import uvicorn

    settings = get_settings()
    uvicorn.run(
        "src.gateway.server:app",
        host=settings.gateway.host,
        port=settings.gateway.port,
        reload=False,
        log_level="info",
    )


if __name__ == "__main__":
    main()
