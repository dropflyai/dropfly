"""Email tools — send reports, notifications, and updates.

Supports SMTP (any provider), Amazon SES, and Resend.
"""

from __future__ import annotations

import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any

from ..core.tool_registry import ToolRegistry, ToolResult

logger = logging.getLogger(__name__)


async def send_email(
    to: str,
    subject: str,
    body: str,
    html: bool = False,
    from_email: str | None = None,
    reply_to: str | None = None,
) -> ToolResult:
    """Send an email via SMTP.

    Args:
        to: Recipient email address.
        subject: Email subject.
        body: Email body (plain text or HTML).
        html: If True, body is treated as HTML.
        from_email: Sender email (defaults to env).
        reply_to: Reply-to address.
    """
    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    smtp_user = os.environ.get("SMTP_USER", "")
    smtp_pass = os.environ.get("SMTP_PASSWORD", "")
    sender = from_email or os.environ.get("EMAIL_FROM", smtp_user)

    if not smtp_user or not smtp_pass:
        return ToolResult(
            output="",
            success=False,
            error="SMTP_USER and SMTP_PASSWORD environment variables required",
        )

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = sender
        msg["To"] = to
        if reply_to:
            msg["Reply-To"] = reply_to

        content_type = "html" if html else "plain"
        msg.attach(MIMEText(body, content_type))

        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(sender, [to], msg.as_string())

        return ToolResult(
            output=f"Email sent to {to}: {subject}",
            success=True,
            artifacts={"to": to, "subject": subject},
        )
    except Exception as e:
        return ToolResult(output="", success=False, error=f"Email failed: {e}")


async def send_email_resend(
    to: str,
    subject: str,
    body: str,
    html: bool = False,
    from_email: str = "DropFly Agent <agent@dropfly.io>",
) -> ToolResult:
    """Send an email via Resend API (simpler than SMTP).

    Args:
        to: Recipient email.
        subject: Email subject.
        body: Email body.
        html: If True, body is HTML.
        from_email: Sender email.
    """
    api_key = os.environ.get("RESEND_API_KEY", "")
    if not api_key:
        return ToolResult(output="", success=False, error="RESEND_API_KEY not set")

    try:
        import httpx

        payload: dict[str, Any] = {
            "from": from_email,
            "to": [to],
            "subject": subject,
        }
        if html:
            payload["html"] = body
        else:
            payload["text"] = body

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.resend.com/emails",
                json=payload,
                headers={"Authorization": f"Bearer {api_key}"},
            )

        if response.status_code == 200:
            data = response.json()
            return ToolResult(
                output=f"Email sent via Resend to {to}: {subject}",
                success=True,
                artifacts={"id": data.get("id"), "to": to},
            )
        else:
            return ToolResult(
                output="",
                success=False,
                error=f"Resend API error {response.status_code}: {response.text}",
            )
    except Exception as e:
        return ToolResult(output="", success=False, error=f"Resend failed: {e}")


def register_email_tools(registry: ToolRegistry) -> None:
    """Register email tools."""
    registry.register(
        name="send_email",
        description="Send an email via SMTP.",
        parameters={
            "type": "object",
            "properties": {
                "to": {"type": "string", "description": "Recipient email"},
                "subject": {"type": "string", "description": "Email subject"},
                "body": {"type": "string", "description": "Email body"},
                "html": {"type": "boolean", "description": "Send as HTML (default false)"},
                "reply_to": {"type": "string", "description": "Reply-to address"},
            },
            "required": ["to", "subject", "body"],
        },
        handler=send_email,
        requires_approval=True,
        tags=["communication", "email"],
    )

    registry.register(
        name="send_email_resend",
        description="Send an email via Resend API (simpler, no SMTP config needed).",
        parameters={
            "type": "object",
            "properties": {
                "to": {"type": "string", "description": "Recipient email"},
                "subject": {"type": "string", "description": "Email subject"},
                "body": {"type": "string", "description": "Email body"},
                "html": {"type": "boolean", "description": "Send as HTML"},
            },
            "required": ["to", "subject", "body"],
        },
        handler=send_email_resend,
        requires_approval=True,
        tags=["communication", "email"],
    )
