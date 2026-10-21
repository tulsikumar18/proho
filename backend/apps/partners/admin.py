"""
Django admin registration for PartnerProfile, KycSubmission, and BankAccount.
"""

from django.contrib import admin
from .models import PartnerProfile, KycSubmission, BankAccount


@admin.register(PartnerProfile)
class PartnerProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user_phone",
        "agency_name",
        "base_location",
        "kyc_status",
        "current_balance",
        "total_earned",
        "created_at",
    )
    list_filter = ("kyc_status", "base_location")
    search_fields = ("user__phone", "user__full_name", "agency_name")
    readonly_fields = ("total_earned", "current_balance", "created_at", "updated_at")

    def user_phone(self, obj):
        return obj.user.phone


@admin.register(KycSubmission)
class KycSubmissionAdmin(admin.ModelAdmin):
    list_display = (
        "partner_phone",
        "pan_number",
        "aadhaar_last_four",
        "status",
        "reviewed_by",
        "reviewed_at",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = ("partner__user__phone", "pan_number")
    readonly_fields = ("created_at", "updated_at", "reviewed_at")

    def partner_phone(self, obj):
        return obj.partner.user.phone


@admin.register(BankAccount)
class BankAccountAdmin(admin.ModelAdmin):
    list_display = (
        "partner_phone",
        "account_holder_name",
        "bank_name",
        "ifsc_code",
        "is_verified",
        "is_primary",
        "created_at",
    )
    list_filter = ("is_verified", "is_primary")
    search_fields = ("partner__user__phone", "account_holder_name", "bank_name")

    def partner_phone(self, obj):
        return obj.partner.user.phone
