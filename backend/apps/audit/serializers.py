"""
Serializers for AuditLog.
"""

from rest_framework import serializers
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    actor_phone = serializers.CharField(source="actor.phone", read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "actor",
            "actor_phone",
            "action",
            "target_model",
            "target_id",
            "ip_address",
            "metadata",
            "created_at",
        ]
        read_only_fields = fields
