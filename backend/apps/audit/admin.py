"""
Read-only Django admin interface for AuditLog.
"""

from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = (
        "created_at",
        "actor",
        "action",
        "target_model",
        "target_id",
        "ip_address",
    )
    list_filter = ("action", "target_model", "created_at")
    search_fields = ("action", "target_model", "target_id", "actor__phone")
    readonly_fields = (
        "id",
        "actor",
        "action",
        "target_model",
        "target_id",
        "ip_address",
        "metadata",
        "created_at",
    )

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
