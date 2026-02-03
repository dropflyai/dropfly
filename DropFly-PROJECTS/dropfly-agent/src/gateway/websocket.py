"""WebSocket manager — real-time event streaming to clients.

Clients connect to /ws/{session_id} and receive JSON events as agents work.
"""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any

from starlette.websockets import WebSocket, WebSocketDisconnect, WebSocketState

from .session import SessionEvent, SessionManager

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages active WebSocket connections.

    Each connection is tied to a session_id.  Events from the SessionManager
    are forwarded to all connected clients for that session.
    """

    def __init__(self, session_manager: SessionManager) -> None:
        self._session_manager = session_manager
        # session_id -> [WebSocket, ...]
        self._connections: dict[str, list[WebSocket]] = {}
        # session_id -> asyncio.Task (event forwarder)
        self._forwarders: dict[str, asyncio.Task] = {}

    async def connect(self, websocket: WebSocket, session_id: str) -> None:
        """Accept a WebSocket connection and start forwarding events."""
        await websocket.accept()

        if session_id not in self._connections:
            self._connections[session_id] = []
        self._connections[session_id].append(websocket)

        logger.info("WebSocket connected: session=%s", session_id)

        # Start event forwarder if not already running
        if session_id not in self._forwarders:
            queue = await self._session_manager.subscribe(session_id)
            task = asyncio.create_task(self._forward_events(session_id, queue))
            self._forwarders[session_id] = task

        # Send initial session state
        session = await self._session_manager.get(session_id)
        if session:
            await self._send(websocket, {
                "type": "session_state",
                "session_id": session_id,
                "status": session.status.value,
                "active_agents": session.active_agents,
                "event_count": len(session.events),
            })

    async def disconnect(self, websocket: WebSocket, session_id: str) -> None:
        """Remove a WebSocket connection."""
        conns = self._connections.get(session_id, [])
        if websocket in conns:
            conns.remove(websocket)

        # Clean up if no more connections for this session
        if not conns and session_id in self._forwarders:
            self._forwarders[session_id].cancel()
            del self._forwarders[session_id]
            if session_id in self._connections:
                del self._connections[session_id]

        logger.info("WebSocket disconnected: session=%s", session_id)

    async def broadcast_to_session(self, session_id: str, data: dict[str, Any]) -> None:
        """Send a message to all WebSocket clients for a session."""
        conns = self._connections.get(session_id, [])
        dead: list[WebSocket] = []

        for ws in conns:
            try:
                await self._send(ws, data)
            except (WebSocketDisconnect, RuntimeError):
                dead.append(ws)

        # Clean up dead connections
        for ws in dead:
            await self.disconnect(ws, session_id)

    async def _forward_events(self, session_id: str, queue: asyncio.Queue) -> None:
        """Forward SessionManager events to WebSocket clients."""
        try:
            while True:
                event: SessionEvent = await queue.get()
                data = {
                    "type": "event",
                    "event": {
                        "id": event.id,
                        "timestamp": event.timestamp,
                        "agent_id": event.agent_id,
                        "agent_type": event.agent_type,
                        "event_type": event.event_type,
                        "content": event.content,
                        "metadata": event.metadata,
                    },
                }
                await self.broadcast_to_session(session_id, data)
        except asyncio.CancelledError:
            pass
        except Exception:
            logger.exception("Event forwarder error for session %s", session_id)
        finally:
            await self._session_manager.unsubscribe(session_id, queue)

    async def _send(self, websocket: WebSocket, data: dict[str, Any]) -> None:
        """Send JSON data to a WebSocket, handling closed connections."""
        if websocket.client_state == WebSocketState.CONNECTED:
            await websocket.send_json(data)
