"""Django admin interface configuration for finance models."""

from django.contrib import admin

from apps.finance.models import (
    CommissionRule,
    Deal,
    Invoice,
    LedgerEntry,
    PayoutRequest,
)


@admin.register(CommissionRule)
class CommissionRuleAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "rule_type",
        "percentage",
        "fixed_amount",
        "is_active",
        "created_at",
    ]
    list_filter = ["rule_type", "is_active"]
    search_fields = ["name"]


@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "property",
        "partner",
        "agreement_value",
        "status",
        "deal_date",
    ]
    list_filter = ["status", "deal_date"]
    search_fields = [
        "property__society_name",
        "partner__agency_name",
        "partner__user__phone",
    ]
    readonly_fields = ["id", "created_at", "updated_at"]


@admin.register(LedgerEntry)
class LedgerEntryAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "partner",
        "entry_type",
        "amount",
        "category",
        "running_balance",
        "created_at",
    ]
    list_filter = ["entry_type", "category", "created_at"]
    search_fields = ["partner__agency_name", "partner__user__phone", "reference_id"]
    readonly_fields = [
        "id",
        "partner",
        "entry_type",
        "amount",
        "currency",
        "category",
        "reference_id",
        "running_balance",
        "description",
        "created_by",
        "created_at",
    ]

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = [
        "invoice_number",
        "partner",
        "gross_commission",
        "tds_deducted",
        "net_payable",
        "status",
        "issued_at",
    ]
    list_filter = ["status", "issued_at"]
    search_fields = ["invoice_number", "partner_pan", "partner_name"]
    readonly_fields = ["id", "invoice_number", "issued_at", "created_at", "updated_at"]


@admin.register(PayoutRequest)
class PayoutRequestAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "partner",
        "amount",
        "status",
        "utr_reference",
        "payment_date",
        "created_at",
    ]
    list_filter = ["status", "created_at"]
    search_fields = ["partner__agency_name", "partner__user__phone", "utr_reference"]
    readonly_fields = ["id", "created_at", "updated_at"]
