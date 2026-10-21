"""
Serializers for Partner Profiles, KYC, and Bank Accounts.
"""

import re
from rest_framework import serializers
from apps.accounts.serializers import UserSerializer
from .models import PartnerProfile, KycSubmission, BankAccount, KycStatus

IFSC_REGEX = re.compile(r"^[A-Z]{4}0[A-Z0-9]{6}$")


class PartnerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = PartnerProfile
        fields = [
            "id",
            "user",
            "agency_name",
            "base_location",
            "work_areas",
            "rera_number",
            "kyc_status",
            "total_earned",
            "current_balance",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "kyc_status",
            "total_earned",
            "current_balance",
            "created_at",
            "updated_at",
        ]


class KycSubmissionSerializer(serializers.ModelSerializer):
    partner_id = serializers.UUIDField(source="partner.id", read_only=True)
    partner_phone = serializers.CharField(source="partner.user.phone", read_only=True)
    partner_name = serializers.CharField(
        source="partner.user.full_name", read_only=True
    )

    class Meta:
        model = KycSubmission
        fields = [
            "id",
            "partner_id",
            "partner_phone",
            "partner_name",
            "pan_number",
            "pan_document",
            "aadhaar_last_four",
            "address_document",
            "rera_document",
            "status",
            "rejection_reason",
            "reviewed_at",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "partner_id",
            "partner_phone",
            "partner_name",
            "status",
            "rejection_reason",
            "reviewed_at",
            "created_at",
        ]


class KycReviewSerializer(serializers.Serializer):
    decision = serializers.ChoiceField(choices=[KycStatus.APPROVED, KycStatus.REJECTED])
    rejection_reason = serializers.CharField(required=False, allow_blank=True)


class BankAccountSerializer(serializers.ModelSerializer):
    account_number_masked = serializers.SerializerMethodField()
    account_number = serializers.CharField(write_only=True)

    class Meta:
        model = BankAccount
        fields = [
            "id",
            "account_holder_name",
            "account_number",
            "account_number_masked",
            "ifsc_code",
            "bank_name",
            "proof_document",
            "is_verified",
            "is_primary",
            "created_at",
        ]
        read_only_fields = ["id", "is_verified", "created_at"]

    def get_account_number_masked(self, obj) -> str:
        if len(obj.account_number) >= 4:
            return f"****{obj.account_number[-4:]}"
        return "****"

    def validate_ifsc_code(self, value):
        code = value.strip().upper()
        if not IFSC_REGEX.match(code):
            msg = (
                "Invalid IFSC code. Format must be 4 letters, followed by 0, "
                "followed by 6 alphanumeric characters."
            )
            raise serializers.ValidationError(msg)
        return code
