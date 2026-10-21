"""
Tests for property purchase offers, counteroffers, and negotiation lifecycle.
"""

from decimal import Decimal
from datetime import timedelta
import pytest
from django.utils import timezone
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.partners.models import PartnerProfile, KycStatus
from apps.properties.models import Property, PropertyStatus, BhkType
from apps.leads.models import Lead, LeadStatus
from apps.offers.models import Offer, OfferStatus
from apps.audit.models import AuditLog


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def partner_user_a(db):
    user = User.objects.create_user(
        phone="+919876543220",
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
        phone="+919876543221",
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
        phone="+919876543298",
        role=User.Role.ADMIN,
    )


@pytest.fixture
def sample_property(db, partner_user_a):
    return Property.objects.create(
        owner=partner_user_a.partner_profile,
        title="ACE Divino - 3 BHK Luxury",
        society_name="ACE Divino",
        city="Greater Noida West",
        bhk_type=BhkType.BHK_3,
        super_area_sqft=Decimal("1565.00"),
        price=Decimal("11000000.00"),
        status=PropertyStatus.APPROVED,
    )


@pytest.fixture
def sample_lead(db, partner_user_a, sample_property):
    return Lead.objects.create(
        partner=partner_user_a.partner_profile,
        customer_name="Kavita Rao",
        customer_phone="9876543222",
        property=sample_property,
        attribution_expires_at=timezone.now() + timedelta(days=60),
    )


@pytest.mark.django_db
class TestOffersLifecycle:
    """Tests offer drafting, submission, admin evaluation, and counteroffers."""

    def test_partner_creates_draft_offer(
        self, api_client, partner_user_a, sample_property, sample_lead
    ):
        api_client.force_authenticate(user=partner_user_a)
        payload = {
            "property_id": str(sample_property.id),
            "lead_id": str(sample_lead.id),
            "amount": "10500000.00",
            "notes": "Ready to pay 10% token deposit immediately.",
        }
        response = api_client.post("/api/v1/offers/", payload, format="json")
        assert response.status_code == 201
        data = response.data["data"]
        assert data["amount"] == "10500000.00"
        assert data["status"] == "DRAFT"
        assert data["property_title"] == "ACE Divino - 3 BHK Luxury"

        # Audit log verified
        assert AuditLog.objects.filter(
            action="OFFER_CREATED", actor=partner_user_a
        ).exists()

    def test_offer_fails_for_invalid_amount(
        self, api_client, partner_user_a, sample_property, sample_lead
    ):
        api_client.force_authenticate(user=partner_user_a)
        payload = {
            "property_id": str(sample_property.id),
            "lead_id": str(sample_lead.id),
            "amount": "-500.00",
        }
        response = api_client.post("/api/v1/offers/", payload, format="json")
        assert response.status_code == 400

    def test_partner_submits_draft_offer(
        self, api_client, partner_user_a, sample_property, sample_lead
    ):
        offer = Offer.objects.create(
            property=sample_property,
            lead=sample_lead,
            partner=partner_user_a.partner_profile,
            amount=Decimal("10500000.00"),
            status=OfferStatus.DRAFT,
            created_by=partner_user_a,
        )
        api_client.force_authenticate(user=partner_user_a)
        response = api_client.post(f"/api/v1/offers/{offer.id}/submit/")
        assert response.status_code == 200

        offer.refresh_from_db()
        assert offer.status == OfferStatus.SUBMITTED

        sample_lead.refresh_from_db()
        assert sample_lead.status == LeadStatus.OFFER_MADE

    def test_partner_cannot_directly_approve_offer(
        self, api_client, partner_user_a, sample_property, sample_lead
    ):
        offer = Offer.objects.create(
            property=sample_property,
            lead=sample_lead,
            partner=partner_user_a.partner_profile,
            amount=Decimal("10500000.00"),
            status=OfferStatus.SUBMITTED,
            created_by=partner_user_a,
        )
        api_client.force_authenticate(user=partner_user_a)
        payload = {"decision": "ACCEPTED"}
        response = api_client.post(
            f"/api/v1/offers/{offer.id}/review/", payload, format="json"
        )
        assert response.status_code == 403

    def test_admin_accepts_offer(
        self, api_client, admin_user, partner_user_a, sample_property, sample_lead
    ):
        offer = Offer.objects.create(
            property=sample_property,
            lead=sample_lead,
            partner=partner_user_a.partner_profile,
            amount=Decimal("10500000.00"),
            status=OfferStatus.SUBMITTED,
            created_by=partner_user_a,
        )
        api_client.force_authenticate(user=admin_user)
        payload = {"decision": "ACCEPTED"}
        response = api_client.post(
            f"/api/v1/offers/{offer.id}/review/", payload, format="json"
        )
        assert response.status_code == 200
        offer.refresh_from_db()
        assert offer.status == OfferStatus.ACCEPTED
        assert offer.reviewed_by == admin_user

    def test_admin_rejects_offer_requires_reason(
        self, api_client, admin_user, partner_user_a, sample_property, sample_lead
    ):
        offer = Offer.objects.create(
            property=sample_property,
            lead=sample_lead,
            partner=partner_user_a.partner_profile,
            amount=Decimal("9000000.00"),
            status=OfferStatus.SUBMITTED,
            created_by=partner_user_a,
        )
        api_client.force_authenticate(user=admin_user)

        # Fails without reason
        res_fail = api_client.post(
            f"/api/v1/offers/{offer.id}/review/",
            {"decision": "REJECTED"},
            format="json",
        )
        assert res_fail.status_code == 400

        # Succeeds with reason
        res_ok = api_client.post(
            f"/api/v1/offers/{offer.id}/review/",
            {"decision": "REJECTED", "rejection_reason": "Seller minimum is ₹1.05 Cr."},
            format="json",
        )
        assert res_ok.status_code == 200
        offer.refresh_from_db()
        assert offer.status == OfferStatus.REJECTED
        assert offer.rejection_reason == "Seller minimum is ₹1.05 Cr."

    def test_proposing_counteroffer(
        self, api_client, admin_user, partner_user_a, sample_property, sample_lead
    ):
        originating_offer = Offer.objects.create(
            property=sample_property,
            lead=sample_lead,
            partner=partner_user_a.partner_profile,
            amount=Decimal("10000000.00"),
            status=OfferStatus.SUBMITTED,
            created_by=partner_user_a,
        )
        api_client.force_authenticate(user=admin_user)
        payload = {
            "counter_amount": "10600000.00",
            "notes": "Seller accepts 1.06 Cr if token paid in 48 hours.",
        }
        res = api_client.post(
            f"/api/v1/offers/{originating_offer.id}/counter/", payload, format="json"
        )
        assert res.status_code == 201
        data = res.data["data"]["offer"]
        assert data["amount"] == "10600000.00"
        assert str(data["counter_to"]) == str(originating_offer.id)

        originating_offer.refresh_from_db()
        assert originating_offer.status == OfferStatus.COUNTERED

    def test_partner_isolation_for_offers(
        self, api_client, partner_user_a, partner_user_b, sample_property, sample_lead
    ):
        offer_a = Offer.objects.create(
            property=sample_property,
            lead=sample_lead,
            partner=partner_user_a.partner_profile,
            amount=Decimal("10500000.00"),
            status=OfferStatus.DRAFT,
            created_by=partner_user_a,
        )
        api_client.force_authenticate(user=partner_user_b)
        res = api_client.get(f"/api/v1/offers/{offer_a.id}/")
        assert res.status_code in [403, 404]
