"""
AuditLog model for immutable recording of system and administrative events.
"""

import uuid
from django.conf import settings
from django.db import models
from django.core.exceptions import PermissionDenied


class AuditLog(models.Model):
    """
    Append-only audit log tracking security, operational, and administrative actions.
    Updates and deletions are blocked at the model level to preserve integrity.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
        help_text="User who initiated the action. Null for system events.",
    )
    action = models.CharField(
        max_length=100,
        db_index=True,
        help_text="Action name, e.g. USER_LOGIN, KYC_APPROVED.",
    )
    target_model = models.CharField(
        max_length=100,
        db_index=True,
        help_text="Affected model/entity name (e.g. User, KycSubmission).",
    )
    target_id = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        db_index=True,
        help_text="Identifier (UUID or string) of the target entity.",
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="Client IP address where available.",
    )
    metadata = models.JSONField(
        default=dict,
        blank=True,
        help_text="Sanitized contextual payload without secrets.",
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = "audit log"
        verbose_name_plural = "audit logs"
        ordering = ["-created_at"]

    def __str__(self):
        actor_name = self.actor.phone if self.actor else "SYSTEM"
        ts = self.created_at.strftime("%Y-%m-%d %H:%M:%S")
        target = f"{self.target_model}:{self.target_id}"
        return f"[{ts}] {actor_name} -> {self.action} on {target}"

    def save(self, *args, **kwargs):
        # Prevent updating existing audit log entries
        if self.pk and AuditLog.objects.filter(pk=self.pk).exists():
            raise PermissionDenied(
                "Audit log entries are immutable and cannot be updated."
            )
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        # Prevent deleting audit log entries
        raise PermissionDenied("Audit log entries cannot be deleted.")
