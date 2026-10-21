"""
Tests for Partner Profile updates, KYC document submission, and bank accounts.
"""

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.partners.models import PartnerProfile, KycStatus, BankAccount


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def partner_user(db):
    user = User.objects.create_user(
        phone="+919811122233",
        password="TestPassword123!",
        role=User.Role.CHANNEL_PARTNER,
    )
    return user


@pytest.fixture
def dummy_file():
    return SimpleUploadedFile(
        "document.pdf", b"%PDF-1.4 dummy content", content_type="application/pdf"
    )


@pytest.mark.django_db
class TestPartnerProfileAndKyc:
    """
    Verifies partner onboarding, location selection, KYC submission,
    and bank account management.
    """

    def test_partner_profile_auto_created_and_updated(self, api_client, partner_user):
        api_client.force_authenticate(user=partner_user)

        # GET profile
        get_res = api_client.get("/api/v1/partner/profile/")
        assert get_res.status_code == 200
        data = get_res.json()["data"]
        assert data["kyc_status"] == KycStatus.NOT_SUBMITTED

        # PATCH profile (Locations as per reference screens: Base Location + Work Areas)
        patch_res = api_client.patch(
            "/api/v1/partner/profile/",
            data={
                "base_location": "Greater Noida West",
                "work_areas": ["Gaur City", "Central Noida", "Sector 1"],
                "agency_name": "Apex Realty Partners",
            },
            format="json",
        )
        assert patch_res.status_code == 200
        updated = patch_res.json()["data"]
        assert updated["base_location"] == "Greater Noida West"
        assert updated["work_areas"] == ["Gaur City", "Central Noida", "Sector 1"]
        assert updated["agency_name"] == "Apex Realty Partners"

    def test_submit_kyc_valid(self, api_client, partner_user, dummy_file):
        api_client.force_authenticate(user=partner_user)

        pan_file = SimpleUploadedFile(
            "pan.jpg", b"dummy pan image", content_type="image/jpeg"
        )
        address_file = SimpleUploadedFile(
            "address.pdf", b"dummy address", content_type="application/pdf"
        )

        res = api_client.post(
            "/api/v1/partner/kyc/",
            data={
                "pan_number": "ABCDE1234F",
                "pan_document": pan_file,
                "aadhaar_last_four": "9876",
                "address_document": address_file,
            },
            format="multipart",
        )
        assert res.status_code == 201
        data = res.json()["data"]
        assert data["pan_number"] == "ABCDE1234F"
        assert data["aadhaar_last_four"] == "9876"
        assert data["status"] == KycStatus.PENDING

        profile = PartnerProfile.objects.get(user=partner_user)
        assert profile.kyc_status == KycStatus.PENDING
        assert profile.is_kyc_approved is False

    def test_submit_kyc_invalid_pan_format(self, api_client, partner_user, dummy_file):
        api_client.force_authenticate(user=partner_user)

        res = api_client.post(
            "/api/v1/partner/kyc/",
            data={
                "pan_number": "INVALID123",  # Invalid regex
                "pan_document": dummy_file,
                "aadhaar_last_four": "1234",
                "address_document": dummy_file,
            },
            format="multipart",
        )
        assert res.status_code == 400
        assert "Invalid PAN format" in str(res.json()["error"]["details"])

    def test_submit_kyc_invalid_aadhaar_last_four(
        self, api_client, partner_user, dummy_file
    ):
        api_client.force_authenticate(user=partner_user)

        res = api_client.post(
            "/api/v1/partner/kyc/",
            data={
                "pan_number": "ABCDE1234F",
                "pan_document": dummy_file,
                "aadhaar_last_four": "123",  # Only 3 digits
                "address_document": dummy_file,
            },
            format="multipart",
        )
        assert res.status_code == 400
        assert "Aadhaar last four must be exactly 4 numeric digits" in str(
            res.json()["error"]["details"]
        )

    def test_submit_kyc_file_size_exceeded(self, api_client, partner_user):
        api_client.force_authenticate(user=partner_user)

        # 6MB dummy file (limit is 5MB)
        large_file = SimpleUploadedFile(
            "large.pdf", b"0" * (6 * 1024 * 1024), content_type="application/pdf"
        )
        normal_file = SimpleUploadedFile(
            "normal.pdf", b"0" * 1024, content_type="application/pdf"
        )

        res = api_client.post(
            "/api/v1/partner/kyc/",
            data={
                "pan_number": "ABCDE1234F",
                "pan_document": large_file,
                "aadhaar_last_four": "1234",
                "address_document": normal_file,
            },
            format="multipart",
        )
        assert res.status_code == 400
        assert "File size exceeds 5MB limit" in str(res.json()["error"]["details"])

    def test_bank_account_registration_and_masking(self, api_client, partner_user):
        api_client.force_authenticate(user=partner_user)

        res = api_client.post(
            "/api/v1/partner/bank-accounts/",
            data={
                "account_holder_name": "Rohan Sharma",
                "account_number": "123456789012",
                "ifsc_code": "HDFC0001234",
                "bank_name": "HDFC Bank",
            },
            format="json",
        )
        assert res.status_code == 201
        data = res.json()["data"]
        assert data["account_number_masked"] == "****9012"
        # Full account number is write-only and not returned in payload
        assert "account_number" not in data
        assert data["is_verified"] is False

        # Verify in database
        bank = BankAccount.objects.get(partner__user=partner_user)
        assert bank.account_number == "123456789012"
        assert bank.ifsc_code == "HDFC0001234"

    def test_invalid_ifsc_code_rejected(self, api_client, partner_user):
        api_client.force_authenticate(user=partner_user)

        res = api_client.post(
            "/api/v1/partner/bank-accounts/",
            data={
                "account_holder_name": "Rohan Sharma",
                "account_number": "123456789012",
                "ifsc_code": "HDFC1234567",  # 11 characters, but 5th char is not '0'
                "bank_name": "HDFC Bank",
            },
            format="json",
        )
        assert res.status_code == 400
        assert "Invalid IFSC code" in str(res.json()["error"]["details"])
