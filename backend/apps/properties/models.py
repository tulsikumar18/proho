"""
Models for Property listings and associated media assets.
"""

import uuid
from decimal import Decimal
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.partners.models import PartnerProfile


class PropertyStatus(models.TextChoices):
    DRAFT = "DRAFT", _("Draft")
    PENDING_REVIEW = "PENDING_REVIEW", _("Pending Review")
    APPROVED = "APPROVED", _("Approved")
    REJECTED = "REJECTED", _("Rejected")
    ARCHIVED = "ARCHIVED", _("Archived")


class BhkType(models.TextChoices):
    BHK_1 = "1BHK", _("1 BHK")
    BHK_2 = "2BHK", _("2 BHK")
    BHK_3 = "3BHK", _("3 BHK")
    BHK_4 = "4BHK", _("4 BHK")
    STUDIO = "STUDIO", _("Studio")
    OTHER = "OTHER", _("Other")


class FurnishingStatus(models.TextChoices):
    UNFURNISHED = "UNFURNISHED", _("Unfurnished")
    SEMI_FURNISHED = "SEMI_FURNISHED", _("Semi-Furnished")
    FULLY_FURNISHED = "FULLY_FURNISHED", _("Fully Furnished")


class TenancyStatus(models.TextChoices):
    VACANT = "VACANT", _("Vacant")
    TENANTED = "TENANTED", _("Tenanted")
    SELF_OCCUPIED = "SELF_OCCUPIED", _("Self Occupied")


class Property(models.Model):
    """
    Core Property model representing sourced partner units and verified inventory.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        PartnerProfile,
        on_delete=models.CASCADE,
        related_name="properties",
        help_text=_("Channel partner who created and owns this listing."),
    )
    title = models.CharField(
        max_length=255,
        help_text=_("Display title (e.g., Gaur 14th Avenue - 2 BHK High Floor)."),
    )
    description = models.TextField(
        blank=True,
        help_text=_("Detailed property description and amenities."),
    )
    category = models.CharField(
        max_length=50,
        default="RESALE",
        help_text=_("Property category (e.g. RESALE, NEW_LAUNCH)."),
    )
    listing_purpose = models.CharField(
        max_length=20,
        default="SALE",
        help_text=_("Listing purpose (SALE or RENTAL)."),
    )
    society_name = models.CharField(
        max_length=255,
        db_index=True,
        help_text=_("Society or project name (e.g. Gaur City, ACE Divino)."),
    )
    tower = models.CharField(
        max_length=50,
        blank=True,
        help_text=_("Tower or block name/number."),
    )
    floor_number = models.IntegerField(null=True, blank=True)
    total_floors = models.IntegerField(null=True, blank=True)
    unit_number = models.CharField(
        max_length=50,
        blank=True,
        help_text=_("Unit/flat number."),
    )
    city = models.CharField(max_length=100, default="Noida")
    locality = models.CharField(
        max_length=150,
        blank=True,
        help_text=_("Micro-market locality (e.g. Greater Noida West)."),
    )
    address = models.TextField(blank=True)
    bhk_type = models.CharField(
        max_length=20,
        choices=BhkType.choices,
        default=BhkType.BHK_2,
        db_index=True,
    )
    bedrooms = models.PositiveIntegerField(default=1)
    bathrooms = models.PositiveIntegerField(default=1)
    balconies = models.PositiveIntegerField(default=0)
    super_area_sqft = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=_("Super built-up area in square feet."),
    )
    carpet_area_sqft = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=_("Carpet area in square feet."),
    )
    furnishing = models.CharField(
        max_length=30,
        choices=FurnishingStatus.choices,
        default=FurnishingStatus.UNFURNISHED,
    )
    tenancy_status = models.CharField(
        max_length=30,
        choices=TenancyStatus.choices,
        default=TenancyStatus.VACANT,
    )
    price = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        help_text=_("Quoted asking price in INR."),
    )
    rate_per_sqft = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text=_("Calculated rate per square foot in INR."),
    )
    currency = models.CharField(max_length=3, default="INR")
    status = models.CharField(
        max_length=30,
        choices=PropertyStatus.choices,
        default=PropertyStatus.DRAFT,
        db_index=True,
        help_text=_("Lifecycle status (DRAFT -> PENDING_REVIEW -> APPROVED)."),
    )
    rejection_reason = models.TextField(
        blank=True,
        help_text=_("Reason given by admin when rejected."),
    )
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_properties",
    )
    submitted_at = models.DateTimeField(null=True, blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("property")
        verbose_name_plural = _("properties")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.society_name}) [{self.status}]"

    def calculate_rate_per_sqft(self) -> Decimal | None:
        """Calculates rate per sqft based on price and super_area_sqft."""
        if self.price and self.super_area_sqft and self.super_area_sqft > 0:
            return (self.price / self.super_area_sqft).quantize(Decimal("0.01"))
        return None

    def save(self, *args, **kwargs):
        # Auto-compute rate_per_sqft if area is available
        calculated = self.calculate_rate_per_sqft()
        if calculated is not None:
            self.rate_per_sqft = calculated
        super().save(*args, **kwargs)

    @property
    def is_approved(self) -> bool:
        return self.status == PropertyStatus.APPROVED

    @property
    def is_draft(self) -> bool:
        return self.status == PropertyStatus.DRAFT

    @property
    def is_pending_review(self) -> bool:
        return self.status == PropertyStatus.PENDING_REVIEW


class MediaCategory(models.TextChoices):
    IMAGE = "IMAGE", _("Photo / Image")
    FLOOR_PLAN = "FLOOR_PLAN", _("Floor Plan")
    DOCUMENT = "DOCUMENT", _("Document")


class PropertyMedia(models.Model):
    """
    Media assets attached to a property listing.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="media",
        help_text=_("Associated property listing."),
    )
    file = models.FileField(
        upload_to="properties/media/",
        help_text=_("Uploaded image or document file."),
    )
    media_type = models.CharField(
        max_length=20,
        choices=MediaCategory.choices,
        default=MediaCategory.IMAGE,
    )
    caption = models.CharField(max_length=255, blank=True)
    is_cover = models.BooleanField(
        default=False,
        help_text=_("Designates whether this is the primary cover image."),
    )
    display_order = models.PositiveIntegerField(
        default=0,
        help_text=_("Display sequence order in gallery."),
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _("property media")
        verbose_name_plural = _("property media")
        ordering = ["display_order", "-created_at"]

    def __str__(self):
        cover_tag = " [COVER]" if self.is_cover else ""
        return f"Media for {self.property.title}{cover_tag}"
