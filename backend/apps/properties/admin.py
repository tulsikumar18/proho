"""
Django admin registration for Property and PropertyMedia.
"""

from django.contrib import admin
from .models import Property, PropertyMedia


class PropertyMediaInline(admin.TabularInline):
    model = PropertyMedia
    extra = 1
    fields = ("file", "media_type", "caption", "is_cover", "display_order")


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "society_name",
        "bhk_type",
        "price",
        "status",
        "owner_phone",
        "created_at",
    )
    list_filter = ("status", "bhk_type", "city", "furnishing", "tenancy_status")
    search_fields = ("title", "society_name", "owner__user__phone")
    inlines = [PropertyMediaInline]
    readonly_fields = (
        "rate_per_sqft",
        "submitted_at",
        "reviewed_at",
        "created_at",
        "updated_at",
    )

    def owner_phone(self, obj):
        return obj.owner.user.phone


@admin.register(PropertyMedia)
class PropertyMediaAdmin(admin.ModelAdmin):
    list_display = ("property", "media_type", "is_cover", "display_order", "created_at")
    list_filter = ("media_type", "is_cover")
    search_fields = ("property__title", "caption")
