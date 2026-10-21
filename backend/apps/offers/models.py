"""
Models for property purchase offers, counteroffers, and negotiation tracking.
"""

import uuid
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.partners.models import PartnerProfile
from apps.properties.models import Property
from apps.leads.models import Lead


class OfferStatus(models.TextChoices):
    DRAFT = "DRAFT", _("Draft")
    SUBMITTED = "SUBMITTED", _("Submitted")
    UNDER_REVIEW = "UNDER_REVIEW", _("Under Review")
    COUNTERED = "COUNTERED", _("Countered")
    ACCEPTED = "ACCEPTED", _("Accepted")
    REJECTED = "REJECTED", _("Rejected")
    EXPIRED = "EXPIRED", _("Expired")


class Offer(models.Model):
    """
    Purchase or transaction offer on an approved property for a referred lead.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="offers",
        help_text=_("Associated property listing."),
    )
    lead = models.ForeignKey(
        Lead,
        on_delete=models.CASCADE,
        related_name="offers",
        help_text=_("Associated buyer lead."),
    )
    partner = models.ForeignKey(
        PartnerProfile,
        on_delete=models.CASCADE,
        related_name="offers",
        help_text=_("Channel partner who initiated or represents this offer."),
    )
    amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        help_text=_("Quoted purchase offer amount in INR."),
    )
    status = models.CharField(
        max_length=30,
        choices=OfferStatus.choices,
        default=OfferStatus.DRAFT,
        db_index=True,
        help_text=_("Lifecycle status of the offer."),
    )
    notes = models.TextField(
        blank=True,
        help_text=_("Terms, payment schedule, or buyer remarks."),
    )
    rejection_reason = models.TextField(
        blank=True,
        help_text=_("Administrative reason when an offer is declined."),
    )
    counter_to = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="counter_offers",
        help_text=_("Parent offer if this is a counteroffer."),
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_offers",
        help_text=_("User who created this offer record."),
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="reviewed_offers",
        help_text=_("Administrator who evaluated or finalized this offer."),
    )
    valid_until = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("Offer expiration timestamp (default 72 hours)."),
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("offer")
        verbose_name_plural = _("offers")
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"Offer {self.id} for {self.property.title}: ₹{self.amount} [{self.status}]"
        )
