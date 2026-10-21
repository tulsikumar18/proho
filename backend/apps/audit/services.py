"""
Audit service layer for logging system and administrative events securely.
"""

from typing import Any, Dict, Optional
import copy
from .models import AuditLog

# Keys to sanitize or redact from audit metadata
SENSITIVE_KEYS = {
    "password",
    "password_confirm",
    "token",
    "access_token",
    "refresh_token",
    "otp",
    "code",
    "secret",
    "authorization",
    "account_number",
    "pan_number",
    "aadhaar_number",
}


class AuditService:
    """Service providing centralized, sanitized audit logging."""

    @staticmethod
    def sanitize_metadata(data: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Recursively redact sensitive keys from audit metadata."""
        if not data or not isinstance(data, dict):
            return {}

        sanitized = copy.deepcopy(data)

        def _clean_dict(d: dict):
            for key, value in list(d.items()):
                if any(sens in key.lower() for sens in SENSITIVE_KEYS):
                    d[key] = "[REDACTED]"
                elif isinstance(value, dict):
                    _clean_dict(value)
                elif isinstance(value, list):
                    for item in value:
                        if isinstance(item, dict):
                            _clean_dict(item)

        _clean_dict(sanitized)
        return sanitized

    @classmethod
    def record_action(
        cls,
        action: str,
        target_model: str,
        target_id: Optional[Any] = None,
        actor: Optional[Any] = None,
        ip_address: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> AuditLog:
        """
        Records an immutable audit event with sanitized metadata.
        """
        clean_metadata = cls.sanitize_metadata(metadata)
        target_id_str = str(target_id) if target_id is not None else None

        return AuditLog.objects.create(
            actor=actor,
            action=action,
            target_model=target_model,
            target_id=target_id_str,
            ip_address=ip_address,
            metadata=clean_metadata,
        )
