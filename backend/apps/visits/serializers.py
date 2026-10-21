"""
Serializers for property bookings, scheduled site visits, and OTP verification.
"""

from rest_framework import serializers
from .models import Booking, Visit


class BookingSerializer(serializers.ModelSerializer):
    """Full representation of a property reservation booking."""

    property_title = serializers.CharField(source="property.title", read_only=True)
    customer_name = serializers.CharField(source="lead.customer_name", read_only=True)
    partner_name = serializers.CharField(source="partner.business_name", read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "property",
            "property_title",
            "lead",
            "customer_name",
            "partner",
            "partner_name",
            "offer",
            "status",
            "notes",
            "cancellation_reason",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "partner",
            "status",
            "cancellation_reason",
            "created_at",
            "updated_at",
        ]


class BookingCreateSerializer(serializers.Serializer):
    """Input serializer for creating a booking request."""

    property_id = serializers.UUIDField(required=True)
    lead_id = serializers.UUIDField(required=True)
    offer_id = serializers.UUIDField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True, default="")


class VisitSerializer(serializers.ModelSerializer):
    """Full representation of a scheduled site visit."""

    property_title = serializers.CharField(source="property.title", read_only=True)
    customer_name = serializers.CharField(source="lead.customer_name", read_only=True)
    partner_name = serializers.CharField(source="partner.business_name", read_only=True)
    has_active_otp = serializers.SerializerMethodField()

    class Meta:
        model = Visit
        fields = [
            "id",
            "property",
            "property_title",
            "lead",
            "customer_name",
            "partner",
            "partner_name",
            "booking",
            "scheduled_start",
            "scheduled_end",
            "status",
            "has_active_otp",
            "cancellation_reason",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "partner",
            "status",
            "cancellation_reason",
            "created_at",
            "updated_at",
        ]

    def get_has_active_otp(self, obj) -> bool:
        if hasattr(obj, "otp") and obj.otp and not obj.otp.is_consumed:
            return True
        return False


class VisitScheduleSerializer(serializers.Serializer):
    """Input serializer for scheduling a site visit."""

    property_id = serializers.UUIDField(required=True)
    lead_id = serializers.UUIDField(required=True)
    booking_id = serializers.UUIDField(required=False, allow_null=True)
    scheduled_start = serializers.DateTimeField(required=True)
    scheduled_end = serializers.DateTimeField(required=True)


class VisitCancelSerializer(serializers.Serializer):
    """Input serializer for cancelling a visit."""

    reason = serializers.CharField(required=True, min_length=3)


class VisitRescheduleSerializer(serializers.Serializer):
    """Input serializer for rescheduling a visit slot."""

    new_start = serializers.DateTimeField(required=True)
    new_end = serializers.DateTimeField(required=True)
    reason = serializers.CharField(required=True, min_length=3)


class VisitOtpVerifySerializer(serializers.Serializer):
    """Input serializer for submitting a 6-digit visit verification OTP."""

    otp = serializers.CharField(required=True, min_length=6, max_length=6)
