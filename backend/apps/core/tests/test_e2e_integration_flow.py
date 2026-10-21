"""
End-to-End Integration Flow Test for Phase 8.
Tests the entire lifecycle:
Auth -> Profile & KYC -> Resale Sourcing -> Admin Review -> Lead & 60-day Lock-in ->
Visit & Smart Lock OTP -> Deal Registration -> Commission Ledger (2% Gross, 5% TDS) ->
Payout Request -> Admin Disbursement with Bank UTR.
"""

from datetime import timedelta
from decimal import Decimal
import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.finance.models import Deal, DealStatus, PayoutStatus
from apps.finance.services import FinanceService
from apps.partners.models import KycStatus, PartnerProfile
from apps.properties.models import BhkType, Property, PropertyStatus
from apps.properties.services import PropertyService
from apps.visits.models import Visit, VisitStatus


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def dummy_file():
    return SimpleUploadedFile(
        "doc.pdf", b"%PDF-1.4 dummy content", content_type="application/pdf"
    )


@pytest.fixture
def dummy_image():
    return SimpleUploadedFile(
        "living_room.jpg", b"fake jpeg image bytes", content_type="image/jpeg"
    )


@pytest.fixture
def admin_user(db):
    user = User.objects.create_superuser(
        phone="+919999999999",
        password="AdminSecurePassword123!",
    )
    return user


@pytest.mark.django_db
class TestEndToEndPlatformFlow:
    """Verifies complete end-to-end integration across all apps and roles."""

    def test_full_partner_to_payout_lifecycle(
        self, client, admin_user, dummy_file, dummy_image
    ):
        partner_phone = "+919876543210"

        # ---------------------------------------------------------------------
        # 1. Partner Request & Verify OTP (Authentication)
        # ---------------------------------------------------------------------
        req_res = client.post("/api/v1/auth/otp/request/", {"phone": partner_phone})
        assert req_res.status_code == 200
        assert req_res.json()["success"] is True
        raw_otp = req_res.json()["data"]["otp_preview"]

        verify_res = client.post(
            "/api/v1/auth/otp/verify/",
            {"phone": partner_phone, "otp": raw_otp},
        )
        assert verify_res.status_code == 200
        partner_token = verify_res.json()["data"]["access"]
        partner_client = APIClient()
        partner_client.credentials(HTTP_AUTHORIZATION=f"Bearer {partner_token}")

        # ---------------------------------------------------------------------
        # 2. Partner Updates Profile & Submits KYC
        # ---------------------------------------------------------------------
        profile_res = partner_client.patch(
            "/api/v1/partner/profile/",
            {
                "base_location": "Greater Noida West",
                "work_areas": ["Central Noida", "Gaur City", "Sector 16B"],
                "agency_name": "Apex Realty Partners",
            },
            format="json",
        )
        assert profile_res.status_code == 200
        assert profile_res.json()["data"]["base_location"] == "Greater Noida West"

        pan_file = SimpleUploadedFile(
            "pan.jpg", b"dummy pan image", content_type="image/jpeg"
        )
        address_file = SimpleUploadedFile(
            "address.pdf", b"dummy address", content_type="application/pdf"
        )

        kyc_res = partner_client.post(
            "/api/v1/partner/kyc/",
            {
                "pan_number": "ABCDE1234F",
                "pan_document": pan_file,
                "aadhaar_last_four": "1234",
                "address_document": address_file,
            },
            format="multipart",
        )
        assert kyc_res.status_code == 201
        kyc_id = kyc_res.json()["data"]["id"]

        # ---------------------------------------------------------------------
        # 3. Admin Reviews & Approves Partner KYC
        # ---------------------------------------------------------------------
        admin_client = APIClient()
        admin_client.force_authenticate(user=admin_user)

        kyc_review_res = admin_client.post(
            f"/api/v1/admin/kyc/{kyc_id}/review/",
            {"decision": KycStatus.APPROVED, "remarks": "Documents verified"},
            format="json",
        )
        assert kyc_review_res.status_code == 200

        partner_profile = PartnerProfile.objects.get(user__phone=partner_phone)
        assert partner_profile.kyc_status == KycStatus.APPROVED
        assert partner_profile.is_kyc_approved is True

        # ---------------------------------------------------------------------
        # 4. Partner Sources a Property & Submits for Admin Approval
        # ---------------------------------------------------------------------
        prop_res = partner_client.post(
            "/api/v1/properties/",
            {
                "title": "Gaur City 2 - 3BHK",
                "description": "High-rise 3BHK corner unit.",
                "society_name": "Gaur City 2",
                "locality": "Greater Noida West",
                "bhk_type": BhkType.BHK_3,
                "super_area_sqft": "1450.00",
                "price": "9500000.00",
            },
            format="json",
        )
        assert prop_res.status_code == 201
        prop_id = prop_res.json()["data"]["id"]
        prop_obj = Property.objects.get(id=prop_id)

        # Attach media required before submission
        PropertyService.attach_media(
            prop=prop_obj,
            file_obj=dummy_image,
            user=partner_profile.user,
        )

        # Submit property for verification
        submit_prop_res = partner_client.post(f"/api/v1/properties/{prop_id}/submit/")
        assert submit_prop_res.status_code == 200
        prop_obj.refresh_from_db()
        assert prop_obj.status == PropertyStatus.PENDING_REVIEW

        # Admin approves property
        admin_prop_res = admin_client.post(
            f"/api/v1/admin/properties/{prop_id}/review/",
            {"decision": PropertyStatus.APPROVED},
            format="json",
        )
        assert admin_prop_res.status_code == 200
        prop_obj.refresh_from_db()
        assert prop_obj.status == PropertyStatus.APPROVED

        # ---------------------------------------------------------------------
        # 5. Partner Registers a Lead & Schedules a Visit (OTP Generated)
        # ---------------------------------------------------------------------
        lead_res = partner_client.post(
            "/api/v1/leads/",
            {
                "customer_name": "Rohan Gupta",
                "customer_phone": "9812345678",
                "preferred_location": "Greater Noida West",
                "budget_max": "10000000.00",
            },
            format="json",
        )
        assert lead_res.status_code == 201
        lead_id = lead_res.json()["data"]["id"]

        tomorrow = timezone.now() + timedelta(days=1)
        start_time = tomorrow.replace(hour=14, minute=0, second=0, microsecond=0)
        end_time = start_time + timedelta(hours=1)

        visit_res = partner_client.post(
            "/api/v1/visits/",
            {
                "property_id": str(prop_id),
                "lead_id": str(lead_id),
                "scheduled_start": start_time.isoformat(),
                "scheduled_end": end_time.isoformat(),
            },
            format="json",
        )
        assert visit_res.status_code == 201
        visit_id = visit_res.json()["data"]["id"]

        # Partner requests visit door OTP
        otp_req_res = admin_client.post(f"/api/v1/visits/{visit_id}/request-otp/")
        assert otp_req_res.status_code == 200
        door_otp = otp_req_res.json()["data"]["otp_preview"]

        # Visitor verifies door OTP at door
        otp_verify_res = partner_client.post(
            f"/api/v1/visits/{visit_id}/verify-otp/",
            {"otp": door_otp},
            format="json",
        )
        assert otp_verify_res.status_code == 200
        visit_record = Visit.objects.get(id=visit_id)
        assert visit_record.status == VisitStatus.VERIFIED_COMPLETED

        # ---------------------------------------------------------------------
        # 6. Deal Registration & Commission Calculation (2% Comm, 5% TDS)
        # ---------------------------------------------------------------------
        deal = Deal.objects.create(
            property=prop_obj,
            partner=partner_profile,
            agreement_value=Decimal("9500000.00"),
            status=DealStatus.PENDING_REGISTRATION,
        )

        invoice = FinanceService.register_deal_and_credit_commission(
            deal=deal,
            actor=admin_user,
        )
        assert invoice is not None
        # Agreement: 95,00,000 -> Gross (2%): 1,90,000
        # TDS (5%): 9,500 -> Net: 1,80,500
        assert invoice.gross_commission == Decimal("190000.00")
        assert invoice.tds_deducted == Decimal("9500.00")
        assert invoice.net_payable == Decimal("180500.00")

        # Verify Financial Invariants:
        summary_res = partner_client.get("/api/v1/finance/summary/")
        assert summary_res.status_code == 200
        fin_data = summary_res.json()["data"]
        assert Decimal(fin_data["available_balance"]) == Decimal("180500.00")
        assert Decimal(fin_data["current_balance"]) == Decimal("180500.00")
        assert Decimal(fin_data["total_earned"]) == Decimal("180500.00")

        # ---------------------------------------------------------------------
        # 7. Partner Bank Account & Payout Request (Min ₹5,000, Idempotency)
        # ---------------------------------------------------------------------
        bank_res = partner_client.post(
            "/api/v1/partner/bank-accounts/",
            {
                "account_number": "123456789012",
                "ifsc_code": "HDFC0001234",
                "account_holder_name": "Rajesh Sharma",
                "bank_name": "HDFC Bank",
                "is_primary": True,
            },
            format="json",
        )
        assert bank_res.status_code == 201
        bank_id = bank_res.json()["data"]["id"]

        # Below minimum ₹5,000 should fail
        low_payout = partner_client.post(
            "/api/v1/finance/payouts/",
            {"amount": "3000.00", "bank_account_id": bank_id},
            format="json",
        )
        assert low_payout.status_code == 400

        # Valid payout request of entire cleared balance
        payout_res = partner_client.post(
            "/api/v1/finance/payouts/",
            {"amount": "180500.00", "bank_account_id": bank_id},
            format="json",
            HTTP_IDEMPOTENCY_KEY="idempotency-key-payout-001",
        )
        assert payout_res.status_code == 201
        payout_id = payout_res.json()["data"]["id"]
        assert payout_res.json()["data"]["status"] == PayoutStatus.REQUESTED

        # Admin approves payout request
        approve_res = admin_client.post(
            f"/api/v1/admin/finance/payouts/{payout_id}/review/",
            {"status": PayoutStatus.APPROVED},
            format="json",
        )
        assert approve_res.status_code == 200
        assert approve_res.json()["data"]["status"] == PayoutStatus.APPROVED

        # Admin disburses payout with bank UTR
        disburse_res = admin_client.post(
            f"/api/v1/admin/finance/payouts/{payout_id}/disburse/",
            {"utr_reference": "HDFCR520261021000987"},
            format="json",
        )
        assert disburse_res.status_code == 200
        assert disburse_res.json()["data"]["status"] == PayoutStatus.PAID
        assert disburse_res.json()["data"]["utr_reference"] == "HDFCR520261021000987"

        # Final Wallet Cleared Balance should be 0.00
        final_summary = partner_client.get("/api/v1/finance/summary/")
        assert Decimal(final_summary.json()["data"]["available_balance"]) == Decimal(
            "0.00"
        )
        assert Decimal(final_summary.json()["data"]["total_withdrawn"]) == Decimal(
            "180500.00"
        )
