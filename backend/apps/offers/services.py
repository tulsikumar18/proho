"""
Service layer for property purchase offers, counteroffers, and negotiation lifecycle.
"""

from datetime import timedelta
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError, PermissionDenied
from apps.audit.services import AuditService
from apps.properties.models import Property, PropertyStatus
from apps.leads.models import Lead, LeadStatus
from .models import Offer, OfferStatus


class OfferService:
    """Encapsulates business operations for offers and counteroffers."""

    @classmethod
    def create_draft_offer(
        cls,
        partner_profile,
        lead: Lead,
        property_obj: Property,
        amount: Decimal,
        notes: str = "",
        user=None,
        ip_address: str = None,
    ) -> Offer:
        """Creates a new offer in DRAFT status."""
        is_admin = getattr(user, "is_admin", False) or (user and user.is_staff)
        if not is_admin and lead.partner_id != partner_profile.id:
            raise PermissionDenied("Cannot create an offer for another partner's lead.")

        if property_obj.status != PropertyStatus.APPROVED:
            raise ValidationError(
                {"property": ["Offers can only be placed on approved properties."]}
            )

        if amount <= Decimal("0.00"):
            raise ValidationError(
                {"amount": ["Offer amount must be a positive monetary value."]}
            )

        valid_until = timezone.now() + timedelta(hours=72)

        offer = Offer.objects.create(
            property=property_obj,
            lead=lead,
            partner=partner_profile,
            amount=amount,
            notes=notes,
            status=OfferStatus.DRAFT,
            created_by=user or partner_profile.user,
            valid_until=valid_until,
        )

        AuditService.record_action(
            action="OFFER_CREATED",
            target_model="Offer",
            target_id=str(offer.id),
            actor=user or partner_profile.user,
            ip_address=ip_address,
            metadata={
                "property_id": str(property_obj.id),
                "lead_id": str(lead.id),
                "amount": str(amount),
            },
        )
        return offer

    @classmethod
    def update_draft_offer(
        cls,
        offer: Offer,
        amount: Decimal = None,
        notes: str = None,
        user=None,
        ip_address: str = None,
    ) -> Offer:
        """Updates an existing DRAFT offer."""
        is_admin = getattr(user, "is_admin", False) or (user and user.is_staff)
        if not is_admin and offer.partner.user != user:
            raise PermissionDenied("You do not have permission to modify this offer.")

        if offer.status != OfferStatus.DRAFT:
            raise ValidationError({"status": ["Only DRAFT offers can be edited."]})

        if amount is not None:
            if amount <= Decimal("0.00"):
                raise ValidationError(
                    {"amount": ["Offer amount must be a positive monetary value."]}
                )
            offer.amount = amount

        if notes is not None:
            offer.notes = notes

        offer.save()

        AuditService.record_action(
            action="OFFER_UPDATED",
            target_model="Offer",
            target_id=str(offer.id),
            actor=user,
            ip_address=ip_address,
            metadata={"amount": str(offer.amount)},
        )
        return offer

    @classmethod
    def submit_offer(cls, offer: Offer, user, ip_address: str = None) -> Offer:
        """Submits a DRAFT offer for administrative review."""
        is_admin = getattr(user, "is_admin", False) or user.is_staff
        if not is_admin and offer.partner.user != user:
            raise PermissionDenied("You do not have permission to submit this offer.")

        if offer.status != OfferStatus.DRAFT:
            raise ValidationError(
                {
                    "status": [
                        (
                            f"Cannot submit offer in status '{offer.status}'. "
                            "Must be DRAFT."
                        )
                    ]
                }
            )

        with transaction.atomic():
            offer.status = OfferStatus.SUBMITTED
            offer.save(update_fields=["status", "updated_at"])

            # Advance lead lifecycle and extend attribution
            lead = offer.lead
            if lead.status in [LeadStatus.ACTIVE, LeadStatus.VISITING]:
                lead.status = LeadStatus.OFFER_MADE
            lead.attribution_expires_at = timezone.now() + timedelta(days=60)
            lead.last_interaction_at = timezone.now()
            lead.save(
                update_fields=[
                    "status",
                    "attribution_expires_at",
                    "last_interaction_at",
                    "updated_at",
                ]
            )

        AuditService.record_action(
            action="OFFER_SUBMITTED",
            target_model="Offer",
            target_id=str(offer.id),
            actor=user,
            ip_address=ip_address,
            metadata={"amount": str(offer.amount), "lead_id": str(offer.lead.id)},
        )
        return offer

    @classmethod
    def review_offer(
        cls,
        offer: Offer,
        reviewer_user,
        decision: str,
        rejection_reason: str = "",
        ip_address: str = None,
    ) -> Offer:
        """Administrative review of an offer (ACCEPT or REJECT)."""
        if not (getattr(reviewer_user, "is_admin", False) or reviewer_user.is_staff):
            raise PermissionDenied("Only administrators can approve or reject offers.")

        if decision not in [OfferStatus.ACCEPTED, OfferStatus.REJECTED]:
            raise ValidationError(
                {
                    "decision": [
                        f"Invalid decision '{decision}'. Must be ACCEPTED or REJECTED."
                    ]
                }
            )

        if decision == OfferStatus.REJECTED and not rejection_reason.strip():
            raise ValidationError(
                {
                    "rejection_reason": [
                        "Rejection reason is required when declining an offer."
                    ]
                }
            )

        if offer.status not in [OfferStatus.SUBMITTED, OfferStatus.UNDER_REVIEW]:
            raise ValidationError(
                {"status": [f"Cannot review offer in status '{offer.status}'."]}
            )

        with transaction.atomic():
            offer.status = decision
            offer.reviewed_by = reviewer_user
            offer.rejection_reason = (
                rejection_reason.strip() if decision == OfferStatus.REJECTED else ""
            )
            offer.save()

        AuditService.record_action(
            action=f"OFFER_{decision}",
            target_model="Offer",
            target_id=str(offer.id),
            actor=reviewer_user,
            ip_address=ip_address,
            metadata={
                "decision": decision,
                "rejection_reason": offer.rejection_reason,
            },
        )
        return offer

    @classmethod
    def counter_offer(
        cls,
        originating_offer: Offer,
        counter_amount: Decimal,
        notes: str = "",
        user=None,
        ip_address: str = None,
    ) -> Offer:
        """Proposes a counteroffer linked to the originating offer."""
        is_admin = getattr(user, "is_admin", False) or (user and user.is_staff)

        if not is_admin and originating_offer.partner.user != user:
            raise PermissionDenied("You do not have access to counter this offer.")

        if counter_amount <= Decimal("0.00"):
            raise ValidationError(
                {
                    "counter_amount": [
                        "Counter amount must be a positive monetary value."
                    ]
                }
            )

        with transaction.atomic():
            # Mark parent offer as COUNTERED
            originating_offer.status = OfferStatus.COUNTERED
            originating_offer.save(update_fields=["status", "updated_at"])

            # Create child counteroffer
            new_offer = Offer.objects.create(
                property=originating_offer.property,
                lead=originating_offer.lead,
                partner=originating_offer.partner,
                amount=counter_amount,
                notes=notes,
                status=OfferStatus.SUBMITTED,
                counter_to=originating_offer,
                created_by=user or originating_offer.partner.user,
                valid_until=timezone.now() + timedelta(hours=72),
            )

        AuditService.record_action(
            action="OFFER_COUNTERED",
            target_model="Offer",
            target_id=str(new_offer.id),
            actor=user,
            ip_address=ip_address,
            metadata={
                "parent_offer_id": str(originating_offer.id),
                "counter_amount": str(counter_amount),
            },
        )
        return new_offer
