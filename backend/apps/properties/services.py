"""
Service layer for property lifecycle management, validation, and media handling.
"""

from django.utils import timezone
from rest_framework.exceptions import ValidationError, PermissionDenied
from apps.audit.services import AuditService
from .models import Property, PropertyStatus, PropertyMedia

MAX_MEDIA_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_DOCUMENT_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}


class PropertyService:
    """Encapsulates business operations and audit events for property listings."""

    @classmethod
    def create_draft(
        cls, owner_profile, data: dict, ip_address: str = None
    ) -> Property:
        """Creates a new property listing in DRAFT status."""
        prop = Property(
            owner=owner_profile,
            status=PropertyStatus.DRAFT,
            **data,
        )
        prop.save()

        AuditService.record_action(
            action="PROPERTY_CREATED",
            target_model="Property",
            target_id=str(prop.id),
            actor=owner_profile.user,
            ip_address=ip_address,
            metadata={"title": prop.title, "society": prop.society_name},
        )
        return prop

    @classmethod
    def update_property(
        cls, prop: Property, data: dict, user, ip_address: str = None
    ) -> Property:
        """
        Updates an existing property. Partners can only edit their own DRAFT properties.
        """
        is_admin = getattr(user, "is_admin", False) or user.is_staff

        if not is_admin and prop.owner.user != user:
            raise PermissionDenied(
                "You do not have permission to modify this property."
            )

        if not is_admin and prop.status not in [
            PropertyStatus.DRAFT,
            PropertyStatus.REJECTED,
        ]:
            raise ValidationError(
                {
                    "status": [
                        (
                            "Only DRAFT or REJECTED properties can be edited "
                            "by the partner."
                        )
                    ]
                }
            )

        for field, value in data.items():
            setattr(prop, field, value)

        prop.save()

        AuditService.record_action(
            action="PROPERTY_UPDATED",
            target_model="Property",
            target_id=str(prop.id),
            actor=user,
            ip_address=ip_address,
            metadata={"title": prop.title, "status": prop.status},
        )
        return prop

    @classmethod
    def submit_for_review(
        cls, prop: Property, user, ip_address: str = None
    ) -> Property:
        """
        Submits a draft property for administrative review.
        Validates required listing fields and photos.
        """
        if prop.owner.user != user and not (
            getattr(user, "is_admin", False) or user.is_staff
        ):
            raise PermissionDenied(
                "You do not have permission to submit this property."
            )

        if prop.status not in [PropertyStatus.DRAFT, PropertyStatus.REJECTED]:
            raise ValidationError(
                {
                    "status": [
                        (
                            f"Cannot submit property in status '{prop.status}'. "
                            "Must be DRAFT."
                        )
                    ]
                }
            )

        # Validate required attributes before submission
        errors = {}
        if not prop.title.strip():
            errors["title"] = ["Title is required before submission."]
        if not prop.society_name.strip():
            errors["society_name"] = ["Society name is required before submission."]
        if not prop.price or prop.price <= 0:
            errors["price"] = ["Valid positive price is required."]
        if not prop.super_area_sqft or prop.super_area_sqft <= 0:
            errors["super_area_sqft"] = [
                "Super built-up area must be greater than zero."
            ]
        if not prop.media.filter(media_type="IMAGE").exists():
            errors["media"] = [
                "At least one property image must be uploaded before submission."
            ]

        if errors:
            raise ValidationError(errors)

        prop.status = PropertyStatus.PENDING_REVIEW
        prop.submitted_at = timezone.now()
        prop.save(update_fields=["status", "submitted_at", "updated_at"])

        AuditService.record_action(
            action="PROPERTY_SUBMITTED",
            target_model="Property",
            target_id=str(prop.id),
            actor=user,
            ip_address=ip_address,
            metadata={"society": prop.society_name, "price": str(prop.price)},
        )
        return prop

    @classmethod
    def review_property(
        cls,
        prop: Property,
        reviewer_user,
        decision: str,
        rejection_reason: str = "",
        ip_address: str = None,
    ) -> Property:
        """
        Administrative review: sets listing to APPROVED or REJECTED.
        """
        if not (getattr(reviewer_user, "is_admin", False) or reviewer_user.is_staff):
            raise PermissionDenied("Only administrators can review property listings.")

        if decision not in [PropertyStatus.APPROVED, PropertyStatus.REJECTED]:
            raise ValidationError(
                {
                    "decision": [
                        f"Invalid decision '{decision}'. Must be APPROVED or REJECTED."
                    ]
                }
            )

        if decision == PropertyStatus.REJECTED and not rejection_reason.strip():
            raise ValidationError(
                {
                    "rejection_reason": [
                        "Rejection reason is required when rejecting a listing."
                    ]
                }
            )

        prop.status = decision
        prop.reviewed_by = reviewer_user
        prop.reviewed_at = timezone.now()
        prop.rejection_reason = (
            rejection_reason.strip() if decision == PropertyStatus.REJECTED else ""
        )
        prop.save()

        AuditService.record_action(
            action=f"PROPERTY_{decision}",
            target_model="Property",
            target_id=str(prop.id),
            actor=reviewer_user,
            ip_address=ip_address,
            metadata={"decision": decision, "rejection_reason": prop.rejection_reason},
        )
        return prop

    @classmethod
    def archive_property(cls, prop: Property, user, ip_address: str = None) -> Property:
        """Archives a property listing."""
        is_admin = getattr(user, "is_admin", False) or user.is_staff
        if not is_admin and prop.owner.user != user:
            raise PermissionDenied("You cannot archive another partner's property.")

        prop.status = PropertyStatus.ARCHIVED
        prop.save(update_fields=["status", "updated_at"])

        AuditService.record_action(
            action="PROPERTY_ARCHIVED",
            target_model="Property",
            target_id=str(prop.id),
            actor=user,
            ip_address=ip_address,
            metadata={"title": prop.title},
        )
        return prop

    @classmethod
    def attach_media(
        cls,
        prop: Property,
        file_obj,
        media_type: str = "IMAGE",
        caption: str = "",
        is_cover: bool = False,
        display_order: int = 0,
        user=None,
        ip_address: str = None,
    ) -> PropertyMedia:
        """
        Validates and attaches a media asset to a property listing.
        """
        if user:
            is_admin = getattr(user, "is_admin", False) or user.is_staff
            if not is_admin and prop.owner.user != user:
                raise PermissionDenied(
                    "Cannot upload media to another partner's property."
                )

        if not file_obj:
            raise ValidationError({"file": ["A valid file must be uploaded."]})

        if file_obj.size > MAX_MEDIA_FILE_SIZE:
            raise ValidationError(
                {"file": [f"File size exceeds 10MB limit ({file_obj.size} bytes)."]}
            )

        # Extension check
        name_lower = file_obj.name.lower()
        if media_type == "IMAGE":
            if not any(name_lower.endswith(ext) for ext in ALLOWED_IMAGE_EXTENSIONS):
                raise ValidationError(
                    {"file": ["Only JPG, PNG, and WebP images are allowed for photos."]}
                )
        else:
            if not any(name_lower.endswith(ext) for ext in ALLOWED_DOCUMENT_EXTENSIONS):
                raise ValidationError(
                    {
                        "file": [
                            "Only PDF, JPG, and PNG formats are allowed for documents."
                        ]
                    }
                )

        if is_cover:
            # Unset existing cover for this property
            prop.media.filter(is_cover=True).update(is_cover=False)

        media = PropertyMedia.objects.create(
            property=prop,
            file=file_obj,
            media_type=media_type,
            caption=caption,
            is_cover=is_cover,
            display_order=display_order,
        )

        AuditService.record_action(
            action="PROPERTY_MEDIA_UPLOADED",
            target_model="PropertyMedia",
            target_id=str(media.id),
            actor=user,
            ip_address=ip_address,
            metadata={"property_id": str(prop.id), "media_type": media_type},
        )
        return media

    @classmethod
    def delete_media(cls, media: PropertyMedia, user, ip_address: str = None):
        """Removes a media asset."""
        is_admin = getattr(user, "is_admin", False) or user.is_staff
        if not is_admin and media.property.owner.user != user:
            raise PermissionDenied(
                "Cannot delete media from another partner's property."
            )

        media_id = str(media.id)
        prop_id = str(media.property.id)
        media.delete()

        AuditService.record_action(
            action="PROPERTY_MEDIA_DELETED",
            target_model="PropertyMedia",
            target_id=media_id,
            actor=user,
            ip_address=ip_address,
            metadata={"property_id": prop_id},
        )
