from django.contrib import admin
from .models import Booking, Visit, VisitOtp


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ["id", "property", "lead", "partner", "status", "created_at"]
    list_filter = ["status", "created_at"]
    search_fields = ["property__title", "lead__customer_name", "partner__agency_name"]
    readonly_fields = ["id", "created_at", "updated_at"]


@admin.register(Visit)
class VisitAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "property",
        "lead",
        "partner",
        "scheduled_start",
        "scheduled_end",
        "status",
    ]
    list_filter = ["status", "scheduled_start"]
    search_fields = ["property__title", "lead__customer_name", "partner__agency_name"]
    readonly_fields = ["id", "created_at", "updated_at"]


@admin.register(VisitOtp)
class VisitOtpAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "visit",
        "expires_at",
        "attempt_count",
        "is_consumed",
        "created_at",
    ]
    list_filter = ["is_consumed", "created_at"]
    readonly_fields = ["id", "otp_hash", "salt", "created_at"]
