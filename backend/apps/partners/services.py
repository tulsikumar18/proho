"""
Service layer for KYC validation, submission, and administrative review.
"""

import re
from django.utils import timezone
from rest_framework.exceptions import ValidationError, PermissionDenied
from apps.audit.services import AuditService
from .models import KycSubmission, KycStatus, PartnerProfile

PAN_REGEX = re.compile(r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$")
AADHAAR_LAST4_REGEX = re.compile(r"^\d{4}$")
IFSC_REGEX = re.compile(r"^[A-Z]{4}0[A-Z0-9]{6}$")
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


class KycService:
    """Business service governing partner KYC submissions and admin reviews."""

    @classmethod
    def validate_document_file(cls, file_obj, field_name: str):
        """Validates maximum file size."""
        if not file_obj:
            return
        if file_obj.size > MAX_FILE_SIZE:
            raise ValidationError(
                {field_name: [f"File size exceeds 5MB limit ({file_obj.size} bytes)."]}
            )

    @classmethod
    def submit_kyc(
        cls,
        partner_profile: PartnerProfile,
        pan_number: str,
        pan_document,
        aadhaar_last_four: str,
        address_document,
        rera_document=None,
        ip_address: str = None,
    ) -> KycSubmission:
        """
        Validates input documents and creates a pending KYC submission.
        """
        pan = pan_number.strip().upper()
        if not PAN_REGEX.match(pan):
            raise ValidationError(
                {
                    "pan_number": [
                        (
                            "Invalid PAN format. Must be 5 uppercase letters, "
                            "4 digits, 1 uppercase letter."
                        )
                    ]
                }
            )

        aadhaar = str(aadhaar_last_four).strip()
        if not AADHAAR_LAST4_REGEX.match(aadhaar):
            raise ValidationError(
                {
                    "aadhaar_last_four": [
                        "Aadhaar last four must be exactly 4 numeric digits."
                    ]
                }
            )

        cls.validate_document_file(pan_document, "pan_document")
        cls.validate_document_file(address_document, "address_document")
        if rera_document:
            cls.validate_document_file(rera_document, "rera_document")

        submission = KycSubmission.objects.create(
            partner=partner_profile,
            pan_number=pan,
            pan_document=pan_document,
            aadhaar_last_four=aadhaar,
            address_document=address_document,
            rera_document=rera_document,
            status=KycStatus.PENDING,
        )

        partner_profile.kyc_status = KycStatus.PENDING
        partner_profile.save(update_fields=["kyc_status", "updated_at"])

        AuditService.record_action(
            action="KYC_SUBMITTED",
            target_model="KycSubmission",
            target_id=str(submission.id),
            actor=partner_profile.user,
            ip_address=ip_address,
            metadata={
                "partner_id": str(partner_profile.id),
                "status": KycStatus.PENDING,
            },
        )

        return submission

    @classmethod
    def review_kyc(
        cls,
        submission: KycSubmission,
        reviewer_user,
        decision: str,
        rejection_reason: str = "",
        ip_address: str = None,
    ) -> KycSubmission:
        """
        Executes manual administrator KYC review.
        """
        if not (getattr(reviewer_user, "is_admin", False) or reviewer_user.is_staff):
            raise PermissionDenied(
                "Only authorized administrators can review KYC submissions."
            )

        if decision not in [KycStatus.APPROVED, KycStatus.REJECTED]:
            raise ValidationError(
                {
                    "decision": [
                        f"Invalid decision '{decision}'. Must be APPROVED or REJECTED."
                    ]
                }
            )

        if decision == KycStatus.REJECTED and not rejection_reason.strip():
            raise ValidationError(
                {
                    "rejection_reason": [
                        "Rejection reason is required when rejecting KYC."
                    ]
                }
            )

        submission.status = decision
        submission.reviewed_by = reviewer_user
        submission.reviewed_at = timezone.now()
        submission.rejection_reason = (
            rejection_reason.strip() if decision == KycStatus.REJECTED else ""
        )
        submission.save()

        partner = submission.partner
        partner.kyc_status = decision
        partner.save(update_fields=["kyc_status", "updated_at"])

        AuditService.record_action(
            action=f"KYC_{decision}",
            target_model="KycSubmission",
            target_id=str(submission.id),
            actor=reviewer_user,
            ip_address=ip_address,
            metadata={
                "decision": decision,
                "partner_id": str(partner.id),
                "rejection_reason": submission.rejection_reason,
            },
        )

        return submission
