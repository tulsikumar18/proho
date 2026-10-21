"""
Models for Partner Profiles, KYC Submissions, and Bank Accounts.
"""

import uuid
from decimal import Decimal
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class KycStatus(models.TextChoices):
    NOT_SUBMITTED = "NOT_SUBMITTED", _("Not Submitted")
    PENDING = "PENDING", _("Pending Verification")
    APPROVED = "APPROVED", _("Approved")
    REJECTED = "REJECTED", _("Rejected")


class PartnerProfile(models.Model):
    """
    Channel Partner business profile, operating regions, and KYC status.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="partner_profile",
        help_text=_("Associated user account."),
    )
    agency_name = models.CharField(
        max_length=255,
        blank=True,
        help_text=_("Brokerage agency or firm name (if applicable)."),
    )
    base_location = models.CharField(
        max_length=100,
        blank=True,
        db_index=True,
        help_text=_("Primary market where partner operates (e.g., Central Noida)."),
    )
    work_areas = models.JSONField(
        default=list,
        blank=True,
        help_text=_("List of additional operating areas/sectors."),
    )
    rera_number = models.CharField(
        max_length=50,
        blank=True,
        help_text=_("Real Estate Regulatory Authority (RERA) registration number."),
    )
    kyc_status = models.CharField(
        max_length=30,
        choices=KycStatus.choices,
        default=KycStatus.NOT_SUBMITTED,
        db_index=True,
        help_text=_("Current KYC verification status."),
    )
    total_earned = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text=_("Cumulative earnings in INR."),
    )
    current_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text=_("Cleared withdrawable earnings balance in INR."),
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("partner profile")
        verbose_name_plural = _("partner profiles")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.phone} ({self.kyc_status})"

    @property
    def is_kyc_approved(self) -> bool:
        """True if the partner KYC has been approved by an administrator."""
        return self.kyc_status == KycStatus.APPROVED

    @property
    def business_name(self) -> str:
        """Convenience alias for agency_name."""
        return self.agency_name

    @business_name.setter
    def business_name(self, value: str):
        self.agency_name = value


class KycSubmission(models.Model):
    """
    KYC documents submitted by channel partner for manual administrative review.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    partner = models.ForeignKey(
        PartnerProfile,
        on_delete=models.CASCADE,
        related_name="kyc_submissions",
        help_text=_("Submitting partner profile."),
    )
    pan_number = models.CharField(
        max_length=10,
        help_text=_("Permanent Account Number (10 alphanumeric characters)."),
    )
    pan_document = models.FileField(
        upload_to="kyc/pan/",
        help_text=_("Uploaded PAN card document/photo."),
    )
    aadhaar_last_four = models.CharField(
        max_length=4,
        help_text=_("Last 4 digits of Aadhaar card."),
    )
    address_document = models.FileField(
        upload_to="kyc/address/",
        help_text=_("Uploaded Aadhaar or address proof document."),
    )
    rera_document = models.FileField(
        upload_to="kyc/rera/",
        blank=True,
        null=True,
        help_text=_("Optional uploaded RERA license document."),
    )
    status = models.CharField(
        max_length=30,
        choices=KycStatus.choices,
        default=KycStatus.PENDING,
        db_index=True,
        help_text=_("Verification review status."),
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_kycs",
        help_text=_("Administrator who reviewed this submission."),
    )
    rejection_reason = models.TextField(
        blank=True,
        help_text=_("Mandatory justification if KYC is rejected."),
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("KYC submission")
        verbose_name_plural = _("KYC submissions")
        ordering = ["-created_at"]

    def __str__(self):
        return f"KYC for {self.partner.user.phone} [{self.status}]"


class BankAccount(models.Model):
    """
    Bank account registered by partner for commission payout disbursements.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    partner = models.ForeignKey(
        PartnerProfile,
        on_delete=models.CASCADE,
        related_name="bank_accounts",
    )
    account_holder_name = models.CharField(
        max_length=255,
        help_text=_("Beneficiary name matching PAN document."),
    )
    account_number = models.CharField(
        max_length=50,
        help_text=_("Full bank account number."),
    )
    ifsc_code = models.CharField(
        max_length=11,
        help_text=_("11-character Indian Financial System Code."),
    )
    bank_name = models.CharField(
        max_length=100,
        help_text=_("Name of the bank (e.g. HDFC Bank, SBI)."),
    )
    proof_document = models.FileField(
        upload_to="kyc/bank/",
        blank=True,
        null=True,
        help_text=_("Uploaded cancelled cheque or passbook copy."),
    )
    is_verified = models.BooleanField(
        default=False,
        help_text=_("Marked True once reviewed and verified by finance admin."),
    )
    is_primary = models.BooleanField(
        default=True,
        help_text=_("Designates whether this is the default payout account."),
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("bank account")
        verbose_name_plural = _("bank accounts")
        ordering = ["-created_at"]

    def __str__(self):
        masked = (
            f"****{self.account_number[-4:]}"
            if len(self.account_number) >= 4
            else "****"
        )
        return f"{self.bank_name} ({masked})"
