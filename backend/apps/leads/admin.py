from django.contrib import admin
from .models import Lead, ReferralToken


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = [
        "customer_name",
        "customer_phone",
        "partner",
        "status",
        "preferred_bhk",
        "attribution_expires_at",
        "created_at",
    ]
    list_filter = ["status", "preferred_bhk", "created_at"]
    search_fields = ["customer_name", "customer_phone", "partner__agency_name"]
    readonly_fields = [
        "id",
        "attribution_expires_at",
        "last_interaction_at",
        "created_at",
        "updated_at",
    ]


@admin.register(ReferralToken)
class ReferralTokenAdmin(admin.ModelAdmin):
    list_display = [
        "token",
        "partner",
        "property",
        "is_active",
        "expires_at",
        "created_at",
    ]
    list_filter = ["is_active", "created_at"]
    search_fields = ["token", "partner__agency_name", "property__title"]
    readonly_fields = ["id", "token", "created_at"]
