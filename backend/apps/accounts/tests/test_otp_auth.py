"""
Tests for phone OTP generation, verification, JWT issuance, and user profile management.
"""

from datetime import timedelta
from django.utils import timezone
import pytest
from rest_framework.test import APIClient
from apps.accounts.models import User, PhoneOtp
from apps.accounts.services import PhoneOtpService


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
class TestOtpAuthentication:
    """Validates phone OTP request, verification, attempt limits, and token issuance."""

    def test_request_otp_success(self, api_client):
        response = api_client.post(
            "/api/v1/auth/otp/request/",
            data={"phone": "+919876500011"},
            format="json",
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "otp_preview" in data["data"]

        otp_record = PhoneOtp.objects.filter(phone="+919876500011").first()
        assert otp_record is not None
        assert otp_record.is_consumed is False
        assert otp_record.attempts == 0

    def test_verify_otp_new_user_registration(self, api_client):
        # 1. Request OTP
        req_res = api_client.post(
            "/api/v1/auth/otp/request/",
            data={"phone": "+919876500022"},
            format="json",
        )
        raw_code = req_res.json()["data"]["otp_preview"]

        # 2. Verify OTP
        verify_res = api_client.post(
            "/api/v1/auth/otp/verify/",
            data={"phone": "+919876500022", "otp": raw_code},
            format="json",
        )
        assert verify_res.status_code == 200
        data = verify_res.json()
        assert data["success"] is True
        assert "access" in data["data"]
        assert "refresh" in data["data"]
        assert data["data"]["user"]["phone"] == "+919876500022"

        # Check user and partner profile created
        user = User.objects.get(phone="+919876500022")
        assert user.role == User.Role.CHANNEL_PARTNER
        assert hasattr(user, "partner_profile")

    def test_verify_otp_invalid_code_decrements_attempts(self, api_client):
        api_client.post(
            "/api/v1/auth/otp/request/",
            data={"phone": "+919876500033"},
            format="json",
        )

        res = api_client.post(
            "/api/v1/auth/otp/verify/",
            data={"phone": "+919876500033", "otp": "000000"},
            format="json",
        )
        assert res.status_code == 400
        data = res.json()
        assert data["success"] is False
        assert "2 attempt(s) remaining" in str(data["error"]["details"])

        otp_record = PhoneOtp.objects.get(phone="+919876500033")
        assert otp_record.attempts == 1

    def test_verify_otp_locked_after_3_attempts(self, api_client):
        api_client.post(
            "/api/v1/auth/otp/request/",
            data={"phone": "+919876500044"},
            format="json",
        )

        for _ in range(2):
            api_client.post(
                "/api/v1/auth/otp/verify/",
                data={"phone": "+919876500044", "otp": "000000"},
                format="json",
            )

        # 3rd failed attempt
        res3 = api_client.post(
            "/api/v1/auth/otp/verify/",
            data={"phone": "+919876500044", "otp": "000000"},
            format="json",
        )
        assert res3.status_code == 400
        assert "Maximum attempts reached" in str(res3.json()["error"]["details"])

    def test_verify_otp_expired(self, api_client):
        phone_otp, raw_code = PhoneOtpService.generate_otp("+919876500055")
        phone_otp.expires_at = timezone.now() - timedelta(seconds=10)
        phone_otp.save()

        res = api_client.post(
            "/api/v1/auth/otp/verify/",
            data={"phone": "+919876500055", "otp": raw_code},
            format="json",
        )
        assert res.status_code == 400
        assert "OTP has expired" in str(res.json()["error"]["details"])

    def test_verify_otp_already_consumed(self, api_client):
        phone_otp, raw_code = PhoneOtpService.generate_otp("+919876500066")
        # Consume first time
        PhoneOtpService.verify_otp("+919876500066", raw_code)

        # Attempt to verify again
        res = api_client.post(
            "/api/v1/auth/otp/verify/",
            data={"phone": "+919876500066", "otp": raw_code},
            format="json",
        )
        assert res.status_code == 400
        assert "No active OTP found" in str(res.json()["error"]["details"])

    def test_current_user_profile_get_and_patch(self, api_client):
        user = User.objects.create_user(
            phone="+919876500077",
            password="TestPassword123!",
            preferred_language=User.Language.ENGLISH,
        )
        api_client.force_authenticate(user=user)

        # GET /auth/me/
        get_res = api_client.get("/api/v1/auth/me/")
        assert get_res.status_code == 200
        assert get_res.json()["data"]["phone"] == "+919876500077"

        # PATCH /auth/me/
        patch_res = api_client.patch(
            "/api/v1/auth/me/",
            data={"full_name": "Rohan Gupta", "preferred_language": "hi"},
            format="json",
        )
        assert patch_res.status_code == 200
        assert patch_res.json()["data"]["full_name"] == "Rohan Gupta"
        assert patch_res.json()["data"]["preferred_language"] == "hi"
