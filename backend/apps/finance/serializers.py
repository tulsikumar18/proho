"""Django REST Framework serializers for finance, ledger, invoices, and payouts."""

from decimal import Decimal
from rest_framework import serializers

from apps.finance.models import (
    CommissionRule,
    Deal,
    Invoice,
    LedgerEntry,
    PayoutRequest,
    PayoutStatus,
)
from apps.partners.serializers import BankAccountSerializer


class CommissionRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommissionRule
        fields = [
            "id",
            "name",
            "rule_type",
            "percentage",
            "fixed_amount",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class LedgerEntrySerializer(serializers.ModelSerializer):
    partner_id = serializers.UUIDField(source="partner.id", read_only=True)

    class Meta:
        model = LedgerEntry
        fields = [
            "id",
            "partner_id",
            "entry_type",
            "amount",
            "currency",
            "category",
            "reference_id",
            "running_balance",
            "description",
            "created_at",
        ]
        read_only_fields = fields


class InvoiceSerializer(serializers.ModelSerializer):
    partner_id = serializers.UUIDField(source="partner.id", read_only=True)
    deal_id = serializers.UUIDField(source="deal.id", read_only=True, allow_null=True)

    class Meta:
        model = Invoice
        fields = [
            "id",
            "invoice_number",
            "partner_id",
            "deal_id",
            "gross_commission",
            "tds_rate",
            "tds_deducted",
            "net_payable",
            "status",
            "partner_pan",
            "partner_name",
            "notes",
            "issued_at",
            "created_at",
        ]
        read_only_fields = fields


class PayoutRequestSerializer(serializers.ModelSerializer):
    partner_id = serializers.UUIDField(source="partner.id", read_only=True)
    bank_account_details = BankAccountSerializer(source="bank_account", read_only=True)

    class Meta:
        model = PayoutRequest
        fields = [
            "id",
            "partner_id",
            "bank_account",
            "bank_account_details",
            "amount",
            "status",
            "utr_reference",
            "payment_date",
            "rejection_reason",
            "idempotency_key",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "partner_id",
            "status",
            "utr_reference",
            "payment_date",
            "rejection_reason",
            "created_at",
            "updated_at",
        ]


class PayoutRequestCreateSerializer(serializers.Serializer):
    bank_account_id = serializers.UUIDField()
    amount = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=Decimal("5000.00")
    )
    idempotency_key = serializers.CharField(
        max_length=64, required=False, allow_blank=True
    )


class PayoutReviewSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=[
            PayoutStatus.UNDER_REVIEW,
            PayoutStatus.APPROVED,
            PayoutStatus.REJECTED,
        ]
    )
    rejection_reason = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if (
            attrs.get("status") == PayoutStatus.REJECTED
            and not attrs.get("rejection_reason", "").strip()
        ):
            raise serializers.ValidationError(
                {
                    "rejection_reason": (
                        "Rejection reason is required when rejecting a payout."
                    )
                }
            )
        return attrs


class PayoutDisburseSerializer(serializers.Serializer):
    utr_reference = serializers.CharField(max_length=100)
    payment_date = serializers.DateTimeField(required=False)


class DealCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deal
        fields = [
            "property",
            "partner",
            "lead",
            "offer",
            "commission_rule",
            "agreement_value",
            "notes",
        ]


class DealSerializer(serializers.ModelSerializer):
    property_id = serializers.UUIDField(source="property.id", read_only=True)
    partner_id = serializers.UUIDField(source="partner.id", read_only=True)
    lead_id = serializers.UUIDField(source="lead.id", read_only=True, allow_null=True)
    offer_id = serializers.UUIDField(source="offer.id", read_only=True, allow_null=True)

    class Meta:
        model = Deal
        fields = [
            "id",
            "property_id",
            "partner_id",
            "lead_id",
            "offer_id",
            "commission_rule",
            "agreement_value",
            "status",
            "deal_date",
            "registered_at",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class FinancialSummarySerializer(serializers.Serializer):
    current_balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_earned = serializers.DecimalField(max_digits=12, decimal_places=2)
    pending_payouts = serializers.DecimalField(max_digits=12, decimal_places=2)
    available_balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_withdrawn = serializers.DecimalField(max_digits=12, decimal_places=2)
    currency = serializers.CharField(max_length=3)
