"""Communication Agent — handles all user notifications.

Twilio calls/SMS, email, voice synthesis. Knows WHEN and HOW
to reach the user based on urgency and preference.
"""

from __future__ import annotations

from typing import Any

from ..core.base_agent import BaseAgent
from ..core.tool_registry import ToolRegistry
from ..tools.twilio_tools import register_twilio_tools
from ..tools.email_tools import register_email_tools
from ..tools.voice_tools import register_voice_tools


class CommunicationAgent(BaseAgent):
    """Communication Agent — notifies users via phone, SMS, email, voice.

    Decides the best channel based on:
    - Urgency (critical = phone call, normal = email, info = SMS)
    - User preferences
    - Time of day
    """

    agent_type = "communication"
    default_model = "anthropic/claude-haiku-4-20250414"  # Fast model for notifications

    def _get_system_prompt(self, context: str | None = None) -> str:
        prompt = """# COMMUNICATION AGENT — User Notification Specialist

## Identity
You handle all outbound communication to the user. You decide the best channel
and format based on urgency and context.

## Channels
- **Phone call** (make_call) — For CRITICAL updates only (build failed, needs input)
- **SMS** (send_sms) — For important updates (build complete, question needed)
- **Email** (send_email / send_email_resend) — For reports, summaries, detailed updates
- **Voice synthesis** (text_to_speech) — Generate audio for calls or voice messages

## Decision Framework
| Urgency | Channel | Example |
|---------|---------|---------|
| Critical | Phone call | Build blocked, needs user decision |
| High | SMS | Build complete, ready for review |
| Normal | Email | Daily status report, detailed results |
| Low | Email (batch) | Weekly summary, non-urgent updates |

## Rules
- NEVER spam the user — batch low-priority notifications
- ALWAYS include actionable information (URLs, next steps)
- Keep SMS under 160 chars when possible
- Use professional but friendly tone
- Include project name in all communications
- For calls, keep the spoken message under 30 seconds
"""
        if context:
            prompt += f"\n\n## Context\n{context}"
        return prompt

    def _register_tools(self, registry: ToolRegistry) -> None:
        register_twilio_tools(registry)
        register_email_tools(registry)
        register_voice_tools(registry)

        registry.register(
            name="notify_user",
            description=(
                "Send a notification to the user via the best channel "
                "based on urgency (critical/high/normal/low)."
            ),
            parameters={
                "type": "object",
                "properties": {
                    "message": {"type": "string", "description": "Notification message"},
                    "urgency": {
                        "type": "string",
                        "enum": ["critical", "high", "normal", "low"],
                        "description": "Urgency level determines channel",
                    },
                    "subject": {"type": "string", "description": "Subject (for email)"},
                    "details": {"type": "string", "description": "Detailed info (for email body)"},
                },
                "required": ["message", "urgency"],
            },
            handler=self._notify_user,
            tags=["communication"],
        )

    async def _notify_user(
        self,
        message: str,
        urgency: str = "normal",
        subject: str | None = None,
        details: str | None = None,
    ) -> str:
        """Route notification to the best channel based on urgency."""
        # For now, log the notification. In production, this would check
        # user preferences and route to the appropriate channel.
        return (
            f"[{urgency.upper()}] Notification queued: {message}\n"
            f"Channel: {'phone' if urgency == 'critical' else 'sms' if urgency == 'high' else 'email'}\n"
            f"Subject: {subject or 'N/A'}\n"
            f"Details: {(details or 'N/A')[:200]}"
        )
