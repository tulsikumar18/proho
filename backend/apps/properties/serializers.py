"""
Serializers for Property listings, inventory queries, and media assets.
"""

from rest_framework import serializers
from .models import Property, PropertyMedia, PropertyStatus


class PropertyMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyMedia
        fields = [
            "id",
            "file",
            "media_type",
            "caption",
            "is_cover",
            "display_order",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class PropertySerializer(serializers.ModelSerializer):
    media = PropertyMediaSerializer(many=True, read_only=True)
    owner_phone = serializers.CharField(source="owner.user.phone", read_only=True)
    owner_name = serializers.CharField(source="owner.user.full_name", read_only=True)

    class Meta:
        model = Property
        fields = [
            "id",
            "owner_phone",
            "owner_name",
            "title",
            "description",
            "category",
            "listing_purpose",
            "society_name",
            "tower",
            "floor_number",
            "total_floors",
            "unit_number",
            "city",
            "locality",
            "address",
            "bhk_type",
            "bedrooms",
            "bathrooms",
            "balconies",
            "super_area_sqft",
            "carpet_area_sqft",
            "furnishing",
            "tenancy_status",
            "price",
            "rate_per_sqft",
            "currency",
            "status",
            "rejection_reason",
            "submitted_at",
            "reviewed_at",
            "created_at",
            "updated_at",
            "media",
        ]
        read_only_fields = [
            "id",
            "owner_phone",
            "owner_name",
            "rate_per_sqft",
            "status",
            "rejection_reason",
            "submitted_at",
            "reviewed_at",
            "created_at",
            "updated_at",
            "media",
        ]


class PropertyCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = [
            "title",
            "description",
            "category",
            "listing_purpose",
            "society_name",
            "tower",
            "floor_number",
            "total_floors",
            "unit_number",
            "city",
            "locality",
            "address",
            "bhk_type",
            "bedrooms",
            "bathrooms",
            "balconies",
            "super_area_sqft",
            "carpet_area_sqft",
            "furnishing",
            "tenancy_status",
            "price",
        ]

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value

    def validate_super_area_sqft(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError(
                "Super built-up area must be greater than zero."
            )
        return value


class PropertyInventorySerializer(serializers.ModelSerializer):
    """Publicly visible approved inventory cards for selling pool."""

    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            "id",
            "title",
            "society_name",
            "locality",
            "city",
            "bhk_type",
            "bedrooms",
            "bathrooms",
            "super_area_sqft",
            "tenancy_status",
            "furnishing",
            "price",
            "rate_per_sqft",
            "currency",
            "cover_image",
            "created_at",
        ]

    def get_cover_image(self, obj) -> str | None:
        cover = obj.media.filter(is_cover=True).first() or obj.media.first()
        if cover and cover.file:
            return cover.file.url
        return None


class PropertyReviewSerializer(serializers.Serializer):
    decision = serializers.ChoiceField(
        choices=[PropertyStatus.APPROVED, PropertyStatus.REJECTED]
    )
    rejection_reason = serializers.CharField(required=False, allow_blank=True)
