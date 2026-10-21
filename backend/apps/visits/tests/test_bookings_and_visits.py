"""
Tests for property bookings, scheduled site visits, and OTP verification.
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
from apps.visits.models import Booking, BookingStatus, Visit, VisitStatus, VisitOtp
from apps.visits.services import VisitService


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def partner_user_a(db):
    user = User.objects.create_user(
        phone="+919876543230",
        role=User.Role.CHANNEL_PARTNER,
    )
    profile, _ = PartnerProfile.objects.get_or_create(user=user)
    profile.business_name = "Apex Realty"
    profile.kyc_status = KycStatus.APPROVED
    profile.save()
    return user


@pytest.fixture
def unverified_partner_user(db):
    user = User.objects.create_user(
        phone="+919876543231",
        role=User.Role.CHANNEL_PARTNER,
    )
    profile, _ = PartnerProfile.objects.get_or_create(user=user)
    profile.business_name = "Newbie Brokers"
    profile.kyc_status = KycStatus.PENDING  # Not approved!
    profile.save()
    return user


@pytest.fixture
def partner_user_b(db):
    user = User.objects.create_user(
        phone="+919876543232",
        role=User.Role.CHANNEL_PARTNER,
    )
    profile, _ = PartnerProfile.objects.get_or_create(user=user)
    profile.business_name = "Beacon Properties"
    profile.kyc_status = KycStatus.APPROVED
    profile.save()
    return user


@pytest.fixture
def admin_user(db):
    return User.objects.create_superuser(
        phone="+919876543297",
        role=User.Role.ADMIN,
    )


@pytest.fixture
def sample_property(db, partner_user_a):
    return Property.objects.create(
        owner=partner_user_a.partner_profile,
        title="Gaur City 1 - 2 BHK",
        society_name="Gaur City 1",
        city="Greater Noida West",
        bhk_type=BhkType.BHK_2,
        super_area_sqft=Decimal("950.00"),
        price=Decimal("5500000.00"),
        status=PropertyStatus.APPROVED,
    )


@pytest.fixture
def sample_lead(db, partner_user_a, sample_property):
    return Lead.objects.create(
        partner=partner_user_a.partner_profile,
        customer_name="Deepak Joshi",
        customer_phone="9876543233",
        property=sample_property,
        attribution_expires_at=timezone.now() + timedelta(days=60),
    )


@pytest.mark.django_db
class TestBookings:
    """Tests booking creation, admin confirmation, and cancellation."""

    def test_create_booking_request(
        self, api_client, partner_user_a, sample_property, sample_lead
    ):
        api_client.force_authenticate(user=partner_user_a)
        payload = {
            "property_id": str(sample_property.id),
            "lead_id": str(sample_lead.id),
            "notes": "Client requested weekend slot.",
        }
        res = api_client.post("/api/v1/bookings/", payload, format="json")
        assert res.status_code == 201
        data = res.data["data"]
        assert data["status"] == "REQUESTED"
        assert data["customer_name"] == "Deepak Joshi"

    def test_admin_confirms_booking(
        self, api_client, admin_user, partner_user_a, sample_property, sample_lead
    ):
        booking = Booking.objects.create(
            property=sample_property,
            lead=sample_lead,
            partner=partner_user_a.partner_profile,
            status=BookingStatus.REQUESTED,
        )
        api_client.force_authenticate(user=admin_user)
        res = api_client.post(f"/api/v1/bookings/{booking.id}/confirm/")
        assert res.status_code == 200
        booking.refresh_from_db()
        assert booking.status == BookingStatus.CONFIRMED


@pytest.mark.django_db
class TestVisitsAndScheduling:
    """Tests visit slot scheduling, operating hours, concurrency, and cancellations."""

    def test_unverified_kyc_partner_cannot_schedule_visit(
        self, api_client, unverified_partner_user, sample_property
    ):
        # Create lead for unverified partner
        lead = Lead.objects.create(
            partner=unverified_partner_user.partner_profile,
            customer_name="Test Buyer",
            customer_phone="9876543234",
            attribution_expires_at=timezone.now() + timedelta(days=60),
        )
        tomorrow = timezone.now() + timedelta(days=1)
        start = tomorrow.replace(hour=11, minute=0, second=0, microsecond=0)
        end = start + timedelta(hours=1)

        api_client.force_authenticate(user=unverified_partner_user)
        payload = {
            "property_id": str(sample_property.id),
            "lead_id": str(lead.id),
            "scheduled_start": start.isoformat(),
            "scheduled_end": end.isoformat(),
        }
        res = api_client.post("/api/v1/visits/", payload, format="json")
        assert res.status_code == 400
        assert "kyc must be approved" in str(res.data).lower()

    def test_schedule_visit_operating_hours(
        self, api_client, partner_user_a, sample_property, sample_lead
    ):
        tomorrow = timezone.now() + timedelta(days=1)
        # Attempt to schedule visit at 06:00 AM (outside 09:00 AM - 07:00 PM)
        early_start = tomorrow.replace(hour=6, minute=0, second=0, microsecond=0)
        early_end = early_start + timedelta(hours=1)

        api_client.force_authenticate(user=partner_user_a)
        payload = {
            "property_id": str(sample_property.id),
            "lead_id": str(sample_lead.id),
            "scheduled_start": early_start.isoformat(),
            "scheduled_end": early_end.isoformat(),
        }
        res = api_client.post("/api/v1/visits/", payload, format="json")
        assert res.status_code == 400
        assert "09:00 am and 07:00 pm" in str(res.data).lower()

    def test_schedule_visit_concurrency_lockout(
        self, api_client, partner_user_a, partner_user_b, sample_property, sample_lead
    ):
        tomorrow = timezone.now() + timedelta(days=1)
        slot_start = tomorrow.replace(hour=14, minute=0, second=0, microsecond=0)
        slot_end = slot_start + timedelta(hours=1)

        # Partner A books 2:00 PM - 3:00 PM
        api_client.force_authenticate(user=partner_user_a)
        payload = {
            "property_id": str(sample_property.id),
            "lead_id": str(sample_lead.id),
            "scheduled_start": slot_start.isoformat(),
            "scheduled_end": slot_end.isoformat(),
        }
        res1 = api_client.post("/api/v1/visits/", payload, format="json")
        assert res1.status_code == 201

        # Partner B creates lead and attempts to book overlapping slot (2:30 - 3:30)
        lead_b = Lead.objects.create(
            partner=partner_user_b.partner_profile,
            customer_name="Buyer Two",
            customer_phone="9876543235",
            attribution_expires_at=timezone.now() + timedelta(days=60),
        )
        overlap_start = slot_start + timedelta(minutes=30)
        overlap_end = overlap_start + timedelta(hours=1)

        api_client.force_authenticate(user=partner_user_b)
        payload_b = {
            "property_id": str(sample_property.id),
            "lead_id": str(lead_b.id),
            "scheduled_start": overlap_start.isoformat(),
            "scheduled_end": overlap_end.isoformat(),
        }
        res2 = api_client.post("/api/v1/visits/", payload_b, format="json")
        assert res2.status_code == 400
        assert "already has an active visit" in str(res2.data)

    def test_visit_cancellation_rules(
        self, api_client, partner_user_a, sample_property, sample_lead
    ):
        # Schedule visit in 5 hours (cancellation permitted > 2 hours)
        start_time = timezone.now() + timedelta(hours=5)
        end_time = start_time + timedelta(hours=1)
        visit = Visit.objects.create(
            property=sample_property,
            lead=sample_lead,
            partner=partner_user_a.partner_profile,
            scheduled_start=start_time,
            scheduled_end=end_time,
            status=VisitStatus.SCHEDULED,
        )

        api_client.force_authenticate(user=partner_user_a)
        res = api_client.post(
            f"/api/v1/visits/{visit.id}/cancel/",
            {"reason": "Client unavailable due to rain."},
            format="json",
        )
        assert res.status_code == 200
        visit.refresh_from_db()
        assert visit.status == VisitStatus.CANCELLED
        assert visit.cancellation_reason == "Client unavailable due to rain."


@pytest.mark.django_db
class TestVisitOtpVerification:
    """
    Tests visit OTP generation, expiry, brute-force safeguards, and replay protection.
    """

    def test_otp_generation_and_successful_verification(
        self, api_client, partner_user_a, sample_property, sample_lead
    ):
        start_time = timezone.now() + timedelta(minutes=30)
        end_time = start_time + timedelta(hours=1)
        visit = Visit.objects.create(
            property=sample_property,
            lead=sample_lead,
            partner=partner_user_a.partner_profile,
            scheduled_start=start_time,
            scheduled_end=end_time,
            status=VisitStatus.SCHEDULED,
        )

        # Generate OTP
        api_client.force_authenticate(user=partner_user_a)
        res_otp = api_client.post(f"/api/v1/visits/{visit.id}/request-otp/")
        assert res_otp.status_code == 200
        assert "expires_at" in res_otp.data["data"]

        # In testing/debug mode, raw OTP is returned in response
        raw_otp = res_otp.data["data"]["otp_preview"]
        assert len(raw_otp) == 6

        # Plaintext OTP is NEVER stored in database
        otp_record = VisitOtp.objects.get(visit=visit)
        assert otp_record.otp_hash != raw_otp
        assert len(otp_record.salt) == 32

        # Verify OTP at door
        res_verify = api_client.post(
            f"/api/v1/visits/{visit.id}/verify-otp/",
            {"otp": raw_otp},
            format="json",
        )
        assert res_verify.status_code == 200
        assert "verified and completed" in str(res_verify.data)

        visit.refresh_from_db()
        assert visit.status == VisitStatus.VERIFIED_COMPLETED

        otp_record.refresh_from_db()
        assert otp_record.is_consumed is True
        assert otp_record.consumed_at is not None

        # Verify lead attribution extended
        sample_lead.refresh_from_db()
        assert sample_lead.status == LeadStatus.VISITING
        assert sample_lead.attribution_expires_at > timezone.now() + timedelta(days=58)

    def test_otp_brute_force_protection_max_3_attempts(
        self, api_client, partner_user_a, sample_property, sample_lead
    ):
        start_time = timezone.now() + timedelta(minutes=30)
        end_time = start_time + timedelta(hours=1)
        visit = Visit.objects.create(
            property=sample_property,
            lead=sample_lead,
            partner=partner_user_a.partner_profile,
            scheduled_start=start_time,
            scheduled_end=end_time,
            status=VisitStatus.SCHEDULED,
        )

        # Generate OTP via service
        otp_obj, raw_otp = VisitService.generate_visit_otp(visit)

        api_client.force_authenticate(user=partner_user_a)

        # Attempt 1: Wrong OTP
        res1 = api_client.post(
            f"/api/v1/visits/{visit.id}/verify-otp/",
            {"otp": "000000"},
            format="json",
        )
        assert res1.status_code == 400
        assert "Attempt 1 of 3" in str(res1.data)

        # Attempt 2: Wrong OTP
        res2 = api_client.post(
            f"/api/v1/visits/{visit.id}/verify-otp/",
            {"otp": "111111"},
            format="json",
        )
        assert res2.status_code == 400
        assert "Attempt 2 of 3" in str(res2.data)

        # Attempt 3: Wrong OTP -> Fails visit
        res3 = api_client.post(
            f"/api/v1/visits/{visit.id}/verify-otp/",
            {"otp": "222222"},
            format="json",
        )
        assert res3.status_code == 400

        visit.refresh_from_db()
        assert visit.status == VisitStatus.FAILED_VERIFICATION

    def test_otp_replay_protection(
        self, api_client, partner_user_a, sample_property, sample_lead
    ):
        start_time = timezone.now() + timedelta(minutes=30)
        end_time = start_time + timedelta(hours=1)
        visit = Visit.objects.create(
            property=sample_property,
            lead=sample_lead,
            partner=partner_user_a.partner_profile,
            scheduled_start=start_time,
            scheduled_end=end_time,
            status=VisitStatus.SCHEDULED,
        )
        otp_obj, raw_otp = VisitService.generate_visit_otp(visit)

        # First verification succeeds
        VisitService.verify_visit_otp(visit, raw_otp)

        # Second verification attempt fails
        api_client.force_authenticate(user=partner_user_a)
        res = api_client.post(
            f"/api/v1/visits/{visit.id}/verify-otp/",
            {"otp": raw_otp},
            format="json",
        )
        assert res.status_code == 400
        assert (
            "cannot be verified" in str(res.data).lower()
            or "already" in str(res.data).lower()
        )
