"""
Models for property bookings, scheduled site visits, and visit OTP verification.
"""

import uuid
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.partners.models import PartnerProfile
from apps.properties.models import Property
from apps.leads.models import Lead
from apps.offers.models import Offer


class BookingStatus(models.TextChoices):
    REQUESTED = "REQUESTED", _("Requested")
    CONFIRMED = "CONFIRMED", _("Confirmed")
    CANCELLED = "CANCELLED", _("Cancelled")
    COMPLETED = "COMPLETED", _("Completed")
    REJECTED = "REJECTED", _("Rejected")


class Booking(models.Model):
    """
    Property reservation / booking request linking lead, partner, and property.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="bookings",
        help_text=_("Associated property listing."),
    )
    lead = models.ForeignKey(
        Lead,
        on_delete=models.CASCADE,
        related_name="bookings",
        help_text=_("Referred buyer lead."),
    )
    partner = models.ForeignKey(
        PartnerProfile,
        on_delete=models.CASCADE,
        related_name="bookings",
        help_text=_("Channel partner who initiated this booking."),
    )
    offer = models.ForeignKey(
        Offer,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="bookings",
        help_text=_("Optional associated accepted or countered offer."),
    )
    status = models.CharField(
        max_length=30,
        choices=BookingStatus.choices,
        default=BookingStatus.REQUESTED,
        db_index=True,
        help_text=_("Booking status."),
    )
    notes = models.TextField(
        blank=True,
        help_text=_("Booking remarks or special client requests."),
    )
    cancellation_reason = models.TextField(
        blank=True,
        help_text=_("Reason given if booking is cancelled."),
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("booking")
        verbose_name_plural = _("bookings")
        ordering = ["-created_at"]

    def __str__(self):
        return f"Booking {self.id} for {self.property.title} [{self.status}]"


class VisitStatus(models.TextChoices):
    SCHEDULED = "SCHEDULED", _("Scheduled")
    VERIFIED_COMPLETED = "VERIFIED_COMPLETED", _("Verified Completed")
    CANCELLED = "CANCELLED", _("Cancelled")
    NO_SHOW = "NO_SHOW", _("No Show")
    FAILED_VERIFICATION = "FAILED_VERIFICATION", _("Failed Verification")


class Visit(models.Model):
    """
    Scheduled physical property site visit requiring OTP verification at the door.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="visits",
        help_text=_("Associated property listing."),
    )
    lead = models.ForeignKey(
        Lead,
        on_delete=models.CASCADE,
        related_name="visits",
        help_text=_("Referred customer visiting the property."),
    )
    partner = models.ForeignKey(
        PartnerProfile,
        on_delete=models.CASCADE,
        related_name="visits",
        help_text=_("Channel partner conducting or representing the visit."),
    )
    booking = models.ForeignKey(
        Booking,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="visits",
        help_text=_("Optional booking link."),
    )
    scheduled_start = models.DateTimeField(
        db_index=True,
        help_text=_("Visit start time (between 09:00 AM and 07:00 PM)."),
    )
    scheduled_end = models.DateTimeField(
        help_text=_("Visit end time (typically 1-hour slot)."),
    )
    status = models.CharField(
        max_length=30,
        choices=VisitStatus.choices,
        default=VisitStatus.SCHEDULED,
        db_index=True,
        help_text=_("Status of the scheduled visit."),
    )
    assigned_representative = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assigned_visits",
        help_text=_("Proho field executive or site manager assigned to assist."),
    )
    cancellation_reason = models.TextField(
        blank=True,
        help_text=_("Standardized reason if visit was cancelled."),
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("visit")
        verbose_name_plural = _("visits")
        ordering = ["-scheduled_start"]

    def __str__(self):
        return (
            f"Visit to {self.property.title} on {self.scheduled_start} [{self.status}]"
        )


class VisitOtp(models.Model):
    """
    Time-bound, salted hash verification code for site visits.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    visit = models.OneToOneField(
        Visit,
        on_delete=models.CASCADE,
        related_name="otp",
        help_text=_("Visit this OTP authorizes."),
    )
    otp_hash = models.CharField(
        max_length=255,
        help_text=_("Salted PBKDF2/SHA-256 hash of the 6-digit numeric OTP."),
    )
    salt = models.CharField(
        max_length=64,
        help_text=_("Cryptographic salt used during hashing."),
    )
    expires_at = models.DateTimeField(
        db_index=True,
        help_text=_("OTP expiry timestamp (300 seconds from generation)."),
    )
    attempt_count = models.PositiveIntegerField(
        default=0,
        help_text=_("Number of failed verification attempts (max 3)."),
    )
    is_consumed = models.BooleanField(
        default=False,
        help_text=_("Designates whether this OTP has already been used."),
    )
    consumed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("Exact timestamp when verified and consumed."),
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("visit OTP")
        verbose_name_plural = _("visit OTPs")

    def __str__(self):
        return f"OTP for Visit {self.visit_id} (Consumed: {self.is_consumed})"
