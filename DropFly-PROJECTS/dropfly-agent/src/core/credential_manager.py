"""Credential management — never store secrets in plain text.

Uses AWS Secrets Manager when available, falls back to environment variables.
Provides a unified interface for all agents to access credentials.
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any, Optional

logger = logging.getLogger(__name__)


class CredentialManager:
    """Manages credentials securely.

    Priority:
    1. AWS Secrets Manager (production)
    2. Environment variables (development)

    Usage:
        creds = CredentialManager()
        api_key = creds.get("ANTHROPIC_API_KEY")
        twilio_sid = creds.get("TWILIO_ACCOUNT_SID")
    """

    def __init__(
        self,
        use_aws: bool | None = None,
        aws_region: str = "us-east-1",
        secret_prefix: str = "dropfly-agent/",
    ):
        self._aws_client: Any = None
        self._aws_cache: dict[str, str] = {}
        self._secret_prefix = secret_prefix

        # Auto-detect AWS availability
        if use_aws is None:
            use_aws = bool(
                os.environ.get("AWS_ACCESS_KEY_ID")
                and os.environ.get("AWS_SECRET_ACCESS_KEY")
            )

        self._use_aws = use_aws

        if use_aws:
            try:
                import boto3

                self._aws_client = boto3.client(
                    "secretsmanager",
                    region_name=aws_region,
                )
                logger.info("CredentialManager using AWS Secrets Manager")
            except ImportError:
                logger.warning("boto3 not installed, falling back to env vars")
                self._use_aws = False
            except Exception as e:
                logger.warning(f"AWS Secrets Manager unavailable: {e}")
                self._use_aws = False

    def get(self, key: str, default: str = "") -> str:
        """Get a credential value.

        Args:
            key: Credential key (e.g., "ANTHROPIC_API_KEY").
            default: Default value if not found.

        Returns:
            The credential value.
        """
        # Try AWS first
        if self._use_aws and self._aws_client:
            value = self._get_from_aws(key)
            if value:
                return value

        # Fall back to environment
        return os.environ.get(key, default)

    def get_json(self, key: str) -> dict[str, Any]:
        """Get a JSON credential (for complex secrets).

        Args:
            key: Secret key.

        Returns:
            Parsed JSON dict.
        """
        raw = self.get(key)
        if raw:
            try:
                return json.loads(raw)
            except json.JSONDecodeError:
                logger.warning(f"Failed to parse JSON secret: {key}")
        return {}

    def set(self, key: str, value: str) -> bool:
        """Store a credential in AWS Secrets Manager.

        Args:
            key: Credential key.
            value: Credential value.

        Returns:
            True if stored successfully.
        """
        if not self._use_aws or not self._aws_client:
            logger.warning("Cannot store credentials without AWS Secrets Manager")
            return False

        secret_name = f"{self._secret_prefix}{key}"
        try:
            try:
                self._aws_client.create_secret(
                    Name=secret_name,
                    SecretString=value,
                )
            except self._aws_client.exceptions.ResourceExistsException:
                self._aws_client.update_secret(
                    SecretId=secret_name,
                    SecretString=value,
                )

            self._aws_cache[key] = value
            logger.info(f"Stored credential: {key}")
            return True
        except Exception as e:
            logger.error(f"Failed to store credential {key}: {e}")
            return False

    def _get_from_aws(self, key: str) -> str | None:
        """Retrieve a secret from AWS Secrets Manager."""
        if key in self._aws_cache:
            return self._aws_cache[key]

        secret_name = f"{self._secret_prefix}{key}"
        try:
            response = self._aws_client.get_secret_value(SecretId=secret_name)
            value = response.get("SecretString", "")
            self._aws_cache[key] = value
            return value
        except Exception:
            return None

    @property
    def is_aws_available(self) -> bool:
        return self._use_aws and self._aws_client is not None
