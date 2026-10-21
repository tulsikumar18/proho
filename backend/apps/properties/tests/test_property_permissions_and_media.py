"""
Tests for property authorization, object-level isolation, media uploads,
and inventory discovery.
"""

from decimal import Decimal
import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.partners.models import PartnerProfile
from apps.properties.models import Property, PropertyStatus, BhkType, PropertyMedia


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def partner_a(db):
    return User.objects.create_user(
        phone="+919811188881",
        password="TestPassword123!",
        role=User.Role.CHANNEL_PARTNER,
    )


@pytest.fixture
def partner_b(db):
    return User.objects.create_user(
        phone="+919811188882",
        password="TestPassword123!",
        role=User.Role.CHANNEL_PARTNER,
    )


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        phone="+919822288881",
        password="AdminPassword123!",
        role=User.Role.ADMIN,
        is_staff=True,
    )


@pytest.mark.django_db
class TestPropertyPermissionsAndMedia:
    """
    Verifies RBAC, object-level boundaries, media handling, and selling
    inventory search.
    """

    def test_unauthenticated_request_rejected(self, api_client):
        res = api_client.get("/api/v1/properties/")
        assert res.status_code == 401
        assert res.json()["error"]["code"] == "UNAUTHORIZED"

    def test_partner_cannot_access_another_partners_private_property(
        self, api_client, partner_a, partner_b
    ):
        profile_a = PartnerProfile.objects.get(user=partner_a)
        prop_a = Property.objects.create(
            owner=profile_a,
            title="Partner A Draft",
            society_name="Gaur City",
            price=Decimal("5000000.00"),
            status=PropertyStatus.DRAFT,
        )

        # Partner B attempts to GET Partner A's draft
        api_client.force_authenticate(user=partner_b)
        res = api_client.get(f"/api/v1/properties/{prop_a.id}/")
        assert res.status_code == 403
        assert res.json()["error"]["code"] == "PERMISSION_DENIED"

        # Partner B attempts to PATCH Partner A's draft
        res_patch = api_client.patch(
            f"/api/v1/properties/{prop_a.id}/",
            data={"title": "Hacked Title"},
            format="json",
        )
        assert res_patch.status_code == 403

        # Partner B attempts to DELETE Partner A's draft
        res_del = api_client.delete(f"/api/v1/properties/{prop_a.id}/")
        assert res_del.status_code == 403

    def test_partner_cannot_approve_own_listing(self, api_client, partner_a):
        profile_a = PartnerProfile.objects.get(user=partner_a)
        prop = Property.objects.create(
            owner=profile_a,
            title="Self Approval Attempt",
            society_name="Gaur City",
            price=Decimal("6000000.00"),
            status=PropertyStatus.PENDING_REVIEW,
        )

        api_client.force_authenticate(user=partner_a)
        res = api_client.post(
            f"/api/v1/admin/properties/{prop.id}/review/",
            data={"decision": PropertyStatus.APPROVED},
            format="json",
        )
        assert res.status_code == 403
        assert res.json()["error"]["code"] == "PERMISSION_DENIED"

    def test_media_upload_valid_image(self, api_client, partner_a):
        api_client.force_authenticate(user=partner_a)
        profile_a = PartnerProfile.objects.get(user=partner_a)
        prop = Property.objects.create(
            owner=profile_a,
            title="Unit with Media",
            society_name="ACE Divino",
            price=Decimal("17800000.00"),
        )

        image_file = SimpleUploadedFile(
            "bedroom.webp", b"dummy webp bytes", content_type="image/webp"
        )
        res = api_client.post(
            f"/api/v1/properties/{prop.id}/media/",
            data={
                "file": image_file,
                "media_type": "IMAGE",
                "caption": "Master Bedroom",
                "is_cover": "true",
            },
            format="multipart",
        )
        assert res.status_code == 201
        data = res.json()["data"]
        assert data["caption"] == "Master Bedroom"
        assert data["is_cover"] is True

        media_item = PropertyMedia.objects.get(pk=data["id"])
        assert media_item.is_cover is True
        assert media_item.property == prop

    def test_media_upload_unsupported_extension_rejected(self, api_client, partner_a):
        api_client.force_authenticate(user=partner_a)
        profile_a = PartnerProfile.objects.get(user=partner_a)
        prop = Property.objects.create(
            owner=profile_a,
            title="Unit with Invalid Media",
            society_name="ACE Divino",
            price=Decimal("17800000.00"),
        )

        bad_file = SimpleUploadedFile(
            "script.py", b"print('malicious')", content_type="text/x-python"
        )
        res = api_client.post(
            f"/api/v1/properties/{prop.id}/media/",
            data={"file": bad_file, "media_type": "IMAGE"},
            format="multipart",
        )
        assert res.status_code == 400
        assert "Only JPG, PNG, and WebP images are allowed" in str(
            res.json()["error"]["details"]
        )

    def test_media_upload_oversized_file_rejected(self, api_client, partner_a):
        api_client.force_authenticate(user=partner_a)
        profile_a = PartnerProfile.objects.get(user=partner_a)
        prop = Property.objects.create(
            owner=profile_a,
            title="Unit with Huge Media",
            society_name="ACE Divino",
            price=Decimal("17800000.00"),
        )

        # 11MB file (limit is 10MB)
        huge_file = SimpleUploadedFile(
            "huge.jpg", b"0" * (11 * 1024 * 1024), content_type="image/jpeg"
        )
        res = api_client.post(
            f"/api/v1/properties/{prop.id}/media/",
            data={"file": huge_file, "media_type": "IMAGE"},
            format="multipart",
        )
        assert res.status_code == 400
        assert "File size exceeds 10MB limit" in str(res.json()["error"]["details"])

    def test_selling_inventory_search_and_filters(self, api_client, partner_a):
        profile_a = PartnerProfile.objects.get(user=partner_a)

        # Approved unit (should be visible)
        prop_approved = Property.objects.create(
            owner=profile_a,
            title="Gaur 14th Avenue - 2 BHK",
            society_name="Gaur 14th Avenue",
            locality="Gaur City, Greater Noida",
            bhk_type=BhkType.BHK_2,
            super_area_sqft=Decimal("855.00"),
            price=Decimal("7900000.00"),
            status=PropertyStatus.APPROVED,
        )
        # Another approved unit with 3 BHK
        Property.objects.create(
            owner=profile_a,
            title="ACE Divino - 3 BHK",
            society_name="ACE Divino",
            locality="Sector 1, Greater Noida",
            bhk_type=BhkType.BHK_3,
            super_area_sqft=Decimal("1565.00"),
            price=Decimal("17800000.00"),
            status=PropertyStatus.APPROVED,
        )
        # Draft unit (must NEVER appear in public inventory)
        Property.objects.create(
            owner=profile_a,
            title="Secret Draft Unit",
            society_name="Gaur City",
            bhk_type=BhkType.BHK_2,
            price=Decimal("5000000.00"),
            status=PropertyStatus.DRAFT,
        )

        # 1. Query all inventory
        res_all = api_client.get("/api/v1/properties/inventory/")
        assert res_all.status_code == 200
        assert res_all.json()["count"] == 2
        titles = [p["title"] for p in res_all.json()["data"]]
        assert "Secret Draft Unit" not in titles
        assert "Gaur 14th Avenue - 2 BHK" in titles

        # 2. Filter by BHK=3BHK
        res_bhk = api_client.get("/api/v1/properties/inventory/?bhk=3BHK")
        assert res_bhk.status_code == 200
        assert res_bhk.json()["count"] == 1
        assert res_bhk.json()["data"][0]["title"] == "ACE Divino - 3 BHK"

        # 3. Search by text "Gaur"
        res_search = api_client.get("/api/v1/properties/inventory/?search=Gaur")
        assert res_search.status_code == 200
        assert res_search.json()["count"] == 1
        assert res_search.json()["data"][0]["title"] == "Gaur 14th Avenue - 2 BHK"

        # 4. Filter by max price 10000000 (1 Cr)
        res_price = api_client.get("/api/v1/properties/inventory/?max_price=10000000")
        assert res_price.status_code == 200
        assert res_price.json()["count"] == 1
        assert res_price.json()["data"][0]["id"] == str(prop_approved.id)
