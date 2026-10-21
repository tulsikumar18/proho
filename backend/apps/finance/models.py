"""Database models for commission rules, double-entry ledger, invoices, and payouts."""

import uuid
from decimal import Decimal
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

_py_property = property


class CommissionRuleType(models.TextChoices):
    PERCENTAGE = "PERCENTAGE", _("Percentage of Agreement Value")
    FIXED = "FIXED", _("Fixed Monetary Amount")


class DealStatus(models.TextChoices):
    PENDING_REGISTRATION = "PENDING_REGISTRATION", _("Pending Registration")
    REGISTERED = "REGISTERED", _("Registered / Closed")
    CANCELLED = "CANCELLED", _("Cancelled")


class LedgerEntryType(models.TextChoices):
    CREDIT = "CREDIT", _("Credit (+)")
    DEBIT = "DEBIT", _("Debit (-)")


class LedgerCategory(models.TextChoices):
    COMMISSION_DEAL = "COMMISSION_DEAL", _("Deal Closure Commission")
    BONUS_INCENTIVE = "BONUS_INCENTIVE", _("Milestone / Campaign Bonus")
    PAYOUT_DISBURSEMENT = "PAYOUT_DISBURSEMENT", _("Payout Withdrawal")
    TAX_DEDUCTION = "TAX_DEDUCTION", _("TDS Tax Deduction")
    REVERSAL = "REVERSAL", _("Deal Commission Reversal")
    ADJUSTMENT = "ADJUSTMENT", _("Administrative Adjustment")


class InvoiceStatus(models.TextChoices):
    ISSUED = "ISSUED", _("Issued")
    PAID = "PAID", _("Paid")
    CANCELLED = "CANCELLED", _("Cancelled")


class PayoutStatus(models.TextChoices):
    REQUESTED = "REQUESTED", _("Requested by Partner")
    UNDER_REVIEW = "UNDER_REVIEW", _("Under Administrative Review")
    APPROVED = "APPROVED", _("Approved for Processing")
    PAID = "PAID", _("Disbursed / Paid")
    REJECTED = "REJECTED", _("Rejected")


class CommissionRule(models.Model):
    """
    Configurable commission calculation formula (percentage or fixed).
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150, help_text=_("e.g. Standard 2% Closure"))
    rule_type = models.CharField(
        max_length=20,
        choices=CommissionRuleType.choices,
        default=CommissionRuleType.PERCENTAGE,
    )
    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("2.00"),
        help_text=_("Commission percentage (e.g., 2.00 for 2%)"),
    )
    fixed_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text=_("Fixed incentive amount in INR"),
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = _("Commission Rule")
        verbose_name_plural = _("Commission Rules")

    def __str__(self):
        if self.rule_type == CommissionRuleType.PERCENTAGE:
            return f"{self.name} ({self.percentage}%)"
        return f"{self.name} (₹{self.fixed_amount})"

    def clean(self):
        if (
            self.rule_type == CommissionRuleType.PERCENTAGE
            and self.percentage <= Decimal("0")
        ):
            raise ValidationError(
                {"percentage": _("Percentage must be strictly positive.")}
            )
        if self.rule_type == CommissionRuleType.FIXED and self.fixed_amount <= Decimal(
            "0"
        ):
            raise ValidationError(
                {"fixed_amount": _("Fixed amount must be strictly positive.")}
            )

    def calculate_commission(self, agreement_value: Decimal) -> Decimal:
        """Calculate commission amount given an agreement value."""
        if self.rule_type == CommissionRuleType.PERCENTAGE:
            return (agreement_value * (self.percentage / Decimal("100"))).quantize(
                Decimal("0.01")
            )
        return self.fixed_amount.quantize(Decimal("0.01"))


class Deal(models.Model):
    """
    Closed or registered sale/lease deal linking property, buyer/lead, and partner.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey(
        "properties.Property",
        on_delete=models.PROTECT,
        related_name="deals",
        help_text=_("Property associated with this deal"),
    )
    partner = models.ForeignKey(
        "partners.PartnerProfile",
        on_delete=models.PROTECT,
        related_name="deals",
        help_text=_("Referring channel partner receiving commission"),
    )
    lead = models.ForeignKey(
        "leads.Lead",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="deals",
        help_text=_("Referred buyer lead (optional)"),
    )
    offer = models.ForeignKey(
        "offers.Offer",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="deals",
        help_text=_("Accepted offer originating this deal (optional)"),
    )
    commission_rule = models.ForeignKey(
        CommissionRule,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="deals",
    )
    agreement_value = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        help_text=_("Final registered agreement sale value in INR"),
    )
    status = models.CharField(
        max_length=30,
        choices=DealStatus.choices,
        default=DealStatus.PENDING_REGISTRATION,
    )
    deal_date = models.DateTimeField(default=timezone.now)
    registered_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-deal_date"]
        verbose_name = _("Deal")
        verbose_name_plural = _("Deals")

    def __str__(self):
        return f"Deal {self.id} — {self.property} (₹{self.agreement_value})"


class LedgerEntry(models.Model):
    """
    Immutable double-entry ledger tracking partner credits, debits, and running balance.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    partner = models.ForeignKey(
        "partners.PartnerProfile",
        on_delete=models.PROTECT,
        related_name="ledger_entries",
        db_index=True,
    )
    entry_type = models.CharField(
        max_length=10,
        choices=LedgerEntryType.choices,
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text=_("Monetary transaction amount in INR"),
    )
    currency = models.CharField(max_length=3, default="INR")
    category = models.CharField(
        max_length=30,
        choices=LedgerCategory.choices,
    )
    reference_id = models.CharField(
        max_length=100,
        blank=True,
        db_index=True,
        help_text=_("External ID such as Deal ID, Payout ID, or Invoice ID"),
    )
    running_balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text=_("Partner cleared balance immediately after this transaction"),
    )
    description = models.TextField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_ledger_entries",
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = _("Ledger Entry")
        verbose_name_plural = _("Ledger Entries")

    def __str__(self):
        return (
            f"{self.entry_type} ₹{self.amount} ({self.category}) - "
            f"Balance: ₹{self.running_balance}"
        )

    def delete(self, *args, **kwargs):
        raise ValidationError(_("Ledger records are immutable and cannot be deleted."))


class Invoice(models.Model):
    """
    Formal tax statement / invoice generated upon deal closure with TDS deduction.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    invoice_number = models.CharField(
        max_length=60,
        unique=True,
        db_index=True,
        help_text=_("Sequential invoice number e.g. PROHO/2026-27/0001"),
    )
    partner = models.ForeignKey(
        "partners.PartnerProfile",
        on_delete=models.PROTECT,
        related_name="invoices",
        db_index=True,
    )
    deal = models.ForeignKey(
        Deal,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invoices",
    )
    gross_commission = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text=_("Gross commission before tax deductions"),
    )
    tds_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text=_(
            "TDS rate (e.g. 5.00 for valid PAN, 20.00 for invalid/missing PAN)"
        ),
    )
    tds_deducted = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text=_("TDS tax deducted in INR"),
    )
    net_payable = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text=_("Net commission credited to partner ledger"),
    )
    status = models.CharField(
        max_length=20,
        choices=InvoiceStatus.choices,
        default=InvoiceStatus.ISSUED,
    )
    partner_pan = models.CharField(max_length=10, blank=True)
    partner_name = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    issued_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-issued_at"]
        verbose_name = _("Invoice")
        verbose_name_plural = _("Invoices")

    def __str__(self):
        return f"{self.invoice_number} — ₹{self.net_payable} ({self.partner})"


class PayoutRequest(models.Model):
    """
    Channel partner withdrawal request against available cleared balance.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    partner = models.ForeignKey(
        "partners.PartnerProfile",
        on_delete=models.PROTECT,
        related_name="payout_requests",
        db_index=True,
    )
    bank_account = models.ForeignKey(
        "partners.BankAccount",
        on_delete=models.PROTECT,
        related_name="payout_requests",
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text=_("Requested payout amount in INR (Minimum ₹5,000)"),
    )
    status = models.CharField(
        max_length=30,
        choices=PayoutStatus.choices,
        default=PayoutStatus.REQUESTED,
    )
    utr_reference = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text=_("Bank transaction reference / NEFT / IMPS UTR number"),
    )
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="processed_payouts",
    )
    payment_date = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    idempotency_key = models.CharField(
        max_length=64,
        null=True,
        blank=True,
        unique=True,
        help_text=_("Client idempotency key to prevent rapid duplicate requests"),
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = _("Payout Request")
        verbose_name_plural = _("Payout Requests")

    def __str__(self):
        return f"Payout {self.id} — ₹{self.amount} ({self.status})"
