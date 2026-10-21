"""
Tests for property model, lifecycle state transitions, validations,
and administrative review.
"""

from decimal import Decimal
import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.partners.models import PartnerProfile
from apps.properties.models import Property, PropertyStatus, BhkType
from apps.properties.services import PropertyService
from apps.audit.models import AuditLog


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def partner_user(db):
    return User.objects.create_user(
        phone="+919811199991",
        password="TestPassword123!",
        role=User.Role.CHANNEL_PARTNER,
    )


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        phone="+919822299991",
        password="AdminPassword123!",
        role=User.Role.ADMIN,
        is_staff=True,
    )


@pytest.fixture
def dummy_image():
    return SimpleUploadedFile(
        "living_room.jpg", b"fake jpeg image bytes", content_type="image/jpeg"
    )


@pytest.mark.django_db
class TestPropertyLifecycle:
    """Verifies property draft creation, submission, review, and state transitions."""

    def test_create_draft_property(self, api_client, partner_user):
        api_client.force_authenticate(user=partner_user)

        res = api_client.post(
            "/api/v1/properties/",
            data={
                "title": "Gaur 14th Avenue - 2 BHK High Floor",
                "description": "Spacious flat facing the park.",
                "society_name": "Gaur City",
                "locality": "Greater Noida West",
                "bhk_type": BhkType.BHK_2,
                "super_area_sqft": "855.00",
                "price": "7900000.00",  # 79 Lakhs
            },
            format="json",
        )
        assert res.status_code == 201
        data = res.json()["data"]
        assert data["status"] == PropertyStatus.DRAFT
        assert data["price"] == "7900000.00"
        # Verify rate_per_sqft auto calculation: 7900000 / 855 = 9239.77
        assert Decimal(data["rate_per_sqft"]) == Decimal("9239.77")

        # Verify audit log
        audit = AuditLog.objects.filter(
            action="PROPERTY_CREATED", target_id=data["id"]
        ).first()
        assert audit is not None
        assert audit.actor == partner_user

    def test_property_negative_price_rejected(self, api_client, partner_user):
        api_client.force_authenticate(user=partner_user)

        res = api_client.post(
            "/api/v1/properties/",
            data={
                "title": "Invalid Price Unit",
                "society_name": "Gaur City",
                "price": "-1000.00",
            },
            format="json",
        )
        assert res.status_code == 400
        assert "Price must be greater than zero" in str(res.json()["error"]["details"])

    def test_partner_edit_draft_property(self, api_client, partner_user):
        api_client.force_authenticate(user=partner_user)
        profile = PartnerProfile.objects.get(user=partner_user)
        prop = Property.objects.create(
            owner=profile,
            title="Draft Flat",
            society_name="ACE Divino",
            price=Decimal("15000000.00"),
            status=PropertyStatus.DRAFT,
        )

        res = api_client.patch(
            f"/api/v1/properties/{prop.id}/",
            data={"title": "Updated Flat Title", "price": "16000000.00"},
            format="json",
        )
        assert res.status_code == 200
        assert res.json()["data"]["title"] == "Updated Flat Title"
        assert res.json()["data"]["price"] == "16000000.00"

    def test_submit_property_without_photos_fails(self, api_client, partner_user):
        api_client.force_authenticate(user=partner_user)
        profile = PartnerProfile.objects.get(user=partner_user)
        prop = Property.objects.create(
            owner=profile,
            title="Unit without media",
            society_name="ACE Divino",
            bhk_type=BhkType.BHK_3,
            super_area_sqft=Decimal("1565.00"),
            price=Decimal("17800000.00"),
            status=PropertyStatus.DRAFT,
        )

        res = api_client.post(f"/api/v1/properties/{prop.id}/submit/")
        assert res.status_code == 400
        assert "At least one property image must be uploaded" in str(
            res.json()["error"]["details"]
        )

    def test_submit_property_success(self, api_client, partner_user, dummy_image):
        api_client.force_authenticate(user=partner_user)
        profile = PartnerProfile.objects.get(user=partner_user)
        prop = Property.objects.create(
            owner=profile,
            title="Complete Unit",
            society_name="ACE Divino",
            bhk_type=BhkType.BHK_3,
            super_area_sqft=Decimal("1565.00"),
            price=Decimal("17800000.00"),
            status=PropertyStatus.DRAFT,
        )

        # Attach required photo
        PropertyService.attach_media(prop=prop, file_obj=dummy_image, user=partner_user)

        res = api_client.post(f"/api/v1/properties/{prop.id}/submit/")
        assert res.status_code == 200
        prop.refresh_from_db()
        assert prop.status == PropertyStatus.PENDING_REVIEW
        assert prop.submitted_at is not None

        # Verify audit log
        audit = AuditLog.objects.filter(
            action="PROPERTY_SUBMITTED", target_id=str(prop.id)
        ).first()
        assert audit is not None
        assert audit.actor == partner_user

    def test_partner_cannot_edit_submitted_property(
        self, api_client, partner_user, dummy_image
    ):
        api_client.force_authenticate(user=partner_user)
        profile = PartnerProfile.objects.get(user=partner_user)
        prop = Property.objects.create(
            owner=profile,
            title="Submitted Property",
            society_name="ACE Divino",
            super_area_sqft=Decimal("1000.00"),
            price=Decimal("10000000.00"),
            status=PropertyStatus.PENDING_REVIEW,
        )

        res = api_client.patch(
            f"/api/v1/properties/{prop.id}/",
            data={"title": "Unauthorized Modification"},
            format="json",
        )
        assert res.status_code == 400
        assert "Only DRAFT or REJECTED properties can be edited" in str(
            res.json()["error"]["details"]
        )

    def test_admin_approve_property(self, api_client, admin_user, partner_user):
        api_client.force_authenticate(user=admin_user)
        profile = PartnerProfile.objects.get(user=partner_user)
        prop = Property.objects.create(
            owner=profile,
            title="Pending Review Unit",
            society_name="Gaur City",
            super_area_sqft=Decimal("855.00"),
            price=Decimal("7900000.00"),
            status=PropertyStatus.PENDING_REVIEW,
        )

        res = api_client.post(
            f"/api/v1/admin/properties/{prop.id}/review/",
            data={"decision": PropertyStatus.APPROVED},
            format="json",
        )
        assert res.status_code == 200
        prop.refresh_from_db()
        assert prop.status == PropertyStatus.APPROVED
        assert prop.reviewed_by == admin_user
        assert prop.reviewed_at is not None

        audit = AuditLog.objects.filter(
            action="PROPERTY_APPROVED", target_id=str(prop.id)
        ).first()
        assert audit is not None
        assert audit.actor == admin_user

    def test_admin_reject_property_requires_reason(
        self, api_client, admin_user, partner_user
    ):
        api_client.force_authenticate(user=admin_user)
        profile = PartnerProfile.objects.get(user=partner_user)
        prop = Property.objects.create(
            owner=profile,
            title="Pending Review Unit 2",
            society_name="Gaur City",
            price=Decimal("7900000.00"),
            status=PropertyStatus.PENDING_REVIEW,
        )

        # Without reason fails
        res_fail = api_client.post(
            f"/api/v1/admin/properties/{prop.id}/review/",
            data={"decision": PropertyStatus.REJECTED, "rejection_reason": ""},
            format="json",
        )
        assert res_fail.status_code == 400
        assert "Rejection reason is required" in str(
            res_fail.json()["error"]["details"]
        )

        # With reason succeeds
        res_ok = api_client.post(
            f"/api/v1/admin/properties/{prop.id}/review/",
            data={
                "decision": PropertyStatus.REJECTED,
                "rejection_reason": "Incomplete registry documents provided.",
            },
            format="json",
        )
        assert res_ok.status_code == 200
        prop.refresh_from_db()
        assert prop.status == PropertyStatus.REJECTED
        assert prop.rejection_reason == "Incomplete registry documents provided."
