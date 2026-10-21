"""
Tests for AuditLog model, AuditService, sanitization, and immutability.
"""

import pytest
from django.core.exceptions import PermissionDenied
from apps.accounts.models import User
from apps.audit.services import AuditService


@pytest.fixture
def actor_user(db):
    return User.objects.create_user(
        phone="+919844444444",
        password="TestPassword123!",
        role=User.Role.ADMIN,
    )


@pytest.mark.django_db
class TestAuditService:
    """Verifies audit event logging, field redaction, and immutability."""

    def test_record_audit_action_with_actor(self, actor_user):
        log = AuditService.record_action(
            action="KYC_APPROVED",
            target_model="KycSubmission",
            target_id="12345-abcde",
            actor=actor_user,
            ip_address="192.168.1.10",
            metadata={"status": "APPROVED", "notes": "Documents verified"},
        )

        assert log.actor == actor_user
        assert log.action == "KYC_APPROVED"
        assert log.target_model == "KycSubmission"
        assert log.target_id == "12345-abcde"
        assert log.ip_address == "192.168.1.10"
        assert log.metadata == {"status": "APPROVED", "notes": "Documents verified"}
        assert str(actor_user.phone) in str(log)

    def test_record_system_action_without_actor(self):
        log = AuditService.record_action(
            action="SYSTEM_CRON_EXPIRE_OFFERS",
            target_model="Offer",
            target_id=None,
            actor=None,
            metadata={"expired_count": 5},
        )

        assert log.actor is None
        assert log.action == "SYSTEM_CRON_EXPIRE_OFFERS"
        assert "SYSTEM" in str(log)

    def test_sensitive_data_redaction(self):
        raw_metadata = {
            "user_id": "u-123",
            "password": "SecretPlaintextPassword123!",
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
            "otp_code": "123456",
            "bank_account_number": "98765432109876",
            "nested": {
                "secret_key": "supersecret",
                "safe_field": "visible",
            },
        }

        sanitized = AuditService.sanitize_metadata(raw_metadata)

        assert sanitized["user_id"] == "u-123"
        assert sanitized["password"] == "[REDACTED]"
        assert sanitized["token"] == "[REDACTED]"
        assert sanitized["otp_code"] == "[REDACTED]"
        assert sanitized["bank_account_number"] == "[REDACTED]"
        assert sanitized["nested"]["secret_key"] == "[REDACTED]"
        assert sanitized["nested"]["safe_field"] == "visible"

    def test_audit_log_immutability(self, actor_user):
        log = AuditService.record_action(
            action="PAYOUT_PROCESSED",
            target_model="PayoutRequest",
            target_id="payout-999",
            actor=actor_user,
        )

        # Attempt to modify should raise PermissionDenied
        log.action = "PAYOUT_TAMPERED"
        with pytest.raises(PermissionDenied, match="immutable and cannot be updated"):
            log.save()

        # Attempt to delete should raise PermissionDenied
        with pytest.raises(PermissionDenied, match="cannot be deleted"):
            log.delete()
