"""
Service layer for property bookings, scheduled site visits, and OTP verification.
"""

import hashlib
import secrets
from datetime import timedelta
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError, PermissionDenied
from apps.audit.services import AuditService
from apps.partners.models import PartnerProfile, KycStatus
from apps.properties.models import Property, PropertyStatus
from apps.leads.models import Lead, LeadStatus
from apps.offers.models import Offer
from .models import Booking, BookingStatus, Visit, VisitStatus, VisitOtp


class BookingService:
    """Encapsulates business operations for property bookings."""

    @classmethod
    def create_booking(
        cls,
        partner_profile: PartnerProfile,
        property_obj: Property,
        lead: Lead,
        offer: Offer = None,
        notes: str = "",
        user=None,
        ip_address: str = None,
    ) -> Booking:
        """Creates a new property reservation request."""
        is_admin = getattr(user, "is_admin", False) or (user and user.is_staff)
        if not is_admin and lead.partner_id != partner_profile.id:
            raise PermissionDenied(
                "Cannot create a booking for another partner's lead."
            )

        if property_obj.status != PropertyStatus.APPROVED:
            raise ValidationError(
                {"property": ["Bookings can only be created on approved properties."]}
            )

        booking = Booking.objects.create(
            property=property_obj,
            lead=lead,
            partner=partner_profile,
            offer=offer,
            notes=notes,
            status=BookingStatus.REQUESTED,
        )

        AuditService.record_action(
            action="BOOKING_CREATED",
            target_model="Booking",
            target_id=str(booking.id),
            actor=user or partner_profile.user,
            ip_address=ip_address,
            metadata={
                "property_id": str(property_obj.id),
                "lead_id": str(lead.id),
            },
        )
        return booking

    @classmethod
    def confirm_booking(cls, booking: Booking, user, ip_address: str = None) -> Booking:
        """Confirms a requested booking (admin only)."""
        if not (getattr(user, "is_admin", False) or user.is_staff):
            raise PermissionDenied("Only administrators can confirm booking requests.")

        booking.status = BookingStatus.CONFIRMED
        booking.save(update_fields=["status", "updated_at"])

        AuditService.record_action(
            action="BOOKING_CONFIRMED",
            target_model="Booking",
            target_id=str(booking.id),
            actor=user,
            ip_address=ip_address,
        )
        return booking

    @classmethod
    def cancel_booking(
        cls, booking: Booking, reason: str, user, ip_address: str = None
    ) -> Booking:
        """Cancels a booking with reason."""
        is_admin = getattr(user, "is_admin", False) or user.is_staff
        if not is_admin and booking.partner.user != user:
            raise PermissionDenied("You do not have access to cancel this booking.")

        booking.status = BookingStatus.CANCELLED
        booking.cancellation_reason = reason
        booking.save(update_fields=["status", "cancellation_reason", "updated_at"])

        AuditService.record_action(
            action="BOOKING_CANCELLED",
            target_model="Booking",
            target_id=str(booking.id),
            actor=user,
            ip_address=ip_address,
            metadata={"cancellation_reason": reason},
        )
        return booking


class VisitService:
    """Encapsulates visit scheduling, concurrency, and door OTP verification."""

    @classmethod
    def schedule_visit(
        cls,
        partner_profile: PartnerProfile,
        property_obj: Property,
        lead: Lead,
        scheduled_start,
        scheduled_end,
        booking: Booking = None,
        assigned_rep=None,
        user=None,
        ip_address: str = None,
    ) -> Visit:
        """Schedules a property visit slot after validating KYC and slot collision."""
        # 1. Partner KYC must be APPROVED
        if partner_profile.kyc_status != KycStatus.APPROVED:
            raise ValidationError(
                {
                    "kyc": [
                        (
                            "Partner KYC must be approved before "
                            "scheduling property visits."
                        )
                    ]
                }
            )

        # 2. Property must be in APPROVED status
        if property_obj.status != PropertyStatus.APPROVED:
            raise ValidationError(
                {"property": ["Visits can only be scheduled on approved properties."]}
            )

        # 3. Ownership / authorization
        is_admin = getattr(user, "is_admin", False) or (user and user.is_staff)
        if not is_admin and lead.partner_id != partner_profile.id:
            raise PermissionDenied(
                "Cannot schedule a visit for another partner's lead."
            )

        # 4. Slot timing validation
        now = timezone.now()
        if scheduled_start < now:
            raise ValidationError(
                {"scheduled_start": ["Visit slot cannot be scheduled in the past."]}
            )
        if scheduled_end <= scheduled_start:
            raise ValidationError(
                {"scheduled_end": ["Visit end time must be after start time."]}
            )

        # 5. Operating hours: 09:00 AM to 07:00 PM
        start_hour = scheduled_start.hour
        end_hour = scheduled_end.hour
        if start_hour < 9 or (
            end_hour > 19 or (end_hour == 19 and scheduled_end.minute > 0)
        ):
            raise ValidationError(
                {
                    "time_slot": [
                        "Visits can only be scheduled between 09:00 AM and 07:00 PM."
                    ]
                }
            )

        # 6. Concurrency check: lockout overlapping visits for the same unit
        overlap = Visit.objects.filter(
            property=property_obj,
            status=VisitStatus.SCHEDULED,
            scheduled_start__lt=scheduled_end,
            scheduled_end__gt=scheduled_start,
        ).exists()

        if overlap:
            raise ValidationError(
                {
                    "time_slot": [
                        (
                            "This unit already has an active visit scheduled "
                            "for the selected time slot."
                        )
                    ]
                }
            )

        with transaction.atomic():
            visit = Visit.objects.create(
                property=property_obj,
                lead=lead,
                partner=partner_profile,
                booking=booking,
                scheduled_start=scheduled_start,
                scheduled_end=scheduled_end,
                assigned_representative=assigned_rep,
                status=VisitStatus.SCHEDULED,
            )

            # Advance lead lifecycle to VISITING if currently ACTIVE
            if lead.status == LeadStatus.ACTIVE:
                lead.status = LeadStatus.VISITING
                lead.save(update_fields=["status", "updated_at"])

        AuditService.record_action(
            action="VISIT_SCHEDULED",
            target_model="Visit",
            target_id=str(visit.id),
            actor=user or partner_profile.user,
            ip_address=ip_address,
            metadata={
                "property_id": str(property_obj.id),
                "lead_id": str(lead.id),
                "scheduled_start": scheduled_start.isoformat(),
            },
        )
        return visit

    @classmethod
    def cancel_visit(
        cls, visit: Visit, reason: str, user, ip_address: str = None
    ) -> Visit:
        """Cancels a scheduled visit."""
        is_admin = getattr(user, "is_admin", False) or user.is_staff
        if not is_admin and visit.partner.user != user:
            raise PermissionDenied("You do not have access to cancel this visit.")

        if visit.status != VisitStatus.SCHEDULED:
            raise ValidationError(
                {"status": [f"Cannot cancel visit in status '{visit.status}'."]}
            )

        if not is_admin:
            # Check 2-hour cutoff
            time_until_visit = visit.scheduled_start - timezone.now()
            if time_until_visit < timedelta(hours=2):
                raise ValidationError(
                    {
                        "cancellation": [
                            (
                                "Visits can only be cancelled up to 2 hours "
                                "before the scheduled slot."
                            )
                        ]
                    }
                )

        visit.status = VisitStatus.CANCELLED
        visit.cancellation_reason = reason
        visit.save(update_fields=["status", "cancellation_reason", "updated_at"])

        AuditService.record_action(
            action="VISIT_CANCELLED",
            target_model="Visit",
            target_id=str(visit.id),
            actor=user,
            ip_address=ip_address,
            metadata={"reason": reason},
        )
        return visit

    @classmethod
    def reschedule_visit(
        cls,
        visit: Visit,
        new_start,
        new_end,
        reason: str,
        user,
        ip_address: str = None,
    ) -> Visit:
        """Reschedules a scheduled visit to a new slot."""
        is_admin = getattr(user, "is_admin", False) or user.is_staff
        if not is_admin and visit.partner.user != user:
            raise PermissionDenied("You do not have access to reschedule this visit.")

        if visit.status != VisitStatus.SCHEDULED:
            raise ValidationError(
                {"status": [f"Cannot reschedule visit in status '{visit.status}'."]}
            )

        if not is_admin:
            if (visit.scheduled_start - timezone.now()) < timedelta(hours=2):
                raise ValidationError(
                    {
                        "reschedule": [
                            (
                                "Visits can only be rescheduled up to 2 hours "
                                "before the scheduled slot."
                            )
                        ]
                    }
                )

        if new_start < timezone.now():
            raise ValidationError({"new_start": ["New slot cannot be in the past."]})
        if new_end <= new_start:
            raise ValidationError(
                {"new_end": ["New end time must be after start time."]}
            )

        # Check concurrency excluding current visit
        overlap = (
            Visit.objects.filter(
                property=visit.property,
                status=VisitStatus.SCHEDULED,
                scheduled_start__lt=new_end,
                scheduled_end__gt=new_start,
            )
            .exclude(pk=visit.pk)
            .exists()
        )

        if overlap:
            raise ValidationError(
                {
                    "time_slot": [
                        "Selected time slot is already booked for this property."
                    ]
                }
            )

        with transaction.atomic():
            visit.scheduled_start = new_start
            visit.scheduled_end = new_end
            visit.cancellation_reason = reason
            visit.save(
                update_fields=[
                    "scheduled_start",
                    "scheduled_end",
                    "cancellation_reason",
                    "updated_at",
                ]
            )
            # Invalidate any existing OTP
            VisitOtp.objects.filter(visit=visit).delete()

        AuditService.record_action(
            action="VISIT_RESCHEDULED",
            target_model="Visit",
            target_id=str(visit.id),
            actor=user,
            ip_address=ip_address,
            metadata={"new_start": new_start.isoformat(), "reason": reason},
        )
        return visit

    @classmethod
    def generate_visit_otp(
        cls, visit: Visit, user=None, ip_address: str = None
    ) -> tuple[VisitOtp, str]:
        """
        Generates a cryptographically secure 6-digit visit OTP and
        stores its salted hash.
        """
        if visit.status != VisitStatus.SCHEDULED:
            raise ValidationError(
                {
                    "status": [
                        f"Cannot generate OTP for visit in status '{visit.status}'."
                    ]
                }
            )

        is_admin = getattr(user, "is_admin", False) or (user and user.is_staff)
        # Check window: must be within 1 hour before scheduled start or during slot
        now = timezone.now()
        one_hour_before = visit.scheduled_start - timedelta(hours=1)
        if not is_admin and not settings.DEBUG:
            if now < one_hour_before or now > visit.scheduled_end:
                raise ValidationError(
                    {
                        "otp": [
                            (
                                "OTP can only be requested within 1 hour "
                                "of the scheduled visit slot."
                            )
                        ]
                    }
                )

        # Generate cryptographically secure 6-digit code
        raw_otp = f"{secrets.randbelow(900000) + 100000}"
        salt = secrets.token_hex(16)
        otp_hash = hashlib.pbkdf2_hmac(
            "sha256", raw_otp.encode("utf-8"), salt.encode("utf-8"), 100000
        ).hex()

        expiry_seconds = getattr(settings, "OTP_EXPIRY_SECONDS", 300)
        expires_at = now + timedelta(seconds=expiry_seconds)

        with transaction.atomic():
            otp_obj, _ = VisitOtp.objects.update_or_create(
                visit=visit,
                defaults={
                    "otp_hash": otp_hash,
                    "salt": salt,
                    "expires_at": expires_at,
                    "attempt_count": 0,
                    "is_consumed": False,
                    "consumed_at": None,
                },
            )

        AuditService.record_action(
            action="VISIT_OTP_REQUESTED",
            target_model="VisitOtp",
            target_id=str(otp_obj.id),
            actor=user or visit.partner.user,
            ip_address=ip_address,
            metadata={"visit_id": str(visit.id)},
        )
        return otp_obj, raw_otp

    @classmethod
    def verify_visit_otp(
        cls, visit: Visit, raw_otp: str, user=None, ip_address: str = None
    ) -> bool:
        """
        Verifies the visit OTP against the salted hash.
        Enforces 300s expiry, max 3 attempts, and one-time consumption.
        """
        if visit.status != VisitStatus.SCHEDULED:
            raise ValidationError(
                {
                    "status": [
                        f"Visit is in status '{visit.status}', cannot be verified."
                    ]
                }
            )

        otp_obj = VisitOtp.objects.filter(visit=visit).first()
        if not otp_obj:
            raise ValidationError({"otp": ["No active OTP found for this visit."]})

        if otp_obj.is_consumed:
            raise ValidationError(
                {"otp": ["This visit OTP has already been verified and consumed."]}
            )

        now = timezone.now()
        if now > otp_obj.expires_at:
            raise ValidationError({"otp": ["Visit OTP has expired."]})

        if otp_obj.attempt_count >= 3:
            visit.status = VisitStatus.FAILED_VERIFICATION
            visit.save(update_fields=["status", "updated_at"])
            raise ValidationError(
                {
                    "otp": [
                        (
                            "Maximum verification attempts exceeded. "
                            "Visit marked as failed."
                        )
                    ]
                }
            )

        # Hash input raw_otp with stored salt
        calculated_hash = hashlib.pbkdf2_hmac(
            "sha256",
            str(raw_otp).strip().encode("utf-8"),
            otp_obj.salt.encode("utf-8"),
            100000,
        ).hex()

        if calculated_hash == otp_obj.otp_hash:
            with transaction.atomic():
                otp_obj.is_consumed = True
                otp_obj.consumed_at = now
                otp_obj.save(update_fields=["is_consumed", "consumed_at"])

                visit.status = VisitStatus.VERIFIED_COMPLETED
                visit.save(update_fields=["status", "updated_at"])

                # Extend lead referral attribution lock-in (60 days) upon verified visit
                lead = visit.lead
                lead.extend_attribution()
                if lead.status in [LeadStatus.ACTIVE, LeadStatus.VISITING]:
                    lead.status = LeadStatus.VISITING
                    lead.save(update_fields=["status", "updated_at"])

            AuditService.record_action(
                action="VISIT_OTP_VERIFIED",
                target_model="Visit",
                target_id=str(visit.id),
                actor=user or visit.partner.user,
                ip_address=ip_address,
                metadata={"lead_id": str(visit.lead.id)},
            )
            return True
        else:
            otp_obj.attempt_count += 1
            otp_obj.save(update_fields=["attempt_count"])

            if otp_obj.attempt_count >= 3:
                visit.status = VisitStatus.FAILED_VERIFICATION
                visit.save(update_fields=["status", "updated_at"])

            AuditService.record_action(
                action="VISIT_OTP_FAILED",
                target_model="Visit",
                target_id=str(visit.id),
                actor=user or visit.partner.user,
                ip_address=ip_address,
                metadata={"attempt_count": otp_obj.attempt_count},
            )
            raise ValidationError(
                {"otp": [f"Invalid OTP entered. Attempt {otp_obj.attempt_count} of 3."]}
            )
