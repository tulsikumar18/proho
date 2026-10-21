"""
Service layer for buyer leads, referral attribution, and property sharing tokens.
"""

import re
import secrets
from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from rest_framework.exceptions import ValidationError, PermissionDenied, NotFound
from apps.audit.services import AuditService
from apps.properties.models import Property, PropertyStatus
from .models import Lead, LeadStatus, ReferralToken


class LeadService:
    """Encapsulates business operations for buyer leads and referral attribution."""

    @classmethod
    def normalize_phone(cls, phone: str) -> str:
        """
        Normalizes a phone number to standard 10 digits for duplicate comparison.
        """
        cleaned = re.sub(r"[^\d]", "", str(phone))
        if cleaned.startswith("91") and len(cleaned) == 12:
            cleaned = cleaned[2:]
        elif cleaned.startswith("0") and len(cleaned) == 11:
            cleaned = cleaned[1:]

        if len(cleaned) != 10:
            raise ValidationError(
                {
                    "customer_phone": [
                        "Phone number must be a valid 10-digit mobile number."
                    ]
                }
            )
        return cleaned

    @classmethod
    def create_lead(cls, partner_profile, data: dict, ip_address: str = None) -> Lead:
        """
        Creates a new buyer lead with 60-day attribution lock-in.
        Enforces duplicate detection across channel partners.
        """
        raw_phone = data.get("customer_phone", "")
        normalized_phone = cls.normalize_phone(raw_phone)
        data_copy = dict(data)
        data_copy["customer_phone"] = normalized_phone

        # Check existing active referral lock-in
        now = timezone.now()
        existing_active = Lead.objects.filter(
            customer_phone=normalized_phone,
            status__in=[LeadStatus.ACTIVE, LeadStatus.VISITING, LeadStatus.OFFER_MADE],
            attribution_expires_at__gt=now,
        ).first()

        if existing_active:
            if existing_active.partner_id != partner_profile.id:
                # Disallow without revealing who owns the lead
                raise ValidationError(
                    {
                        "customer_phone": [
                            "Lead already actively registered by another partner."
                        ]
                    }
                )
            # Same partner: update existing lead record
            for field, value in data_copy.items():
                setattr(existing_active, field, value)
            existing_active.extend_attribution()

            AuditService.record_action(
                action="LEAD_UPDATED",
                target_model="Lead",
                target_id=str(existing_active.id),
                actor=partner_profile.user,
                ip_address=ip_address,
                metadata={
                    "customer_name": existing_active.customer_name,
                    "attribution_expires_at": (
                        existing_active.attribution_expires_at.isoformat()
                    ),
                },
            )
            return existing_active

        # Create new lead with 60-day lock-in
        lock_days = getattr(settings, "REFERRAL_ATTRIBUTION_DAYS", 60)
        expires_at = now + timedelta(days=lock_days)

        lead = Lead(
            partner=partner_profile,
            attribution_expires_at=expires_at,
            **data_copy,
        )
        lead.save()

        AuditService.record_action(
            action="LEAD_CREATED",
            target_model="Lead",
            target_id=str(lead.id),
            actor=partner_profile.user,
            ip_address=ip_address,
            metadata={
                "customer_name": lead.customer_name,
                "partner_id": str(partner_profile.id),
                "attribution_expires_at": lead.attribution_expires_at.isoformat(),
            },
        )
        return lead

    @classmethod
    def update_lead(cls, lead: Lead, data: dict, user, ip_address: str = None) -> Lead:
        """
        Updates an existing lead. Restricted to the owning partner or staff.
        """
        is_admin = getattr(user, "is_admin", False) or user.is_staff
        if not is_admin and lead.partner.user != user:
            raise PermissionDenied("You do not have permission to modify this lead.")

        if "customer_phone" in data:
            data["customer_phone"] = cls.normalize_phone(data["customer_phone"])

        for field, value in data.items():
            setattr(lead, field, value)

        lead.save()

        AuditService.record_action(
            action="LEAD_UPDATED",
            target_model="Lead",
            target_id=str(lead.id),
            actor=user,
            ip_address=ip_address,
            metadata={"status": lead.status},
        )
        return lead

    @classmethod
    def generate_referral_token(
        cls,
        partner_profile,
        property_obj: Property,
        expires_in_days: int = 30,
        ip_address: str = None,
    ) -> ReferralToken:
        """
        Generates an opaque referral token for sharing an approved property.
        """
        if property_obj.status != PropertyStatus.APPROVED:
            raise ValidationError(
                {
                    "property": [
                        "Only approved properties are eligible for referral sharing."
                    ]
                }
            )

        token_str = secrets.token_urlsafe(32)
        expires_at = timezone.now() + timedelta(days=expires_in_days)

        ref_token = ReferralToken.objects.create(
            partner=partner_profile,
            property=property_obj,
            token=token_str,
            expires_at=expires_at,
        )

        AuditService.record_action(
            action="REFERRAL_TOKEN_CREATED",
            target_model="ReferralToken",
            target_id=str(ref_token.id),
            actor=partner_profile.user,
            ip_address=ip_address,
            metadata={
                "property_id": str(property_obj.id),
                "partner_id": str(partner_profile.id),
            },
        )
        return ref_token

    @classmethod
    def resolve_referral_token(cls, token_str: str) -> dict:
        """
        Resolves an opaque referral token into safe public property details.
        Excludes private unit numbers and direct seller details.
        """
        ref_token = (
            ReferralToken.objects.select_related("partner", "property")
            .filter(token=token_str, is_active=True)
            .first()
        )
        if not ref_token or not ref_token.is_valid:
            raise NotFound("Referral token is invalid or has expired.")

        prop = ref_token.property
        return {
            "referral_token": ref_token.token,
            "referring_partner": {
                "business_name": ref_token.partner.business_name,
                "city": ref_token.partner.base_location,
            },
            "property": {
                "id": str(prop.id),
                "title": prop.title,
                "society_name": prop.society_name,
                "tower": prop.tower,
                "bhk_type": prop.bhk_type,
                "super_area_sqft": (
                    str(prop.super_area_sqft) if prop.super_area_sqft else None
                ),
                "price": str(prop.price),
                "rate_per_sqft": (
                    str(prop.rate_per_sqft) if prop.rate_per_sqft else None
                ),
                "city": prop.city,
                "locality": prop.locality,
                "cover_image": (
                    prop.media.filter(is_cover=True).first().file.url
                    if prop.media.filter(is_cover=True).exists()
                    else None
                ),
            },
        }
