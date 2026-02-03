"""Twilio integration — phone calls and SMS.

Agents can call the user, send SMS updates, and receive callbacks.
"""

from __future__ import annotations

import logging
import os
from typing import Any

from ..core.tool_registry import ToolRegistry, ToolResult

logger = logging.getLogger(__name__)


def _get_twilio_client() -> Any:
    """Get Twilio client (lazy import)."""
    try:
        from twilio.rest import Client
    except ImportError:
        raise ImportError("Install twilio: pip install 'dropfly-agent[communication]'")

    sid = os.environ.get("TWILIO_ACCOUNT_SID", "")
    token = os.environ.get("TWILIO_AUTH_TOKEN", "")

    if not sid or not token:
        raise ValueError("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN required")

    return Client(sid, token)


async def send_sms(to: str, message: str) -> ToolResult:
    """Send an SMS message.

    Args:
        to: Phone number to send to (E.164 format, e.g., +1234567890).
        message: Message text (max 1600 chars).
    """
    try:
        client = _get_twilio_client()
        from_number = os.environ.get("TWILIO_PHONE_NUMBER", "")
        if not from_number:
            return ToolResult(output="", success=False, error="TWILIO_PHONE_NUMBER not set")

        msg = client.messages.create(
            body=message[:1600],
            from_=from_number,
            to=to,
        )

        return ToolResult(
            output=f"SMS sent to {to}. SID: {msg.sid}",
            success=True,
            artifacts={"sid": msg.sid, "to": to, "status": msg.status},
        )
    except ImportError as e:
        return ToolResult(output="", success=False, error=str(e))
    except Exception as e:
        return ToolResult(output="", success=False, error=f"SMS failed: {e}")


async def make_call(
    to: str,
    twiml: str | None = None,
    message: str | None = None,
    callback_url: str | None = None,
) -> ToolResult:
    """Make a phone call.

    Args:
        to: Phone number to call (E.164 format).
        twiml: TwiML instructions for the call.
        message: Simple text message to speak (uses TTS).
        callback_url: URL for call status callbacks.
    """
    try:
        client = _get_twilio_client()
        from_number = os.environ.get("TWILIO_PHONE_NUMBER", "")
        if not from_number:
            return ToolResult(output="", success=False, error="TWILIO_PHONE_NUMBER not set")

        call_params: dict[str, Any] = {
            "from_": from_number,
            "to": to,
        }

        if twiml:
            call_params["twiml"] = twiml
        elif message:
            call_params["twiml"] = f"<Response><Say voice='Polly.Matthew'>{message}</Say></Response>"
        else:
            return ToolResult(output="", success=False, error="Provide 'twiml' or 'message'")

        if callback_url:
            call_params["status_callback"] = callback_url

        call = client.calls.create(**call_params)

        return ToolResult(
            output=f"Call initiated to {to}. SID: {call.sid}",
            success=True,
            artifacts={"sid": call.sid, "to": to, "status": call.status},
        )
    except ImportError as e:
        return ToolResult(output="", success=False, error=str(e))
    except Exception as e:
        return ToolResult(output="", success=False, error=f"Call failed: {e}")


def register_twilio_tools(registry: ToolRegistry) -> None:
    """Register Twilio communication tools."""
    registry.register(
        name="send_sms",
        description="Send an SMS text message to a phone number.",
        parameters={
            "type": "object",
            "properties": {
                "to": {"type": "string", "description": "Phone number (E.164, e.g., +1234567890)"},
                "message": {"type": "string", "description": "SMS message text"},
            },
            "required": ["to", "message"],
        },
        handler=send_sms,
        requires_approval=True,
        tags=["communication", "twilio"],
    )

    registry.register(
        name="make_call",
        description="Make a phone call with a spoken message.",
        parameters={
            "type": "object",
            "properties": {
                "to": {"type": "string", "description": "Phone number (E.164)"},
                "message": {"type": "string", "description": "Message to speak on the call"},
                "twiml": {"type": "string", "description": "Raw TwiML (advanced)"},
            },
            "required": ["to"],
        },
        handler=make_call,
        requires_approval=True,
        tags=["communication", "twilio"],
    )
