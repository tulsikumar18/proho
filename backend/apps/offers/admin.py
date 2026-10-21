from django.contrib import admin
from .models import Offer


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "property",
        "lead",
        "partner",
        "amount",
        "status",
        "valid_until",
        "created_at",
    ]
    list_filter = ["status", "created_at"]
    search_fields = [
        "property__title",
        "lead__customer_name",
        "partner__agency_name",
    ]
    readonly_fields = [
        "id",
        "created_by",
        "reviewed_by",
        "valid_until",
        "created_at",
        "updated_at",
    ]
