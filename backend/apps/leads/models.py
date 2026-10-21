"""
Models for buyer leads, referral attribution, and property sharing tokens.
"""

import uuid
from datetime import timedelta
from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from apps.partners.models import PartnerProfile
from apps.properties.models import Property, BhkType

_py_property = property


class LeadStatus(models.TextChoices):
    ACTIVE = "ACTIVE", _("Active")
    VISITING = "VISITING", _("Visiting")
    OFFER_MADE = "OFFER_MADE", _("Offer Made")
    CLOSED = "CLOSED", _("Closed")
    EXPIRED = "EXPIRED", _("Expired")


class Lead(models.Model):
    """
    Buyer lead referred by a channel partner with 60-day attribution lock-in.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    partner = models.ForeignKey(
        PartnerProfile,
        on_delete=models.CASCADE,
        related_name="leads",
        help_text=_("Channel partner who referred this customer."),
    )
    customer_name = models.CharField(
        max_length=255,
        help_text=_("Full name of prospective buyer/customer."),
    )
    customer_phone = models.CharField(
        max_length=15,
        db_index=True,
        help_text=_("Normalized 10-digit customer mobile number."),
    )
    customer_email = models.EmailField(
        blank=True,
        null=True,
        help_text=_("Customer email address."),
    )
    budget_min = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=_("Minimum budget in INR."),
    )
    budget_max = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=_("Maximum budget in INR."),
    )
    preferred_bhk = models.CharField(
        max_length=20,
        choices=BhkType.choices,
        blank=True,
        null=True,
        help_text=_("Preferred BHK configuration."),
    )
    preferred_location = models.CharField(
        max_length=150,
        blank=True,
        help_text=_("Preferred micro-market locality."),
    )
    property = models.ForeignKey(
        Property,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="interested_leads",
        help_text=_("Specific property unit customer is interested in."),
    )
    status = models.CharField(
        max_length=30,
        choices=LeadStatus.choices,
        default=LeadStatus.ACTIVE,
        db_index=True,
        help_text=_("Current lifecycle status of the lead."),
    )
    attribution_expires_at = models.DateTimeField(
        db_index=True,
        help_text=_("Expiration timestamp for referral lock-in (60 days)."),
    )
    last_interaction_at = models.DateTimeField(
        default=timezone.now,
        help_text=_("Timestamp of last verified interaction or visit."),
    )
    notes = models.TextField(
        blank=True,
        help_text=_("Internal partner notes or special customer requirements."),
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("lead")
        verbose_name_plural = _("leads")
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["customer_phone", "attribution_expires_at"]),
        ]

    def __str__(self):
        return f"{self.customer_name} ({self.customer_phone}) [{self.status}]"

    @_py_property
    def is_attribution_active(self) -> bool:
        """Determines whether referral attribution is currently active."""
        return self.attribution_expires_at > timezone.now() and self.status in [
            LeadStatus.ACTIVE,
            LeadStatus.VISITING,
            LeadStatus.OFFER_MADE,
        ]

    def extend_attribution(self, days: int = None):
        """Extends referral lock-in window following verified interaction."""
        lock_days = days or getattr(settings, "REFERRAL_ATTRIBUTION_DAYS", 60)
        self.attribution_expires_at = timezone.now() + timedelta(days=lock_days)
        self.last_interaction_at = timezone.now()
        self.save(
            update_fields=[
                "attribution_expires_at",
                "last_interaction_at",
                "updated_at",
            ]
        )


class ReferralToken(models.Model):
    """
    Opaque share token linking an approved property to a partner for buyer sharing.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    partner = models.ForeignKey(
        PartnerProfile,
        on_delete=models.CASCADE,
        related_name="referral_tokens",
        help_text=_("Partner who generated this sharing link."),
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="referral_tokens",
        help_text=_("Eligible approved property being shared."),
    )
    token = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
        help_text=_("Cryptographically secure opaque token."),
    )
    is_active = models.BooleanField(
        default=True,
        help_text=_("Designates whether this sharing token is currently active."),
    )
    expires_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text=_("Optional expiration timestamp for the sharing token."),
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("referral token")
        verbose_name_plural = _("referral tokens")
        ordering = ["-created_at"]

    def __str__(self):
        return f"ReferralToken {self.token[:8]}... for {self.property.title}"

    @_py_property
    def is_valid(self) -> bool:
        if not self.is_active:
            return False
        if self.expires_at and self.expires_at <= timezone.now():
            return False
        return True
