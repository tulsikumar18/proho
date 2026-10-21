"""
Serializers for User model.
"""

from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Public safe representation of User model."""

    class Meta:
        model = User
        fields = [
            "id",
            "phone",
            "email",
            "full_name",
            "role",
            "preferred_language",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "role", "is_active", "created_at"]
