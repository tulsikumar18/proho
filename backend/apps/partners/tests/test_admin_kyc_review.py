"""
Tests for Admin KYC review workflow, approval, rejection, and audit trails.
"""

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.partners.models import PartnerProfile, KycSubmission, KycStatus
from apps.audit.models import AuditLog


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def partner_user(db):
    return User.objects.create_user(
        phone="+919811100001",
        password="TestPassword123!",
        role=User.Role.CHANNEL_PARTNER,
    )


@pytest.fixture
def other_partner_user(db):
    return User.objects.create_user(
        phone="+919811100002",
        password="TestPassword123!",
        role=User.Role.CHANNEL_PARTNER,
    )


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        phone="+919822200001",
        password="AdminPassword123!",
        role=User.Role.ADMIN,
        is_staff=True,
    )


@pytest.fixture
def kyc_submission(partner_user):
    profile = PartnerProfile.objects.get(user=partner_user)
    doc = SimpleUploadedFile("doc.pdf", b"pdf content", content_type="application/pdf")
    return KycSubmission.objects.create(
        partner=profile,
        pan_number="ABCDE1234F",
        pan_document=doc,
        aadhaar_last_four="4321",
        address_document=doc,
        status=KycStatus.PENDING,
    )


@pytest.mark.django_db
class TestAdminKycReview:
    """Verifies operational review of partner KYC documents and audit logging."""

    def test_partner_cannot_review_kyc(self, api_client, partner_user, kyc_submission):
        api_client.force_authenticate(user=partner_user)

        res = api_client.post(
            f"/api/v1/admin/kyc/{kyc_submission.id}/review/",
            data={"decision": KycStatus.APPROVED},
            format="json",
        )
        assert res.status_code == 403
        assert res.json()["error"]["code"] == "PERMISSION_DENIED"

    def test_admin_approves_kyc(self, api_client, admin_user, kyc_submission):
        api_client.force_authenticate(user=admin_user)

        res = api_client.post(
            f"/api/v1/admin/kyc/{kyc_submission.id}/review/",
            data={"decision": KycStatus.APPROVED},
            format="json",
        )
        assert res.status_code == 200
        data = res.json()["data"]
        assert data["submission"]["status"] == KycStatus.APPROVED

        # Verify DB updates
        kyc_submission.refresh_from_db()
        assert kyc_submission.status == KycStatus.APPROVED
        assert kyc_submission.reviewed_by == admin_user
        assert kyc_submission.partner.kyc_status == KycStatus.APPROVED
        assert kyc_submission.partner.is_kyc_approved is True

        # Verify Audit Log entry
        audit_log = AuditLog.objects.filter(
            action="KYC_APPROVED", target_id=str(kyc_submission.id)
        ).first()
        assert audit_log is not None
        assert audit_log.actor == admin_user
        assert audit_log.metadata["decision"] == KycStatus.APPROVED

    def test_admin_rejects_kyc_with_reason(
        self, api_client, admin_user, kyc_submission
    ):
        api_client.force_authenticate(user=admin_user)

        res = api_client.post(
            f"/api/v1/admin/kyc/{kyc_submission.id}/review/",
            data={
                "decision": KycStatus.REJECTED,
                "rejection_reason": "PAN card name does not match bank account name.",
            },
            format="json",
        )
        assert res.status_code == 200

        kyc_submission.refresh_from_db()
        assert kyc_submission.status == KycStatus.REJECTED
        assert (
            kyc_submission.rejection_reason
            == "PAN card name does not match bank account name."
        )
        assert kyc_submission.partner.kyc_status == KycStatus.REJECTED
        assert kyc_submission.partner.is_kyc_approved is False

        # Verify Audit Log entry
        audit_log = AuditLog.objects.filter(
            action="KYC_REJECTED", target_id=str(kyc_submission.id)
        ).first()
        assert audit_log is not None
        assert audit_log.actor == admin_user

    def test_admin_rejects_kyc_without_reason_fails(
        self, api_client, admin_user, kyc_submission
    ):
        api_client.force_authenticate(user=admin_user)

        res = api_client.post(
            f"/api/v1/admin/kyc/{kyc_submission.id}/review/",
            data={"decision": KycStatus.REJECTED, "rejection_reason": ""},
            format="json",
        )
        assert res.status_code == 400
        assert "Rejection reason is required" in str(res.json()["error"]["details"])

    def test_admin_kyc_list_filtering(self, api_client, admin_user, kyc_submission):
        api_client.force_authenticate(user=admin_user)

        # Query all
        res_all = api_client.get("/api/v1/admin/kyc/")
        assert res_all.status_code == 200
        assert res_all.json()["count"] >= 1

        # Query status=PENDING
        res_pending = api_client.get("/api/v1/admin/kyc/?status=PENDING")
        assert res_pending.status_code == 200
        assert res_pending.json()["count"] >= 1

        # Query status=APPROVED (none yet)
        res_approved = api_client.get("/api/v1/admin/kyc/?status=APPROVED")
        assert res_approved.status_code == 200
        assert res_approved.json()["count"] == 0

    def test_partner_isolation(self, api_client, other_partner_user, kyc_submission):
        """Ensures Partner B cannot see Partner A's submitted KYC documents."""
        api_client.force_authenticate(user=other_partner_user)

        # Partner B querying their own KYC endpoint sees none
        res = api_client.get("/api/v1/partner/kyc/")
        assert res.status_code == 200
        assert res.json()["data"]["latest_submission"] is None
