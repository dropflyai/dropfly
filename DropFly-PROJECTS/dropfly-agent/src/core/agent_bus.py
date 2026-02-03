"""Agent-to-agent communication bus.

Agents talk to each other through this bus. They can:
- Send direct messages to specific agents
- Broadcast to all active agents
- Make blocking requests (ask another agent a question, wait for answer)
- Share artifacts (work products: code, specs, research, etc.)
- Subscribe to events (agent started, completed, artifact posted, etc.)
"""

from __future__ import annotations

import asyncio
import logging
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Awaitable, Callable, Optional

logger = logging.getLogger(__name__)


class MessagePriority(int, Enum):
    LOW = 0
    NORMAL = 1
    HIGH = 2
    URGENT = 3


@dataclass
class BusMessage:
    """A message on the agent bus."""

    id: str = field(default_factory=lambda: uuid.uuid4().hex[:12])
    from_agent: str = ""
    to_agent: str = ""  # Empty = broadcast
    content: str = ""
    message_type: str = "message"  # message, request, response, event
    priority: MessagePriority = MessagePriority.NORMAL
    metadata: dict[str, Any] = field(default_factory=dict)
    reply_to: str = ""  # ID of message this replies to
    timestamp: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


@dataclass
class Artifact:
    """A shared work product on the bus."""

    key: str
    value: Any
    owner_agent: str
    artifact_type: str = "generic"  # code, spec, research, config, test, etc.
    metadata: dict[str, Any] = field(default_factory=dict)
    created_at: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    updated_at: str = ""


EventCallback = Callable[[BusMessage], Awaitable[None] | None]


class AgentBus:
    """Central communication hub for agents.

    Usage:
        bus = AgentBus()

        # Agent subscribes to messages
        await bus.subscribe("engineering_agent", on_message)

        # Agent sends a message
        await bus.send("ceo_agent", "engineering_agent", "Build the API")

        # Agent broadcasts
        await bus.broadcast("ceo_agent", "Project requirements updated")

        # Agent makes a blocking request
        answer = await bus.request("design_agent", "engineering_agent", "What framework?")

        # Agent shares an artifact
        await bus.set_artifact("api_spec", spec_content, "engineering_agent")

        # Agent reads an artifact
        spec = await bus.get_artifact("api_spec")
    """

    def __init__(self) -> None:
        self._subscribers: dict[str, list[EventCallback]] = {}
        self._global_subscribers: list[EventCallback] = []
        self._artifacts: dict[str, Artifact] = {}
        self._pending_requests: dict[str, asyncio.Future[str]] = {}
        self._message_log: list[BusMessage] = []
        self._lock = asyncio.Lock()

    # ------------------------------------------------------------------
    # Messaging
    # ------------------------------------------------------------------

    async def send(
        self,
        from_agent: str,
        to_agent: str,
        content: str,
        priority: MessagePriority = MessagePriority.NORMAL,
        metadata: dict[str, Any] | None = None,
    ) -> str:
        """Send a direct message to a specific agent.

        Returns:
            Message ID.
        """
        msg = BusMessage(
            from_agent=from_agent,
            to_agent=to_agent,
            content=content,
            message_type="message",
            priority=priority,
            metadata=metadata or {},
        )

        async with self._lock:
            self._message_log.append(msg)

        await self._deliver(msg)
        return msg.id

    async def broadcast(
        self,
        from_agent: str,
        content: str,
        priority: MessagePriority = MessagePriority.NORMAL,
        metadata: dict[str, Any] | None = None,
    ) -> str:
        """Broadcast a message to all subscribed agents.

        Returns:
            Message ID.
        """
        msg = BusMessage(
            from_agent=from_agent,
            to_agent="",  # broadcast
            content=content,
            message_type="broadcast",
            priority=priority,
            metadata=metadata or {},
        )

        async with self._lock:
            self._message_log.append(msg)

        await self._deliver_broadcast(msg)
        return msg.id

    async def request(
        self,
        from_agent: str,
        to_agent: str,
        question: str,
        timeout: float = 60.0,
    ) -> str:
        """Send a blocking request to another agent and wait for a response.

        Args:
            from_agent: Requesting agent.
            to_agent: Agent being asked.
            question: The question.
            timeout: Max wait time in seconds.

        Returns:
            The response content.

        Raises:
            asyncio.TimeoutError: If no response within timeout.
        """
        msg = BusMessage(
            from_agent=from_agent,
            to_agent=to_agent,
            content=question,
            message_type="request",
        )

        future: asyncio.Future[str] = asyncio.get_event_loop().create_future()
        self._pending_requests[msg.id] = future

        async with self._lock:
            self._message_log.append(msg)

        await self._deliver(msg)

        try:
            return await asyncio.wait_for(future, timeout=timeout)
        finally:
            self._pending_requests.pop(msg.id, None)

    async def respond(
        self,
        from_agent: str,
        reply_to_id: str,
        content: str,
    ) -> None:
        """Respond to a request message.

        Args:
            from_agent: Agent responding.
            reply_to_id: ID of the request message being replied to.
            content: Response content.
        """
        msg = BusMessage(
            from_agent=from_agent,
            content=content,
            message_type="response",
            reply_to=reply_to_id,
        )

        async with self._lock:
            self._message_log.append(msg)

        # Resolve the pending future
        if reply_to_id in self._pending_requests:
            self._pending_requests[reply_to_id].set_result(content)

    # ------------------------------------------------------------------
    # Subscriptions
    # ------------------------------------------------------------------

    async def subscribe(
        self,
        agent_id: str,
        callback: EventCallback,
    ) -> None:
        """Subscribe an agent to receive messages."""
        if agent_id not in self._subscribers:
            self._subscribers[agent_id] = []
        self._subscribers[agent_id].append(callback)
        logger.debug(f"Agent {agent_id} subscribed to bus")

    async def subscribe_global(self, callback: EventCallback) -> None:
        """Subscribe to ALL messages on the bus (for monitoring/logging)."""
        self._global_subscribers.append(callback)

    async def unsubscribe(self, agent_id: str) -> None:
        """Remove all subscriptions for an agent."""
        self._subscribers.pop(agent_id, None)

    async def _deliver(self, msg: BusMessage) -> None:
        """Deliver a message to a specific agent."""
        callbacks = self._subscribers.get(msg.to_agent, [])
        for cb in callbacks:
            try:
                if asyncio.iscoroutinefunction(cb):
                    await cb(msg)
                else:
                    cb(msg)
            except Exception as e:
                logger.error(f"Bus delivery error to {msg.to_agent}: {e}")

        # Global subscribers see everything
        for cb in self._global_subscribers:
            try:
                if asyncio.iscoroutinefunction(cb):
                    await cb(msg)
                else:
                    cb(msg)
            except Exception:
                pass

    async def _deliver_broadcast(self, msg: BusMessage) -> None:
        """Deliver a broadcast to all subscribers except sender."""
        for agent_id, callbacks in self._subscribers.items():
            if agent_id == msg.from_agent:
                continue
            for cb in callbacks:
                try:
                    if asyncio.iscoroutinefunction(cb):
                        await cb(msg)
                    else:
                        cb(msg)
                except Exception as e:
                    logger.error(f"Bus broadcast error to {agent_id}: {e}")

        for cb in self._global_subscribers:
            try:
                if asyncio.iscoroutinefunction(cb):
                    await cb(msg)
                else:
                    cb(msg)
            except Exception:
                pass

    # ------------------------------------------------------------------
    # Artifacts (shared work products)
    # ------------------------------------------------------------------

    async def set_artifact(
        self,
        key: str,
        value: Any,
        owner_agent: str,
        artifact_type: str = "generic",
        metadata: dict[str, Any] | None = None,
    ) -> None:
        """Share an artifact on the bus.

        Args:
            key: Unique key for the artifact.
            value: The artifact content.
            owner_agent: Agent that created it.
            artifact_type: Type classification (code, spec, research, etc.)
            metadata: Additional metadata.
        """
        artifact = Artifact(
            key=key,
            value=value,
            owner_agent=owner_agent,
            artifact_type=artifact_type,
            metadata=metadata or {},
        )

        async with self._lock:
            self._artifacts[key] = artifact

        # Notify all agents about the new artifact
        await self.broadcast(
            owner_agent,
            f"Artifact '{key}' ({artifact_type}) posted by {owner_agent}",
            metadata={"artifact_key": key, "artifact_type": artifact_type},
        )

    async def get_artifact(self, key: str) -> Any | None:
        """Get an artifact by key."""
        artifact = self._artifacts.get(key)
        return artifact.value if artifact else None

    async def get_artifact_full(self, key: str) -> Artifact | None:
        """Get full artifact with metadata."""
        return self._artifacts.get(key)

    async def get_all_artifacts(self) -> dict[str, Artifact]:
        """Get all artifacts."""
        return dict(self._artifacts)

    async def list_artifacts(
        self, artifact_type: str | None = None
    ) -> list[dict[str, str]]:
        """List available artifacts with metadata.

        Args:
            artifact_type: Filter by type. None = all.
        """
        result = []
        for key, art in self._artifacts.items():
            if artifact_type and art.artifact_type != artifact_type:
                continue
            result.append(
                {
                    "key": key,
                    "type": art.artifact_type,
                    "owner": art.owner_agent,
                    "created_at": art.created_at,
                }
            )
        return result

    # ------------------------------------------------------------------
    # Message history
    # ------------------------------------------------------------------

    def get_history(
        self,
        agent_id: str | None = None,
        limit: int = 50,
    ) -> list[BusMessage]:
        """Get message history.

        Args:
            agent_id: Filter to messages involving this agent. None = all.
            limit: Max messages to return.
        """
        messages = self._message_log
        if agent_id:
            messages = [
                m
                for m in messages
                if m.from_agent == agent_id or m.to_agent == agent_id or m.to_agent == ""
            ]
        return messages[-limit:]

    @property
    def active_agents(self) -> list[str]:
        """List agents with active subscriptions."""
        return list(self._subscribers.keys())
