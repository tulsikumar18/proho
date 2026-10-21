"""
Django Admin configuration for custom User model.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        "phone",
        "full_name",
        "email",
        "role",
        "preferred_language",
        "is_active",
        "is_staff",
        "created_at",
    )
    list_filter = ("role", "preferred_language", "is_active", "is_staff")
    search_fields = ("phone", "email", "full_name")
    ordering = ("-created_at",)

    fieldsets = (
        (None, {"fields": ("phone", "password")}),
        (
            "Personal info",
            {"fields": ("full_name", "email", "preferred_language")},
        ),
        (
            "Permissions",
            {
                "fields": (
                    "role",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "created_at", "updated_at")}),
    )
    readonly_fields = ("created_at", "updated_at", "last_login")

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "phone",
                    "full_name",
                    "role",
                    "preferred_language",
                    "password",
                    "is_staff",
                    "is_superuser",
                ),
            },
        ),
    )
