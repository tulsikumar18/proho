"""
Tests for buyer leads, 60-day referral attribution lock-in, and property sharing tokens.
"""

from datetime import timedelta
from decimal import Decimal
import pytest
from django.utils import timezone
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.partners.models import PartnerProfile, KycStatus
from apps.properties.models import Property, PropertyStatus, BhkType
from apps.leads.models import Lead, LeadStatus, ReferralToken
from apps.audit.models import AuditLog


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def partner_user_a(db):
    user = User.objects.create_user(
        phone="+919876543210",
        role=User.Role.CHANNEL_PARTNER,
    )
    profile, _ = PartnerProfile.objects.get_or_create(user=user)
    profile.business_name = "Agency Alpha"
    profile.kyc_status = KycStatus.APPROVED
    profile.save()
    return user


@pytest.fixture
def partner_user_b(db):
    user = User.objects.create_user(
        phone="+919876543211",
        role=User.Role.CHANNEL_PARTNER,
    )
    profile, _ = PartnerProfile.objects.get_or_create(user=user)
    profile.business_name = "Brokers Beta"
    profile.kyc_status = KycStatus.APPROVED
    profile.save()
    return user


@pytest.fixture
def admin_user(db):
    return User.objects.create_superuser(
        phone="+919876543299",
        role=User.Role.ADMIN,
    )


@pytest.fixture
def sample_property(db, partner_user_a):
    return Property.objects.create(
        owner=partner_user_a.partner_profile,
        title="Gaur 14th Avenue - 2 BHK High Floor",
        society_name="Gaur City 2",
        tower="Tower A",
        unit_number="1204",
        city="Greater Noida West",
        bhk_type=BhkType.BHK_2,
        super_area_sqft=Decimal("1050.00"),
        price=Decimal("6500000.00"),
        status=PropertyStatus.APPROVED,
    )


@pytest.mark.django_db
class TestLeadRegistrationAndAttribution:
    """Tests lead creation, phone normalization, and 60-day attribution lock-in."""

    def test_partner_registers_new_lead(self, api_client, partner_user_a):
        api_client.force_authenticate(user=partner_user_a)
        payload = {
            "customer_name": "Rohan Sharma",
            "customer_phone": "9876500001",
            "customer_email": "rohan@example.com",
            "budget_min": "6000000.00",
            "budget_max": "7500000.00",
            "preferred_bhk": "2BHK",
            "preferred_location": "Greater Noida West",
        }
        response = api_client.post("/api/v1/leads/", payload, format="json")
        assert response.status_code == 201
        data = response.data["data"]
        assert data["customer_name"] == "Rohan Sharma"
        assert data["customer_phone"] == "9876500001"
        assert data["status"] == "ACTIVE"
        assert data["is_attribution_active"] is True

        # Verify audit log
        assert AuditLog.objects.filter(
            action="LEAD_CREATED", actor=partner_user_a
        ).exists()

    def test_duplicate_lead_prevention_across_partners(
        self, api_client, partner_user_a, partner_user_b
    ):
        # Partner A registers customer
        api_client.force_authenticate(user=partner_user_a)
        payload = {
            "customer_name": "Priya Verma",
            "customer_phone": "+91 98765 00002",
        }
        res_a = api_client.post("/api/v1/leads/", payload, format="json")
        assert res_a.status_code == 201

        # Partner B attempts to register the same phone number within 60 days
        api_client.force_authenticate(user=partner_user_b)
        payload_b = {
            "customer_name": "Priya V.",
            "customer_phone": "09876500002",  # Different format, same 10 digits
        }
        res_b = api_client.post("/api/v1/leads/", payload_b, format="json")
        assert res_b.status_code == 400
        assert "already actively registered" in str(res_b.data)
        # Verify partner identity is NOT disclosed in error
        assert "partner_user_a" not in str(res_b.data)
        assert "Agency Alpha" not in str(res_b.data)

    def test_same_partner_can_update_their_own_lead(self, api_client, partner_user_a):
        api_client.force_authenticate(user=partner_user_a)
        payload1 = {
            "customer_name": "Anil Gupta",
            "customer_phone": "9876500003",
            "notes": "First inquiry",
        }
        res1 = api_client.post("/api/v1/leads/", payload1, format="json")
        assert res1.status_code == 201

        payload2 = {
            "customer_name": "Anil Gupta",
            "customer_phone": "9876500003",
            "notes": "Updated budget and preferences",
            "budget_max": "8000000.00",
        }
        res2 = api_client.post("/api/v1/leads/", payload2, format="json")
        assert res2.status_code == 201
        assert res2.data["data"]["notes"] == "Updated budget and preferences"
        assert Lead.objects.filter(customer_phone="9876500003").count() == 1

    def test_re_registration_allowed_after_cooling_off_period(
        self, api_client, partner_user_a, partner_user_b
    ):
        # Partner A registered customer 65 days ago (expired attribution)
        past_date = timezone.now() - timedelta(days=65)
        _ = Lead.objects.create(
            partner=partner_user_a.partner_profile,
            customer_name="Sunil Mehta",
            customer_phone="9876500004",
            status=LeadStatus.EXPIRED,
            attribution_expires_at=past_date,
        )

        # Partner B can now register this customer
        api_client.force_authenticate(user=partner_user_b)
        payload = {
            "customer_name": "Sunil Mehta",
            "customer_phone": "9876500004",
        }
        res = api_client.post("/api/v1/leads/", payload, format="json")
        assert res.status_code == 201
        assert str(res.data["data"]["partner"]) == str(
            partner_user_b.partner_profile.id
        )

    def test_partner_isolation_for_leads(
        self, api_client, partner_user_a, partner_user_b
    ):
        # Create lead for partner A
        lead_a = Lead.objects.create(
            partner=partner_user_a.partner_profile,
            customer_name="Secret Client",
            customer_phone="9876500005",
            attribution_expires_at=timezone.now() + timedelta(days=60),
        )

        # Partner B cannot view or modify partner A's lead
        api_client.force_authenticate(user=partner_user_b)
        res_get = api_client.get(f"/api/v1/leads/{lead_a.id}/")
        assert res_get.status_code in [403, 404]

        res_patch = api_client.patch(
            f"/api/v1/leads/{lead_a.id}/", {"notes": "Hacked"}, format="json"
        )
        assert res_patch.status_code in [403, 404]


@pytest.mark.django_db
class TestReferralSharingTokens:
    """Tests referral link token creation and safe public resolution."""

    def test_generate_referral_token_for_approved_property(
        self, api_client, partner_user_a, sample_property
    ):
        api_client.force_authenticate(user=partner_user_a)
        payload = {"property_id": str(sample_property.id), "expires_in_days": 15}
        res = api_client.post("/api/v1/leads/share-property/", payload, format="json")
        assert res.status_code == 201
        data = res.data["data"]
        assert "token" in data
        assert "share_url" in data
        assert str(data["property"]) == str(sample_property.id)

    def test_referral_token_fails_for_draft_property(self, api_client, partner_user_a):
        draft_prop = Property.objects.create(
            owner=partner_user_a.partner_profile,
            title="Draft Listing",
            society_name="Unapproved Heights",
            price=Decimal("4000000.00"),
            status=PropertyStatus.DRAFT,
        )
        api_client.force_authenticate(user=partner_user_a)
        payload = {"property_id": str(draft_prop.id)}
        res = api_client.post("/api/v1/leads/share-property/", payload, format="json")
        assert res.status_code == 400
        assert "approved properties" in str(res.data).lower()

    def test_public_token_resolution_masks_sensitive_details(
        self, api_client, partner_user_a, sample_property
    ):
        # Create token
        token_obj = ReferralToken.objects.create(
            partner=partner_user_a.partner_profile,
            property=sample_property,
            token="secure_test_token_12345",
            expires_at=timezone.now() + timedelta(days=30),
        )

        # Unauthenticated public request
        res = api_client.get(f"/api/v1/leads/referral-token/{token_obj.token}/")
        assert res.status_code == 200
        data = res.data["data"]
        assert data["referring_partner"]["business_name"] == "Agency Alpha"
        assert data["property"]["title"] == "Gaur 14th Avenue - 2 BHK High Floor"
        assert data["property"]["society_name"] == "Gaur City 2"
        # Unit number must be masked / NOT disclosed in public resolution
        assert "unit_number" not in data["property"]
        assert "1204" not in str(data)
