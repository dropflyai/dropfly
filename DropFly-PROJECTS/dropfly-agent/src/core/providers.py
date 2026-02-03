"""SDK-agnostic LLM provider layer.

Supports any LLM SDK through a unified interface. Add providers by subclassing
LLMProvider and registering with ProviderRegistry.

Built-in providers: Anthropic, OpenAI, Ollama. Install extras for Google, Mistral.
"""

from __future__ import annotations

import os
import asyncio
import json
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, AsyncIterator, Callable, Optional

from pydantic import BaseModel

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Universal message / tool types (SDK-agnostic)
# ---------------------------------------------------------------------------


class Role(str, Enum):
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"
    TOOL = "tool"


@dataclass
class Message:
    """Universal message format that works across all providers."""

    role: Role
    content: str
    name: Optional[str] = None
    tool_call_id: Optional[str] = None
    tool_calls: list[ToolCall] = field(default_factory=list)


@dataclass
class ToolCall:
    """A tool invocation requested by the model."""

    id: str
    name: str
    arguments: dict[str, Any]


@dataclass
class ToolDefinition:
    """Universal tool definition that gets translated per-provider."""

    name: str
    description: str
    parameters: dict[str, Any]  # JSON Schema


class StopReason(str, Enum):
    END_TURN = "end_turn"
    TOOL_USE = "tool_use"
    MAX_TOKENS = "max_tokens"
    ERROR = "error"


@dataclass
class LLMResponse:
    """Universal response from any provider."""

    content: str
    stop_reason: StopReason
    tool_calls: list[ToolCall] = field(default_factory=list)
    input_tokens: int = 0
    output_tokens: int = 0
    model: str = ""
    raw: Any = None  # Original provider response for advanced use


@dataclass
class StreamChunk:
    """A chunk from a streaming response."""

    content: str = ""
    tool_call: Optional[ToolCall] = None
    done: bool = False
    stop_reason: Optional[StopReason] = None


# ---------------------------------------------------------------------------
# Abstract LLM Provider
# ---------------------------------------------------------------------------


class LLMProvider(ABC):
    """Abstract base for all LLM providers.

    Subclass this to add support for any new SDK. Implement the three methods:
    - complete() for synchronous completion
    - acomplete() for async completion
    - astream() for async streaming
    """

    provider_name: str = "base"

    @abstractmethod
    async def acomplete(
        self,
        messages: list[Message],
        tools: list[ToolDefinition] | None = None,
        system: str | None = None,
        model: str | None = None,
        max_tokens: int = 4096,
        temperature: float = 0.0,
        **kwargs: Any,
    ) -> LLMResponse:
        """Async completion."""
        ...

    @abstractmethod
    async def astream(
        self,
        messages: list[Message],
        tools: list[ToolDefinition] | None = None,
        system: str | None = None,
        model: str | None = None,
        max_tokens: int = 4096,
        temperature: float = 0.0,
        **kwargs: Any,
    ) -> AsyncIterator[StreamChunk]:
        """Async streaming completion."""
        ...
        # Make this an async generator
        yield StreamChunk()  # type: ignore[misc]

    def complete(
        self,
        messages: list[Message],
        tools: list[ToolDefinition] | None = None,
        system: str | None = None,
        model: str | None = None,
        max_tokens: int = 4096,
        temperature: float = 0.0,
        **kwargs: Any,
    ) -> LLMResponse:
        """Sync wrapper around acomplete."""
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures

            with concurrent.futures.ThreadPoolExecutor() as pool:
                return pool.submit(
                    asyncio.run,
                    self.acomplete(messages, tools, system, model, max_tokens, temperature, **kwargs),
                ).result()
        return asyncio.run(
            self.acomplete(messages, tools, system, model, max_tokens, temperature, **kwargs)
        )


# ---------------------------------------------------------------------------
# Anthropic Provider
# ---------------------------------------------------------------------------


class AnthropicProvider(LLMProvider):
    """Provider for Anthropic Claude models."""

    provider_name = "anthropic"

    def __init__(self, api_key: str | None = None):
        import anthropic

        self.api_key = api_key or os.environ.get("ANTHROPIC_API_KEY", "")
        self.client = anthropic.Anthropic(api_key=self.api_key)
        self.async_client = anthropic.AsyncAnthropic(api_key=self.api_key)

    def _convert_messages(self, messages: list[Message]) -> list[dict[str, Any]]:
        """Convert universal messages to Anthropic format."""
        result = []
        for msg in messages:
            if msg.role == Role.SYSTEM:
                continue  # Anthropic uses separate system param

            if msg.role == Role.TOOL:
                result.append(
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "tool_result",
                                "tool_use_id": msg.tool_call_id,
                                "content": msg.content,
                            }
                        ],
                    }
                )
            elif msg.tool_calls:
                content: list[dict[str, Any]] = []
                if msg.content:
                    content.append({"type": "text", "text": msg.content})
                for tc in msg.tool_calls:
                    content.append(
                        {
                            "type": "tool_use",
                            "id": tc.id,
                            "name": tc.name,
                            "input": tc.arguments,
                        }
                    )
                result.append({"role": "assistant", "content": content})
            else:
                result.append({"role": msg.role.value, "content": msg.content})

        return result

    def _convert_tools(self, tools: list[ToolDefinition]) -> list[dict[str, Any]]:
        """Convert universal tool definitions to Anthropic format."""
        return [
            {
                "name": t.name,
                "description": t.description,
                "input_schema": t.parameters,
            }
            for t in tools
        ]

    def _parse_response(self, response: Any) -> LLMResponse:
        """Parse Anthropic response to universal format."""
        content = ""
        tool_calls = []

        for block in response.content:
            if hasattr(block, "text"):
                content = block.text
            elif block.type == "tool_use":
                tool_calls.append(
                    ToolCall(id=block.id, name=block.name, arguments=block.input)
                )

        stop_map = {
            "end_turn": StopReason.END_TURN,
            "tool_use": StopReason.TOOL_USE,
            "max_tokens": StopReason.MAX_TOKENS,
        }

        return LLMResponse(
            content=content,
            stop_reason=stop_map.get(response.stop_reason, StopReason.END_TURN),
            tool_calls=tool_calls,
            input_tokens=response.usage.input_tokens,
            output_tokens=response.usage.output_tokens,
            model=response.model,
            raw=response,
        )

    async def acomplete(
        self,
        messages: list[Message],
        tools: list[ToolDefinition] | None = None,
        system: str | None = None,
        model: str | None = None,
        max_tokens: int = 4096,
        temperature: float = 0.0,
        **kwargs: Any,
    ) -> LLMResponse:
        api_messages = self._convert_messages(messages)
        api_tools = self._convert_tools(tools) if tools else None

        params: dict[str, Any] = {
            "model": model or "claude-sonnet-4-20250514",
            "max_tokens": max_tokens,
            "messages": api_messages,
            "temperature": temperature,
        }
        if system:
            params["system"] = system
        if api_tools:
            params["tools"] = api_tools
        params.update(kwargs)

        response = await self.async_client.messages.create(**params)
        return self._parse_response(response)

    async def astream(
        self,
        messages: list[Message],
        tools: list[ToolDefinition] | None = None,
        system: str | None = None,
        model: str | None = None,
        max_tokens: int = 4096,
        temperature: float = 0.0,
        **kwargs: Any,
    ) -> AsyncIterator[StreamChunk]:
        api_messages = self._convert_messages(messages)
        api_tools = self._convert_tools(tools) if tools else None

        params: dict[str, Any] = {
            "model": model or "claude-sonnet-4-20250514",
            "max_tokens": max_tokens,
            "messages": api_messages,
            "temperature": temperature,
        }
        if system:
            params["system"] = system
        if api_tools:
            params["tools"] = api_tools
        params.update(kwargs)

        async with self.async_client.messages.stream(**params) as stream:
            async for event in stream:
                if hasattr(event, "type"):
                    if event.type == "content_block_delta":
                        if hasattr(event.delta, "text"):
                            yield StreamChunk(content=event.delta.text)
                    elif event.type == "message_stop":
                        yield StreamChunk(done=True, stop_reason=StopReason.END_TURN)


# ---------------------------------------------------------------------------
# OpenAI Provider
# ---------------------------------------------------------------------------


class OpenAIProvider(LLMProvider):
    """Provider for OpenAI GPT models (and compatible APIs like Azure, Together, etc.)."""

    provider_name = "openai"

    def __init__(self, api_key: str | None = None, base_url: str | None = None):
        try:
            from openai import AsyncOpenAI, OpenAI
        except ImportError:
            raise ImportError("Install openai: pip install 'dropfly-agent[openai]'")

        self.api_key = api_key or os.environ.get("OPENAI_API_KEY", "")
        self.client = OpenAI(api_key=self.api_key, base_url=base_url)
        self.async_client = AsyncOpenAI(api_key=self.api_key, base_url=base_url)

    def _convert_messages(
        self, messages: list[Message], system: str | None = None
    ) -> list[dict[str, Any]]:
        result = []
        if system:
            result.append({"role": "system", "content": system})

        for msg in messages:
            if msg.role == Role.SYSTEM:
                result.append({"role": "system", "content": msg.content})
            elif msg.role == Role.TOOL:
                result.append(
                    {
                        "role": "tool",
                        "tool_call_id": msg.tool_call_id,
                        "content": msg.content,
                    }
                )
            elif msg.tool_calls:
                oai_tool_calls = [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.name,
                            "arguments": json.dumps(tc.arguments),
                        },
                    }
                    for tc in msg.tool_calls
                ]
                result.append(
                    {
                        "role": "assistant",
                        "content": msg.content or None,
                        "tool_calls": oai_tool_calls,
                    }
                )
            else:
                result.append({"role": msg.role.value, "content": msg.content})

        return result

    def _convert_tools(self, tools: list[ToolDefinition]) -> list[dict[str, Any]]:
        return [
            {
                "type": "function",
                "function": {
                    "name": t.name,
                    "description": t.description,
                    "parameters": t.parameters,
                },
            }
            for t in tools
        ]

    async def acomplete(
        self,
        messages: list[Message],
        tools: list[ToolDefinition] | None = None,
        system: str | None = None,
        model: str | None = None,
        max_tokens: int = 4096,
        temperature: float = 0.0,
        **kwargs: Any,
    ) -> LLMResponse:
        api_messages = self._convert_messages(messages, system)
        api_tools = self._convert_tools(tools) if tools else None

        params: dict[str, Any] = {
            "model": model or "gpt-4o",
            "max_tokens": max_tokens,
            "messages": api_messages,
            "temperature": temperature,
        }
        if api_tools:
            params["tools"] = api_tools
        params.update(kwargs)

        response = await self.async_client.chat.completions.create(**params)
        choice = response.choices[0]

        content = choice.message.content or ""
        tool_calls = []
        if choice.message.tool_calls:
            for tc in choice.message.tool_calls:
                tool_calls.append(
                    ToolCall(
                        id=tc.id,
                        name=tc.function.name,
                        arguments=json.loads(tc.function.arguments),
                    )
                )

        stop_map = {"stop": StopReason.END_TURN, "tool_calls": StopReason.TOOL_USE}

        return LLMResponse(
            content=content,
            stop_reason=stop_map.get(choice.finish_reason or "stop", StopReason.END_TURN),
            tool_calls=tool_calls,
            input_tokens=response.usage.prompt_tokens if response.usage else 0,
            output_tokens=response.usage.completion_tokens if response.usage else 0,
            model=response.model or "",
            raw=response,
        )

    async def astream(
        self,
        messages: list[Message],
        tools: list[ToolDefinition] | None = None,
        system: str | None = None,
        model: str | None = None,
        max_tokens: int = 4096,
        temperature: float = 0.0,
        **kwargs: Any,
    ) -> AsyncIterator[StreamChunk]:
        api_messages = self._convert_messages(messages, system)
        api_tools = self._convert_tools(tools) if tools else None

        params: dict[str, Any] = {
            "model": model or "gpt-4o",
            "max_tokens": max_tokens,
            "messages": api_messages,
            "temperature": temperature,
            "stream": True,
        }
        if api_tools:
            params["tools"] = api_tools
        params.update(kwargs)

        stream = await self.async_client.chat.completions.create(**params)
        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield StreamChunk(content=chunk.choices[0].delta.content)
            if chunk.choices and chunk.choices[0].finish_reason:
                yield StreamChunk(done=True, stop_reason=StopReason.END_TURN)


# ---------------------------------------------------------------------------
# Ollama Provider (local models)
# ---------------------------------------------------------------------------


class OllamaProvider(LLMProvider):
    """Provider for locally-running models via Ollama."""

    provider_name = "ollama"

    def __init__(self, base_url: str | None = None):
        self.base_url = base_url or os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
        # Ollama uses OpenAI-compatible API
        try:
            from openai import AsyncOpenAI
        except ImportError:
            raise ImportError("Install openai for Ollama compatibility: pip install openai")

        self.async_client = AsyncOpenAI(
            api_key="ollama",
            base_url=f"{self.base_url}/v1",
        )

    async def acomplete(
        self,
        messages: list[Message],
        tools: list[ToolDefinition] | None = None,
        system: str | None = None,
        model: str | None = None,
        max_tokens: int = 4096,
        temperature: float = 0.0,
        **kwargs: Any,
    ) -> LLMResponse:
        # Reuse OpenAI format since Ollama is compatible
        api_messages: list[dict[str, Any]] = []
        if system:
            api_messages.append({"role": "system", "content": system})
        for msg in messages:
            api_messages.append({"role": msg.role.value, "content": msg.content})

        response = await self.async_client.chat.completions.create(
            model=model or "llama3.2",
            messages=api_messages,
            max_tokens=max_tokens,
            temperature=temperature,
        )

        choice = response.choices[0]
        return LLMResponse(
            content=choice.message.content or "",
            stop_reason=StopReason.END_TURN,
            model=response.model or model or "",
            raw=response,
        )

    async def astream(
        self,
        messages: list[Message],
        tools: list[ToolDefinition] | None = None,
        system: str | None = None,
        model: str | None = None,
        max_tokens: int = 4096,
        temperature: float = 0.0,
        **kwargs: Any,
    ) -> AsyncIterator[StreamChunk]:
        api_messages: list[dict[str, Any]] = []
        if system:
            api_messages.append({"role": "system", "content": system})
        for msg in messages:
            api_messages.append({"role": msg.role.value, "content": msg.content})

        stream = await self.async_client.chat.completions.create(
            model=model or "llama3.2",
            messages=api_messages,
            max_tokens=max_tokens,
            temperature=temperature,
            stream=True,
        )

        async for chunk in stream:
            if chunk.choices and chunk.choices[0].delta.content:
                yield StreamChunk(content=chunk.choices[0].delta.content)
            if chunk.choices and chunk.choices[0].finish_reason:
                yield StreamChunk(done=True, stop_reason=StopReason.END_TURN)


# ---------------------------------------------------------------------------
# Provider Registry
# ---------------------------------------------------------------------------


class ProviderRegistry:
    """Registry for LLM providers. Add any provider at runtime.

    Usage:
        registry = ProviderRegistry()
        registry.register("anthropic", AnthropicProvider(api_key="..."))
        registry.register("openai", OpenAIProvider(api_key="..."))
        registry.register("my-custom", MyCustomProvider())

        provider = registry.get("anthropic")
        response = await provider.acomplete(messages)
    """

    def __init__(self) -> None:
        self._providers: dict[str, LLMProvider] = {}
        self._model_map: dict[str, str] = {}  # model_name -> provider_name

    def register(self, name: str, provider: LLMProvider) -> None:
        """Register a provider instance."""
        self._providers[name] = provider
        logger.info(f"Registered LLM provider: {name}")

    def get(self, name: str) -> LLMProvider:
        """Get a registered provider by name."""
        if name not in self._providers:
            available = ", ".join(self._providers.keys())
            raise KeyError(f"Provider '{name}' not registered. Available: {available}")
        return self._providers[name]

    def map_model(self, model_id: str, provider_name: str) -> None:
        """Map a model identifier to a provider.

        Example: registry.map_model("claude-opus-4-5", "anthropic")
        """
        self._model_map[model_id] = provider_name

    def resolve(self, model_id: str) -> tuple[LLMProvider, str]:
        """Resolve a model string like 'anthropic/claude-opus-4-5' to (provider, model).

        Supports formats:
            - "provider/model" (explicit)
            - "model" (uses model map or defaults to first provider)
        """
        if "/" in model_id:
            provider_name, model_name = model_id.split("/", 1)
            return self.get(provider_name), model_name

        if model_id in self._model_map:
            provider_name = self._model_map[model_id]
            return self.get(provider_name), model_id

        # Heuristic: match by prefix
        if model_id.startswith("claude"):
            return self.get("anthropic"), model_id
        if model_id.startswith("gpt") or model_id.startswith("o1") or model_id.startswith("o3"):
            return self.get("openai"), model_id
        if model_id.startswith("llama") or model_id.startswith("mistral"):
            if "ollama" in self._providers:
                return self.get("ollama"), model_id

        # Default to first registered
        if self._providers:
            first = next(iter(self._providers.values()))
            return first, model_id

        raise KeyError(f"Cannot resolve model '{model_id}' — no providers registered")

    @property
    def available(self) -> list[str]:
        return list(self._providers.keys())

    def auto_register(self) -> None:
        """Auto-register providers based on available environment variables."""
        if os.environ.get("ANTHROPIC_API_KEY"):
            try:
                self.register("anthropic", AnthropicProvider())
                logger.info("Auto-registered Anthropic provider")
            except Exception as e:
                logger.warning(f"Failed to auto-register Anthropic: {e}")

        if os.environ.get("OPENAI_API_KEY"):
            try:
                self.register("openai", OpenAIProvider())
                logger.info("Auto-registered OpenAI provider")
            except ImportError:
                logger.debug("OpenAI SDK not installed, skipping")
            except Exception as e:
                logger.warning(f"Failed to auto-register OpenAI: {e}")

        if os.environ.get("OLLAMA_BASE_URL") or self._is_ollama_running():
            try:
                self.register("ollama", OllamaProvider())
                logger.info("Auto-registered Ollama provider")
            except ImportError:
                logger.debug("OpenAI SDK not installed for Ollama compatibility")
            except Exception as e:
                logger.warning(f"Failed to auto-register Ollama: {e}")

    def _is_ollama_running(self) -> bool:
        """Check if Ollama is running locally."""
        try:
            import httpx

            resp = httpx.get("http://localhost:11434/api/version", timeout=1.0)
            return resp.status_code == 200
        except Exception:
            return False
