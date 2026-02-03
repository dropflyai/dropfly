"""Voice synthesis tools — ElevenLabs TTS.

Generate spoken audio from text for phone calls, voice messages,
and audio content.
"""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Any

from ..core.tool_registry import ToolRegistry, ToolResult

logger = logging.getLogger(__name__)


async def text_to_speech(
    text: str,
    output_path: str = "/tmp/dropfly_speech.mp3",
    voice: str = "Adam",
    model: str = "eleven_turbo_v2_5",
) -> ToolResult:
    """Convert text to speech using ElevenLabs.

    Args:
        text: Text to convert to speech.
        output_path: File path to save the audio.
        voice: Voice name (Adam, Rachel, Clyde, etc.).
        model: ElevenLabs model to use.
    """
    api_key = os.environ.get("ELEVENLABS_API_KEY", "")
    if not api_key:
        return ToolResult(output="", success=False, error="ELEVENLABS_API_KEY not set")

    try:
        import httpx

        # Get voice ID from name
        voice_id = await _resolve_voice_id(api_key, voice)
        if not voice_id:
            return ToolResult(output="", success=False, error=f"Voice '{voice}' not found")

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
                json={
                    "text": text,
                    "model_id": model,
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.75,
                    },
                },
                headers={
                    "xi-api-key": api_key,
                    "Content-Type": "application/json",
                    "Accept": "audio/mpeg",
                },
            )

        if response.status_code == 200:
            Path(output_path).parent.mkdir(parents=True, exist_ok=True)
            Path(output_path).write_bytes(response.content)

            size_kb = len(response.content) / 1024
            return ToolResult(
                output=f"Audio saved: {output_path} ({size_kb:.1f} KB)",
                success=True,
                artifacts={
                    "path": output_path,
                    "size_bytes": len(response.content),
                    "voice": voice,
                },
            )
        else:
            return ToolResult(
                output="",
                success=False,
                error=f"ElevenLabs API error {response.status_code}: {response.text[:200]}",
            )
    except ImportError:
        return ToolResult(output="", success=False, error="httpx required: pip install httpx")
    except Exception as e:
        return ToolResult(output="", success=False, error=f"TTS failed: {e}")


async def list_voices() -> ToolResult:
    """List available ElevenLabs voices."""
    api_key = os.environ.get("ELEVENLABS_API_KEY", "")
    if not api_key:
        return ToolResult(output="", success=False, error="ELEVENLABS_API_KEY not set")

    try:
        import httpx

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                "https://api.elevenlabs.io/v1/voices",
                headers={"xi-api-key": api_key},
            )

        if response.status_code == 200:
            data = response.json()
            voices = data.get("voices", [])
            lines = [f"Available voices ({len(voices)}):"]
            for v in voices[:30]:
                labels = v.get("labels", {})
                accent = labels.get("accent", "")
                gender = labels.get("gender", "")
                lines.append(f"  - {v['name']} ({gender}, {accent}) [{v['voice_id'][:8]}...]")
            return ToolResult(output="\n".join(lines), success=True)
        else:
            return ToolResult(output="", success=False, error=f"API error: {response.status_code}")
    except Exception as e:
        return ToolResult(output="", success=False, error=str(e))


async def _resolve_voice_id(api_key: str, voice_name: str) -> str | None:
    """Resolve a voice name to a voice ID."""
    try:
        import httpx

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                "https://api.elevenlabs.io/v1/voices",
                headers={"xi-api-key": api_key},
            )

        if response.status_code == 200:
            voices = response.json().get("voices", [])
            for v in voices:
                if v["name"].lower() == voice_name.lower():
                    return v["voice_id"]
            # Return first voice as fallback
            if voices:
                return voices[0]["voice_id"]
    except Exception:
        pass
    return None


def register_voice_tools(registry: ToolRegistry) -> None:
    """Register voice synthesis tools."""
    registry.register(
        name="text_to_speech",
        description="Convert text to spoken audio using ElevenLabs. Saves an MP3 file.",
        parameters={
            "type": "object",
            "properties": {
                "text": {"type": "string", "description": "Text to speak"},
                "output_path": {"type": "string", "description": "File path for audio output"},
                "voice": {"type": "string", "description": "Voice name (e.g., Adam, Rachel)"},
            },
            "required": ["text"],
        },
        handler=text_to_speech,
        tags=["voice", "communication"],
    )

    registry.register(
        name="list_voices",
        description="List available ElevenLabs voices.",
        parameters={"type": "object", "properties": {}},
        handler=list_voices,
        tags=["voice"],
    )
