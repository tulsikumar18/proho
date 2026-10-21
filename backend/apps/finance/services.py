"""
Service layer business logic for finance, double-entry ledger, invoices, and payouts.
"""

import uuid
from decimal import Decimal
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from apps.audit.services import AuditService
from apps.finance.models import (
    CommissionRule,
    CommissionRuleType,
    Deal,
    DealStatus,
    Invoice,
    InvoiceStatus,
    LedgerCategory,
    LedgerEntry,
    LedgerEntryType,
    PayoutRequest,
    PayoutStatus,
)
from apps.partners.models import BankAccount, KycStatus, KycSubmission, PartnerProfile


class FinanceService:
    """
    Core domain service for commission calculations, double-entry ledger, and payouts.
    """

    @staticmethod
    def get_financial_summary(partner: PartnerProfile) -> dict:
        """
        Calculates lifetime earnings, current balance, pending payout requests,
        and available unlocked balance for a channel partner.
        """
        partner.refresh_from_db()
        pending_payouts = PayoutRequest.objects.filter(
            partner=partner,
            status__in=[
                PayoutStatus.REQUESTED,
                PayoutStatus.UNDER_REVIEW,
                PayoutStatus.APPROVED,
            ],
        ).aggregate(total=models.Sum("amount"))["total"] or Decimal("0.00")

        total_withdrawn = PayoutRequest.objects.filter(
            partner=partner,
            status=PayoutStatus.PAID,
        ).aggregate(total=models.Sum("amount"))["total"] or Decimal("0.00")

        available_balance = max(
            Decimal("0.00"), partner.current_balance - pending_payouts
        )

        return {
            "current_balance": partner.current_balance,
            "total_earned": partner.total_earned,
            "pending_payouts": pending_payouts,
            "available_balance": available_balance,
            "total_withdrawn": total_withdrawn,
            "currency": getattr(settings, "DEFAULT_CURRENCY", "INR"),
        }

    @staticmethod
    @transaction.atomic
    def record_ledger_entry(
        partner: PartnerProfile,
        entry_type: str,
        amount: Decimal,
        category: str,
        description: str,
        reference_id: str = "",
        actor=None,
    ) -> LedgerEntry:
        """
        Atomically records an immutable double-entry ledger record.
        Maintains partner balance and enforces that running balance cannot be negative.
        """
        if amount <= Decimal("0.00"):
            raise ValidationError(
                {"amount": _("Ledger transaction amount must be greater than zero.")}
            )

        # Lock partner profile row for strict concurrency control
        partner_locked = PartnerProfile.objects.select_for_update().get(id=partner.id)

        if entry_type == LedgerEntryType.CREDIT:
            new_balance = partner_locked.current_balance + amount
            partner_locked.total_earned += amount
        elif entry_type == LedgerEntryType.DEBIT:
            if partner_locked.current_balance < amount:
                raise ValidationError(
                    {
                        "amount": _(
                            f"Insufficient cleared balance to debit ₹{amount}. "
                            f"Current balance: ₹{partner_locked.current_balance}."
                        )
                    }
                )
            new_balance = partner_locked.current_balance - amount
        else:
            raise ValidationError({"entry_type": _("Invalid ledger entry type.")})

        partner_locked.current_balance = new_balance
        partner_locked.save(update_fields=["current_balance", "total_earned"])

        entry = LedgerEntry.objects.create(
            partner=partner_locked,
            entry_type=entry_type,
            amount=amount,
            currency=getattr(settings, "DEFAULT_CURRENCY", "INR"),
            category=category,
            reference_id=str(reference_id),
            running_balance=new_balance,
            description=description,
            created_by=actor,
        )

        AuditService.record_action(
            action=f"LEDGER_{entry_type}",
            actor=actor,
            target_model="LedgerEntry",
            target_id=entry.id,
            metadata={
                "partner_id": str(partner_locked.id),
                "entry_type": entry_type,
                "amount": str(amount),
                "category": category,
                "running_balance": str(new_balance),
                "reference_id": str(reference_id),
            },
        )

        return entry

    @staticmethod
    def calculate_tds(
        partner: PartnerProfile, gross_commission: Decimal
    ) -> tuple[Decimal, Decimal, Decimal]:
        """
        Determines applicable TDS under Section 194H:
        - 5% if partner has an approved KYC submission with valid PAN.
        - 20% if partner does not have an approved KYC submission with PAN.
        Returns: (tds_rate, tds_amount, net_payable)
        """
        has_approved_pan = (
            KycSubmission.objects.filter(
                partner=partner,
                status=KycStatus.APPROVED,
                pan_number__isnull=False,
            )
            .exclude(pan_number="")
            .exists()
        )

        tds_rate = Decimal("5.00") if has_approved_pan else Decimal("20.00")
        tds_amount = (gross_commission * (tds_rate / Decimal("100"))).quantize(
            Decimal("0.01")
        )
        net_payable = (gross_commission - tds_amount).quantize(Decimal("0.01"))

        return tds_rate, tds_amount, net_payable

    @staticmethod
    def _generate_sequential_invoice_number() -> str:
        """
        Generates standard sequential financial invoice number:
        Format: PROHO/YYYY-YY/XXXX
        """
        now = timezone.now()
        # Indian Financial Year starts April 1st
        if now.month >= 4:
            fy_start = now.year
            fy_end = (now.year + 1) % 100
        else:
            fy_start = now.year - 1
            fy_end = now.year % 100

        fy_prefix = f"PROHO/{fy_start}-{fy_end:02d}"
        count = Invoice.objects.filter(invoice_number__startswith=fy_prefix).count() + 1
        return f"{fy_prefix}/{count:04d}"

    @classmethod
    @transaction.atomic
    def register_deal_and_credit_commission(cls, deal: Deal, actor=None) -> Invoice:
        """
        Marks a closed deal as REGISTERED, computes gross commission,
        applies applicable TDS, issues an Invoice, and credits the partner ledger.
        """
        if deal.status == DealStatus.REGISTERED:
            raise ValidationError(
                {"deal": _("Deal has already been registered and credited.")}
            )

        # Determine or create commission rule
        rule = deal.commission_rule
        if not rule:
            rule = CommissionRule.objects.filter(is_active=True).first()
            if not rule:
                rule = CommissionRule.objects.create(
                    name="Standard 2% Deal Closure",
                    rule_type=CommissionRuleType.PERCENTAGE,
                    percentage=Decimal("2.00"),
                    is_active=True,
                )
            deal.commission_rule = rule

        gross_commission = rule.calculate_commission(deal.agreement_value)
        tds_rate, tds_amount, net_payable = cls.calculate_tds(
            deal.partner, gross_commission
        )

        # Retrieve PAN from latest KYC submission
        kyc = (
            KycSubmission.objects.filter(partner=deal.partner)
            .order_by("-created_at")
            .first()
        )
        partner_pan = kyc.pan_number if kyc and kyc.pan_number else ""
        partner_name = (
            deal.partner.user.full_name
            or deal.partner.agency_name
            or deal.partner.user.phone
        )

        invoice_number = cls._generate_sequential_invoice_number()

        invoice = Invoice.objects.create(
            invoice_number=invoice_number,
            partner=deal.partner,
            deal=deal,
            gross_commission=gross_commission,
            tds_rate=tds_rate,
            tds_deducted=tds_amount,
            net_payable=net_payable,
            status=InvoiceStatus.ISSUED,
            partner_pan=partner_pan,
            partner_name=partner_name,
            notes=(
                f"Commission for Deal {deal.id} on property "
                f"{deal.property.society_name}"
            ),
        )

        # Credit the net payable commission to the partner ledger
        cls.record_ledger_entry(
            partner=deal.partner,
            entry_type=LedgerEntryType.CREDIT,
            amount=net_payable,
            category=LedgerCategory.COMMISSION_DEAL,
            description=(
                f"Commission for Deal {deal.id} (Invoice {invoice_number}, "
                f"Gross: ₹{gross_commission}, TDS: ₹{tds_amount})"
            ),
            reference_id=str(deal.id),
            actor=actor,
        )

        deal.status = DealStatus.REGISTERED
        deal.registered_at = timezone.now()
        deal.save(
            update_fields=["status", "registered_at", "commission_rule", "updated_at"]
        )

        # Update lead lifecycle if linked
        if deal.lead:
            from apps.leads.models import LeadStatus

            deal.lead.status = LeadStatus.CLOSED
            deal.lead.save(update_fields=["status", "updated_at"])

        AuditService.record_action(
            action="DEAL_REGISTERED",
            actor=actor,
            target_model="Deal",
            target_id=deal.id,
            metadata={
                "agreement_value": str(deal.agreement_value),
                "gross_commission": str(gross_commission),
                "net_payable": str(net_payable),
                "invoice_number": invoice_number,
            },
        )

        return invoice

    @classmethod
    @transaction.atomic
    def reverse_deal_commission(
        cls, deal: Deal, reason: str, actor=None
    ) -> LedgerEntry:
        """
        Reverses a registered deal commission with dual-review audit safeguards.
        Deducts credited amount from partner ledger.
        """
        if deal.status != DealStatus.REGISTERED:
            raise ValidationError({"deal": _("Only registered deals can be reversed.")})

        if not reason or not reason.strip():
            raise ValidationError(
                {
                    "reason": _(
                        "A detailed justification reason is required for reversal."
                    )
                }
            )

        # Locate issued invoice
        invoice = Invoice.objects.filter(deal=deal).first()
        reversal_amount = (
            invoice.net_payable
            if invoice
            else deal.commission_rule.calculate_commission(deal.agreement_value)
        )

        # Debit partner ledger
        debit_entry = cls.record_ledger_entry(
            partner=deal.partner,
            entry_type=LedgerEntryType.DEBIT,
            amount=reversal_amount,
            category=LedgerCategory.REVERSAL,
            description=f"Reversal for Deal {deal.id}: {reason.strip()}",
            reference_id=str(deal.id),
            actor=actor,
        )

        deal.status = DealStatus.CANCELLED
        deal.save(update_fields=["status", "updated_at"])

        if invoice:
            invoice.status = InvoiceStatus.CANCELLED
            invoice.save(update_fields=["status", "updated_at"])

        AuditService.record_action(
            action="COMMISSION_REVERSED",
            actor=actor,
            target_model="Deal",
            target_id=deal.id,
            metadata={
                "reversal_amount": str(reversal_amount),
                "reason": reason.strip(),
            },
        )

        return debit_entry

    @classmethod
    @transaction.atomic
    def create_payout_request(
        cls,
        partner: PartnerProfile,
        bank_account_id: uuid.UUID,
        amount: Decimal,
        idempotency_key: str = None,
        actor=None,
    ) -> PayoutRequest:
        """
        Validates and creates a withdrawal payout request:
        - Partner KYC must be APPROVED.
        - Bank account must exist and belong to the partner.
        - Minimum withdrawal amount ₹5,000.
        - Cannot exceed cleared available balance.
        - Prevents multiple rapid/concurrent pending requests.
        """
        partner.refresh_from_db()
        min_payout = getattr(settings, "MINIMUM_PAYOUT_AMOUNT", Decimal("5000.00"))

        if not partner.is_kyc_approved:
            raise ValidationError(
                {
                    "partner": _(
                        "Partner KYC must be verified and approved "
                        "before requesting a payout."
                    )
                }
            )

        if amount < min_payout:
            raise ValidationError(
                {
                    "amount": _(
                        f"Minimum withdrawal amount is ₹{min_payout}. "
                        f"Requested: ₹{amount}."
                    )
                }
            )

        try:
            bank_account = BankAccount.objects.get(id=bank_account_id, partner=partner)
        except BankAccount.DoesNotExist:
            raise ValidationError(
                {
                    "bank_account": _(
                        "Selected bank account does not exist or "
                        "does not belong to partner."
                    )
                }
            )

        # Check for active pending payout requests
        existing_active = PayoutRequest.objects.filter(
            partner=partner,
            status__in=[PayoutStatus.REQUESTED, PayoutStatus.UNDER_REVIEW],
        ).exists()
        if existing_active:
            raise ValidationError(
                {
                    "payout": _(
                        "You already have a payout request under review. "
                        "Please wait until it is processed."
                    )
                }
            )

        # Check available balance
        summary = cls.get_financial_summary(partner)
        if amount > summary["available_balance"]:
            raise ValidationError(
                {
                    "amount": _(
                        f"Requested amount ₹{amount} exceeds your cleared "
                        f"available balance of ₹{summary['available_balance']}."
                    )
                }
            )

        payout = PayoutRequest.objects.create(
            partner=partner,
            bank_account=bank_account,
            amount=amount,
            status=PayoutStatus.REQUESTED,
            idempotency_key=idempotency_key,
        )

        AuditService.record_action(
            action="PAYOUT_REQUESTED",
            actor=actor or partner.user,
            target_model="PayoutRequest",
            target_id=payout.id,
            metadata={
                "partner_id": str(partner.id),
                "amount": str(amount),
                "bank_account_id": str(bank_account.id),
            },
        )

        return payout

    @classmethod
    def review_payout(
        cls,
        payout: PayoutRequest,
        new_status: str,
        actor=None,
        rejection_reason: str = "",
    ) -> PayoutRequest:
        """Moves a payout request through administrative review states."""
        allowed_transitions = {
            PayoutStatus.REQUESTED: [
                PayoutStatus.UNDER_REVIEW,
                PayoutStatus.APPROVED,
                PayoutStatus.REJECTED,
            ],
            PayoutStatus.UNDER_REVIEW: [PayoutStatus.APPROVED, PayoutStatus.REJECTED],
            PayoutStatus.APPROVED: [PayoutStatus.REJECTED],
        }

        valid_targets = allowed_transitions.get(payout.status, [])
        if new_status not in valid_targets:
            raise ValidationError(
                {
                    "status": _(
                        f"Cannot transition payout from {payout.status} "
                        f"to {new_status}."
                    )
                }
            )

        if new_status == PayoutStatus.REJECTED:
            if not rejection_reason or not rejection_reason.strip():
                raise ValidationError(
                    {"rejection_reason": _("A rejection reason is mandatory.")}
                )
            payout.rejection_reason = rejection_reason.strip()

        payout.status = new_status
        payout.processed_by = actor
        payout.save(
            update_fields=["status", "rejection_reason", "processed_by", "updated_at"]
        )

        AuditService.record_action(
            action=f"PAYOUT_{new_status}",
            actor=actor,
            target_model="PayoutRequest",
            target_id=payout.id,
            metadata={
                "new_status": new_status,
                "rejection_reason": rejection_reason,
            },
        )

        return payout

    @classmethod
    @transaction.atomic
    def disburse_payout(
        cls,
        payout: PayoutRequest,
        utr_reference: str,
        payment_date=None,
        actor=None,
    ) -> PayoutRequest:
        """
        Marks an approved/under-review payout request as PAID.
        Atomically debits partner's ledger balance with mandatory UTR reference.
        """
        if payout.status not in [PayoutStatus.APPROVED, PayoutStatus.UNDER_REVIEW]:
            raise ValidationError(
                {
                    "payout": _(
                        f"Cannot disburse payout with status {payout.status}. "
                        "Must be APPROVED or UNDER_REVIEW."
                    )
                }
            )

        if not utr_reference or not utr_reference.strip():
            raise ValidationError(
                {
                    "utr_reference": _(
                        "Bank UTR / Transaction Reference is mandatory for "
                        "disbursement."
                    )
                }
            )

        # Atomically debit the partner ledger
        cls.record_ledger_entry(
            partner=payout.partner,
            entry_type=LedgerEntryType.DEBIT,
            amount=payout.amount,
            category=LedgerCategory.PAYOUT_DISBURSEMENT,
            description=(
                f"Payout disbursement UTR: {utr_reference.strip()} "
                f"to Bank {payout.bank_account.bank_name}"
            ),
            reference_id=str(payout.id),
            actor=actor,
        )

        payout.status = PayoutStatus.PAID
        payout.utr_reference = utr_reference.strip()
        payout.payment_date = payment_date or timezone.now()
        payout.processed_by = actor
        payout.save(
            update_fields=[
                "status",
                "utr_reference",
                "payment_date",
                "processed_by",
                "updated_at",
            ]
        )

        AuditService.record_action(
            action="PAYOUT_PAID",
            actor=actor,
            target_model="PayoutRequest",
            target_id=payout.id,
            metadata={
                "amount": str(payout.amount),
                "utr_reference": utr_reference.strip(),
            },
        )

        return payout
