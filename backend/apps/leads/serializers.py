"""
Serializers for buyer leads, referral attribution, and property sharing tokens.
"""

from rest_framework import serializers
from apps.properties.models import Property
from .models import Lead, ReferralToken


class LeadSerializer(serializers.ModelSerializer):
    """Full representation of a buyer lead."""

    partner_name = serializers.CharField(source="partner.business_name", read_only=True)
    property_title = serializers.CharField(
        source="property.title", read_only=True, default=None
    )
    is_attribution_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = Lead
        fields = [
            "id",
            "partner",
            "partner_name",
            "customer_name",
            "customer_phone",
            "customer_email",
            "budget_min",
            "budget_max",
            "preferred_bhk",
            "preferred_location",
            "property",
            "property_title",
            "status",
            "attribution_expires_at",
            "last_interaction_at",
            "is_attribution_active",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "partner",
            "status",
            "attribution_expires_at",
            "last_interaction_at",
            "is_attribution_active",
            "created_at",
            "updated_at",
        ]


class LeadCreateUpdateSerializer(serializers.ModelSerializer):
    """Input serializer for registering or updating a buyer lead."""

    property_id = serializers.UUIDField(required=False, allow_null=True)

    class Meta:
        model = Lead
        fields = [
            "customer_name",
            "customer_phone",
            "customer_email",
            "budget_min",
            "budget_max",
            "preferred_bhk",
            "preferred_location",
            "property_id",
            "notes",
        ]

    def validate_property_id(self, value):
        if value:
            prop = Property.objects.filter(pk=value).first()
            if not prop:
                raise serializers.ValidationError("Referenced property does not exist.")
            return prop
        return None

    def validate(self, attrs):
        if "property_id" in attrs:
            attrs["property"] = attrs.pop("property_id")
        return attrs


class ReferralTokenCreateSerializer(serializers.Serializer):
    """Input serializer for generating a property referral sharing token."""

    property_id = serializers.UUIDField(required=True)
    expires_in_days = serializers.IntegerField(
        required=False, default=30, min_value=1, max_value=365
    )


class ReferralTokenSerializer(serializers.ModelSerializer):
    """Output serializer for a referral sharing token."""

    property_title = serializers.CharField(source="property.title", read_only=True)
    share_url = serializers.SerializerMethodField()

    class Meta:
        model = ReferralToken
        fields = [
            "id",
            "token",
            "property",
            "property_title",
            "share_url",
            "is_active",
            "expires_at",
            "created_at",
        ]

    def get_share_url(self, obj) -> str:
        return f"/properties/shared/?ref={obj.token}"
