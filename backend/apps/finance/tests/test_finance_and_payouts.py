"""
Automated tests for Phase 5: Commission rules, ledger, invoices, and payouts.
"""

from decimal import Decimal
import pytest
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.finance.models import (
    CommissionRule,
    CommissionRuleType,
    Deal,
    DealStatus,
    InvoiceStatus,
    LedgerCategory,
    LedgerEntryType,
    PayoutStatus,
)
from apps.finance.services import FinanceService
from apps.leads.models import Lead, LeadStatus
from apps.partners.models import BankAccount, KycStatus, KycSubmission
from apps.properties.models import BhkType, Property, PropertyStatus

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def partner_user(db):
    user = User.objects.create_user(
        phone="+919876543210",
        role=User.Role.CHANNEL_PARTNER,
        full_name="Rajesh Sharma",
    )
    profile = user.partner_profile
    profile.kyc_status = KycStatus.APPROVED
    profile.agency_name = "Sharma Real Estate"
    profile.save()
    return user


@pytest.fixture
def other_partner_user(db):
    user = User.objects.create_user(
        phone="+919876543211",
        role=User.Role.CHANNEL_PARTNER,
        full_name="Vikram Verma",
    )
    profile = user.partner_profile
    profile.kyc_status = KycStatus.APPROVED
    profile.agency_name = "Verma Realty"
    profile.save()
    return user


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        phone="+919999999999",
        role=User.Role.ADMIN,
        full_name="Super Admin",
    )


@pytest.fixture
def sample_property(db, partner_user):
    return Property.objects.create(
        owner=partner_user.partner_profile,
        title="Supertech Eco Village 2 BHK",
        society_name="Supertech Eco Village",
        tower="T-3",
        unit_number="1204",
        bhk_type=BhkType.BHK_2,
        super_area_sqft=Decimal("1150.00"),
        carpet_area_sqft=Decimal("850.00"),
        floor_number=12,
        total_floors=24,
        price=Decimal("6500000.00"),
        status=PropertyStatus.APPROVED,
    )


@pytest.fixture
def sample_bank_account(db, partner_user):
    return BankAccount.objects.create(
        partner=partner_user.partner_profile,
        account_holder_name="Rajesh Sharma",
        account_number="123456789012",
        ifsc_code="HDFC0001234",
        bank_name="HDFC Bank",
        is_verified=True,
    )


@pytest.mark.django_db
class TestDoubleEntryLedger:
    """Tests double-entry ledger invariants, running balances, and immutability."""

    def test_ledger_credit_and_debit_invariants(self, partner_user):
        partner = partner_user.partner_profile
        assert partner.current_balance == Decimal("0.00")
        assert partner.total_earned == Decimal("0.00")

        # 1. Credit ₹50,000
        entry1 = FinanceService.record_ledger_entry(
            partner=partner,
            entry_type=LedgerEntryType.CREDIT,
            amount=Decimal("50000.00"),
            category=LedgerCategory.COMMISSION_DEAL,
            description="Deal closure commission",
        )
        partner.refresh_from_db()
        assert entry1.running_balance == Decimal("50000.00")
        assert partner.current_balance == Decimal("50000.00")
        assert partner.total_earned == Decimal("50000.00")

        # 2. Debit ₹20,000
        entry2 = FinanceService.record_ledger_entry(
            partner=partner,
            entry_type=LedgerEntryType.DEBIT,
            amount=Decimal("20000.00"),
            category=LedgerCategory.PAYOUT_DISBURSEMENT,
            description="Payout withdrawal",
        )
        partner.refresh_from_db()
        assert entry2.running_balance == Decimal("30000.00")
        assert partner.current_balance == Decimal("30000.00")
        assert partner.total_earned == Decimal(
            "50000.00"
        )  # Lifetime earnings unaffected by debit

    def test_ledger_debit_exceeding_balance_raises_error(self, partner_user):
        partner = partner_user.partner_profile
        assert partner.current_balance == Decimal("0.00")

        with pytest.raises(ValidationError) as exc_info:
            FinanceService.record_ledger_entry(
                partner=partner,
                entry_type=LedgerEntryType.DEBIT,
                amount=Decimal("1000.00"),
                category=LedgerCategory.PAYOUT_DISBURSEMENT,
                description="Overdraft attempt",
            )
        assert "Insufficient cleared balance" in str(exc_info.value)

    def test_ledger_records_are_immutable(self, partner_user):
        partner = partner_user.partner_profile
        entry = FinanceService.record_ledger_entry(
            partner=partner,
            entry_type=LedgerEntryType.CREDIT,
            amount=Decimal("10000.00"),
            category=LedgerCategory.BONUS_INCENTIVE,
            description="Milestone bonus",
        )
        with pytest.raises(ValidationError) as exc:
            entry.delete()
        assert "immutable" in str(exc.value)


@pytest.mark.django_db
class TestCommissionAndInvoices:
    """Tests commission formulas, TDS deduction rates, and invoice issuance."""

    def test_tds_deduction_rates(self, partner_user, other_partner_user):
        # Partner with approved KYC & PAN gets 5% TDS
        KycSubmission.objects.create(
            partner=partner_user.partner_profile,
            pan_number="ABCDE1234F",
            status=KycStatus.APPROVED,
        )
        rate, tds, net = FinanceService.calculate_tds(
            partner_user.partner_profile, Decimal("100000.00")
        )
        assert rate == Decimal("5.00")
        assert tds == Decimal("5000.00")
        assert net == Decimal("95000.00")

        # Partner without approved PAN gets 20% TDS
        rate2, tds2, net2 = FinanceService.calculate_tds(
            other_partner_user.partner_profile, Decimal("100000.00")
        )
        assert rate2 == Decimal("20.00")
        assert tds2 == Decimal("20000.00")
        assert net2 == Decimal("80000.00")

    def test_deal_registration_issues_invoice_and_credits_ledger(
        self, partner_user, sample_property
    ):
        partner = partner_user.partner_profile
        KycSubmission.objects.create(
            partner=partner,
            pan_number="ABCDE1234F",
            status=KycStatus.APPROVED,
        )

        rule = CommissionRule.objects.create(
            name="Standard 2%",
            rule_type=CommissionRuleType.PERCENTAGE,
            percentage=Decimal("2.00"),
        )

        lead = Lead.objects.create(
            partner=partner,
            customer_name="Amit Kumar",
            customer_phone="+919811223344",
            status=LeadStatus.OFFER_MADE,
            attribution_expires_at=timezone.now() + timezone.timedelta(days=60),
        )

        deal = Deal.objects.create(
            property=sample_property,
            partner=partner,
            lead=lead,
            commission_rule=rule,
            agreement_value=Decimal("10000000.00"),  # 1 Crore
            status=DealStatus.PENDING_REGISTRATION,
        )

        invoice = FinanceService.register_deal_and_credit_commission(deal)

        assert invoice.gross_commission == Decimal("200000.00")  # 2% of 1 Cr
        assert invoice.tds_rate == Decimal("5.00")
        assert invoice.tds_deducted == Decimal("10000.00")  # 5% of 2 Lakh
        assert invoice.net_payable == Decimal("190000.00")  # 1.9 Lakh
        assert invoice.status == InvoiceStatus.ISSUED
        assert invoice.invoice_number.startswith("PROHO/")

        # Verify partner ledger credited
        partner.refresh_from_db()
        assert partner.current_balance == Decimal("190000.00")
        assert partner.total_earned == Decimal("190000.00")

        # Verify deal registered
        deal.refresh_from_db()
        assert deal.status == DealStatus.REGISTERED
        assert deal.registered_at is not None

        # Verify lead closed
        lead.refresh_from_db()
        assert lead.status == LeadStatus.CLOSED

    def test_deal_reversal_debits_ledger_and_cancels_invoice(
        self, partner_user, sample_property
    ):
        partner = partner_user.partner_profile
        KycSubmission.objects.create(
            partner=partner,
            pan_number="ABCDE1234F",
            status=KycStatus.APPROVED,
        )

        deal = Deal.objects.create(
            property=sample_property,
            partner=partner,
            agreement_value=Decimal("5000000.00"),
            status=DealStatus.PENDING_REGISTRATION,
        )
        invoice = FinanceService.register_deal_and_credit_commission(deal)
        partner.refresh_from_db()
        credited = partner.current_balance
        assert credited > Decimal("0.00")

        # Reverse deal
        entry = FinanceService.reverse_deal_commission(
            deal=deal,
            reason="Buyer loan rejected after agreement",
        )
        assert entry.entry_type == LedgerEntryType.DEBIT
        assert entry.category == LedgerCategory.REVERSAL

        partner.refresh_from_db()
        assert partner.current_balance == Decimal("0.00")

        deal.refresh_from_db()
        assert deal.status == DealStatus.CANCELLED
        invoice.refresh_from_db()
        assert invoice.status == InvoiceStatus.CANCELLED


@pytest.mark.django_db
class TestPayoutRequests:
    """
    Tests partner payout request constraints, balance thresholds, and KYC enforcement.
    """

    def test_payout_requires_approved_kyc(
        self, other_partner_user, sample_bank_account
    ):
        partner = other_partner_user.partner_profile
        partner.kyc_status = KycStatus.PENDING
        partner.save()

        # Credit some balance
        FinanceService.record_ledger_entry(
            partner=partner,
            entry_type=LedgerEntryType.CREDIT,
            amount=Decimal("20000.00"),
            category=LedgerCategory.COMMISSION_DEAL,
            description="Balance credit",
        )

        with pytest.raises(ValidationError) as exc:
            FinanceService.create_payout_request(
                partner=partner,
                bank_account_id=sample_bank_account.id,
                amount=Decimal("10000.00"),
            )
        assert "Partner KYC must be verified and approved" in str(exc.value)

    def test_payout_minimum_threshold_and_balance_check(
        self, partner_user, sample_bank_account
    ):
        partner = partner_user.partner_profile

        # 1. Reject if less than ₹5,000
        with pytest.raises(ValidationError) as exc:
            FinanceService.create_payout_request(
                partner=partner,
                bank_account_id=sample_bank_account.id,
                amount=Decimal("3000.00"),
            )
        assert "Minimum withdrawal amount is ₹5000.00" in str(exc.value)

        # 2. Reject if amount exceeds available balance
        with pytest.raises(ValidationError) as exc:
            FinanceService.create_payout_request(
                partner=partner,
                bank_account_id=sample_bank_account.id,
                amount=Decimal("10000.00"),
            )
        assert "exceeds your cleared available balance" in str(exc.value)

    def test_payout_lifecycle_disbursement_with_utr(
        self, partner_user, sample_bank_account, admin_user
    ):
        partner = partner_user.partner_profile
        # Credit balance of ₹50,000
        FinanceService.record_ledger_entry(
            partner=partner,
            entry_type=LedgerEntryType.CREDIT,
            amount=Decimal("50000.00"),
            category=LedgerCategory.COMMISSION_DEAL,
            description="Deal commission",
        )

        # Partner submits ₹20,000 payout
        payout = FinanceService.create_payout_request(
            partner=partner,
            bank_account_id=sample_bank_account.id,
            amount=Decimal("20000.00"),
        )
        assert payout.status == PayoutStatus.REQUESTED

        # Admin reviews
        FinanceService.review_payout(
            payout=payout,
            new_status=PayoutStatus.APPROVED,
            actor=admin_user,
        )
        payout.refresh_from_db()
        assert payout.status == PayoutStatus.APPROVED

        # Admin disburses with UTR
        FinanceService.disburse_payout(
            payout=payout,
            utr_reference="HDFCN202610210001",
            actor=admin_user,
        )
        payout.refresh_from_db()
        assert payout.status == PayoutStatus.PAID
        assert payout.utr_reference == "HDFCN202610210001"

        # Partner balance debited atomically
        partner.refresh_from_db()
        assert partner.current_balance == Decimal("30000.00")


@pytest.mark.django_db
class TestFinanceAPI:
    """Tests API endpoints for partner summary, ledger, payouts, and admin controls."""

    def test_partner_summary_and_ledger_endpoints(self, api_client, partner_user):
        api_client.force_authenticate(user=partner_user)

        # Credit balance
        FinanceService.record_ledger_entry(
            partner=partner_user.partner_profile,
            entry_type=LedgerEntryType.CREDIT,
            amount=Decimal("40000.00"),
            category=LedgerCategory.COMMISSION_DEAL,
            description="Test credit",
        )

        res = api_client.get("/api/v1/finance/summary/")
        assert res.status_code == status.HTTP_200_OK
        data = res.json()["data"]
        assert data["current_balance"] == "40000.00"
        assert data["available_balance"] == "40000.00"

        ledger_res = api_client.get("/api/v1/finance/ledger/")
        assert ledger_res.status_code == status.HTTP_200_OK
        assert ledger_res.json()["count"] == 1

    def test_partner_cannot_access_other_partner_finance(
        self, api_client, partner_user, other_partner_user, sample_bank_account
    ):
        # Create payout for partner_user
        FinanceService.record_ledger_entry(
            partner=partner_user.partner_profile,
            entry_type=LedgerEntryType.CREDIT,
            amount=Decimal("15000.00"),
            category=LedgerCategory.COMMISSION_DEAL,
            description="Balance",
        )
        payout = FinanceService.create_payout_request(
            partner=partner_user.partner_profile,
            bank_account_id=sample_bank_account.id,
            amount=Decimal("10000.00"),
        )

        # other_partner_user attempts to retrieve payout
        api_client.force_authenticate(user=other_partner_user)
        res = api_client.get(f"/api/v1/finance/payouts/{payout.id}/")
        assert res.status_code == status.HTTP_404_NOT_FOUND

    def test_admin_payout_review_and_disburse_endpoints(
        self, api_client, admin_user, partner_user, sample_bank_account
    ):
        partner = partner_user.partner_profile
        FinanceService.record_ledger_entry(
            partner=partner,
            entry_type=LedgerEntryType.CREDIT,
            amount=Decimal("25000.00"),
            category=LedgerCategory.COMMISSION_DEAL,
            description="Deal credit",
        )
        payout = FinanceService.create_payout_request(
            partner=partner,
            bank_account_id=sample_bank_account.id,
            amount=Decimal("15000.00"),
        )

        api_client.force_authenticate(user=admin_user)

        # 1. Admin review to APPROVED
        review_res = api_client.post(
            f"/api/v1/admin/finance/payouts/{payout.id}/review/",
            {"status": PayoutStatus.APPROVED},
        )
        assert review_res.status_code == status.HTTP_200_OK
        assert review_res.json()["data"]["status"] == PayoutStatus.APPROVED

        # 2. Admin disburse with UTR
        disburse_res = api_client.post(
            f"/api/v1/admin/finance/payouts/{payout.id}/disburse/",
            {"utr_reference": "BANK-UTR-9990001"},
        )
        assert disburse_res.status_code == status.HTTP_200_OK
        assert disburse_res.json()["data"]["status"] == PayoutStatus.PAID
        assert disburse_res.json()["data"]["utr_reference"] == "BANK-UTR-9990001"

    def test_partner_invoice_list_and_detail_endpoints(
        self, api_client, partner_user, sample_property
    ):
        partner = partner_user.partner_profile
        KycSubmission.objects.create(
            partner=partner,
            pan_number="ABCDE1234F",
            status=KycStatus.APPROVED,
        )
        deal = Deal.objects.create(
            property=sample_property,
            partner=partner,
            agreement_value=Decimal("8000000.00"),
            status=DealStatus.PENDING_REGISTRATION,
        )
        invoice = FinanceService.register_deal_and_credit_commission(deal)

        api_client.force_authenticate(user=partner_user)
        list_res = api_client.get("/api/v1/finance/invoices/")
        assert list_res.status_code == status.HTTP_200_OK
        assert list_res.json()["count"] == 1

        detail_res = api_client.get(f"/api/v1/finance/invoices/{invoice.id}/")
        assert detail_res.status_code == status.HTTP_200_OK
        assert detail_res.json()["data"]["invoice_number"] == invoice.invoice_number

    def test_partner_payout_create_endpoint(
        self, api_client, partner_user, sample_bank_account
    ):
        partner = partner_user.partner_profile
        FinanceService.record_ledger_entry(
            partner=partner,
            entry_type=LedgerEntryType.CREDIT,
            amount=Decimal("30000.00"),
            category=LedgerCategory.COMMISSION_DEAL,
            description="Commission balance",
        )

        api_client.force_authenticate(user=partner_user)
        res = api_client.post(
            "/api/v1/finance/payouts/",
            {
                "bank_account_id": str(sample_bank_account.id),
                "amount": "12000.00",
            },
        )
        assert res.status_code == status.HTTP_201_CREATED
        payout_id = res.json()["data"]["id"]

        detail_res = api_client.get(f"/api/v1/finance/payouts/{payout_id}/")
        assert detail_res.status_code == status.HTTP_200_OK
        assert detail_res.json()["data"]["amount"] == "12000.00"

    def test_admin_deals_create_register_and_reverse_endpoints(
        self, api_client, admin_user, partner_user, sample_property
    ):
        api_client.force_authenticate(user=admin_user)
        partner = partner_user.partner_profile

        # Create deal
        create_res = api_client.post(
            "/api/v1/admin/finance/deals/",
            {
                "property": str(sample_property.id),
                "partner": str(partner.id),
                "agreement_value": "7500000.00",
                "notes": "Admin deal creation",
            },
        )
        assert create_res.status_code == status.HTTP_201_CREATED
        deal_id = create_res.json()["data"]["id"]

        # Register deal
        reg_res = api_client.post(f"/api/v1/admin/finance/deals/{deal_id}/register/")
        assert reg_res.status_code == status.HTTP_200_OK
        assert reg_res.json()["data"]["status"] == DealStatus.REGISTERED
        assert "invoice" in reg_res.json()

        # Reverse deal
        rev_res = api_client.post(
            f"/api/v1/admin/finance/deals/{deal_id}/reverse/",
            {"reason": "Deal fell through during registration"},
        )
        assert rev_res.status_code == status.HTTP_200_OK
        assert rev_res.json()["data"]["status"] == DealStatus.CANCELLED

    def test_admin_ledger_adjustment_endpoint(
        self, api_client, admin_user, partner_user
    ):
        api_client.force_authenticate(user=admin_user)
        partner = partner_user.partner_profile

        res = api_client.post(
            "/api/v1/admin/finance/ledger/adjustment/",
            {
                "partner_id": str(partner.id),
                "entry_type": LedgerEntryType.CREDIT,
                "amount": "5000.00",
                "category": LedgerCategory.BONUS_INCENTIVE,
                "description": "Special festival bonus",
            },
        )
        assert res.status_code == status.HTTP_201_CREATED
        assert res.json()["data"]["amount"] == "5000.00"

        partner.refresh_from_db()
        assert partner.current_balance == Decimal("5000.00")
