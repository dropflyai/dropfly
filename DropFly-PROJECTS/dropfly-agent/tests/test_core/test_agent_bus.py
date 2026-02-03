"""Tests for the agent communication bus."""

import asyncio
import pytest
from src.core.agent_bus import AgentBus, MessagePriority


@pytest.fixture
def bus():
    return AgentBus()


class TestAgentBus:
    @pytest.mark.asyncio
    async def test_send_and_receive(self, bus):
        received = []

        async def handler(msg):
            received.append(msg)

        await bus.subscribe("agent_b", handler)
        await bus.send("agent_a", "agent_b", "hello")

        assert len(received) == 1
        assert received[0].content == "hello"
        assert received[0].from_agent == "agent_a"

    @pytest.mark.asyncio
    async def test_broadcast(self, bus):
        received_b = []
        received_c = []

        async def handler_b(msg):
            received_b.append(msg)

        async def handler_c(msg):
            received_c.append(msg)

        await bus.subscribe("agent_b", handler_b)
        await bus.subscribe("agent_c", handler_c)

        await bus.broadcast("agent_a", "update available")

        assert len(received_b) == 1
        assert len(received_c) == 1

    @pytest.mark.asyncio
    async def test_broadcast_excludes_sender(self, bus):
        received = []

        async def handler(msg):
            received.append(msg)

        await bus.subscribe("agent_a", handler)
        await bus.broadcast("agent_a", "my own message")

        assert len(received) == 0  # Sender doesn't receive own broadcast

    @pytest.mark.asyncio
    async def test_request_response(self, bus):
        async def responder(msg):
            if msg.message_type == "request":
                await bus.respond("agent_b", msg.id, "the answer is 42")

        await bus.subscribe("agent_b", responder)

        answer = await bus.request("agent_a", "agent_b", "what is the answer?")
        assert answer == "the answer is 42"

    @pytest.mark.asyncio
    async def test_artifacts(self, bus):
        # Suppress broadcast (no subscribers needed for this test)
        await bus.set_artifact(
            "api_spec",
            {"routes": ["/users", "/posts"]},
            "engineering",
            artifact_type="spec",
        )

        value = await bus.get_artifact("api_spec")
        assert value == {"routes": ["/users", "/posts"]}

        full = await bus.get_artifact_full("api_spec")
        assert full.owner_agent == "engineering"
        assert full.artifact_type == "spec"

    @pytest.mark.asyncio
    async def test_list_artifacts(self, bus):
        await bus.set_artifact("a", "value_a", "agent1", artifact_type="code")
        await bus.set_artifact("b", "value_b", "agent2", artifact_type="research")

        all_arts = await bus.list_artifacts()
        assert len(all_arts) == 2

        code_arts = await bus.list_artifacts(artifact_type="code")
        assert len(code_arts) == 1
        assert code_arts[0]["key"] == "a"

    @pytest.mark.asyncio
    async def test_message_history(self, bus):
        await bus.send("a", "b", "msg1")
        await bus.send("b", "a", "msg2")
        await bus.send("a", "c", "msg3")

        all_history = bus.get_history()
        assert len(all_history) == 3

        a_history = bus.get_history(agent_id="a")
        assert len(a_history) == 3  # a is involved in all

    @pytest.mark.asyncio
    async def test_global_subscriber(self, bus):
        all_messages = []

        async def logger(msg):
            all_messages.append(msg)

        await bus.subscribe_global(logger)
        await bus.send("a", "b", "direct")
        await bus.broadcast("a", "broadcast")

        assert len(all_messages) == 2

    def test_active_agents(self, bus):
        assert bus.active_agents == []

        asyncio.get_event_loop().run_until_complete(
            bus.subscribe("agent_x", lambda msg: None)
        )
        assert "agent_x" in bus.active_agents
