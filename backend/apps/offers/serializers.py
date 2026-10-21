"""
Serializers for property purchase offers, counteroffers, and negotiation tracking.
"""

from decimal import Decimal
from rest_framework import serializers
from .models import Offer, OfferStatus


class OfferSerializer(serializers.ModelSerializer):
    """Full representation of a purchase offer or counteroffer."""

    property_title = serializers.CharField(source="property.title", read_only=True)
    customer_name = serializers.CharField(source="lead.customer_name", read_only=True)
    partner_name = serializers.CharField(source="partner.business_name", read_only=True)
    creator_phone = serializers.CharField(source="created_by.phone", read_only=True)

    class Meta:
        model = Offer
        fields = [
            "id",
            "property",
            "property_title",
            "lead",
            "customer_name",
            "partner",
            "partner_name",
            "amount",
            "status",
            "notes",
            "rejection_reason",
            "counter_to",
            "created_by",
            "creator_phone",
            "reviewed_by",
            "valid_until",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "partner",
            "status",
            "rejection_reason",
            "counter_to",
            "created_by",
            "reviewed_by",
            "valid_until",
            "created_at",
            "updated_at",
        ]


class OfferCreateSerializer(serializers.Serializer):
    """Input serializer for drafting an offer."""

    property_id = serializers.UUIDField(required=True)
    lead_id = serializers.UUIDField(required=True)
    amount = serializers.DecimalField(
        max_digits=14, decimal_places=2, min_value=Decimal("1.00"), required=True
    )
    notes = serializers.CharField(required=False, allow_blank=True, default="")


class OfferUpdateSerializer(serializers.Serializer):
    """Input serializer for updating a draft offer."""

    amount = serializers.DecimalField(
        max_digits=14, decimal_places=2, min_value=Decimal("1.00"), required=False
    )
    notes = serializers.CharField(required=False, allow_blank=True)


class OfferReviewSerializer(serializers.Serializer):
    """Input serializer for administrative offer review."""

    decision = serializers.ChoiceField(
        choices=[OfferStatus.ACCEPTED, OfferStatus.REJECTED]
    )
    rejection_reason = serializers.CharField(
        required=False, allow_blank=True, default=""
    )


class OfferCounterSerializer(serializers.Serializer):
    """Input serializer for proposing a counteroffer."""

    counter_amount = serializers.DecimalField(
        max_digits=14, decimal_places=2, min_value=Decimal("1.00"), required=True
    )
    notes = serializers.CharField(required=False, allow_blank=True, default="")
