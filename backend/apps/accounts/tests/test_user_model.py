"""
Tests for custom User model, manager, and roles.
"""

import uuid
import pytest
from django.db import IntegrityError
from apps.accounts.models import User


@pytest.mark.django_db
class TestUserModel:
    """Validates User model requirements."""

    def test_create_partner_user(self):
        user = User.objects.create_user(
            phone="+919876543210",
            password="StrongPassword123!",
            full_name="Amit Verma",
            preferred_language=User.Language.HINDI,
            role=User.Role.CHANNEL_PARTNER,
        )

        assert isinstance(user.id, uuid.UUID)
        assert user.phone == "+919876543210"
        assert user.full_name == "Amit Verma"
        assert user.preferred_language == "hi"
        assert user.role == User.Role.CHANNEL_PARTNER
        assert user.is_partner is True
        assert user.is_admin is False
        assert user.is_superadmin is False
        assert user.is_active is True
        assert user.is_staff is False
        assert user.is_superuser is False
        assert user.check_password("StrongPassword123!") is True

    def test_phone_uniqueness_enforced(self):
        User.objects.create_user(phone="+919876543210", password="Password123!")
        with pytest.raises(IntegrityError):
            User.objects.create_user(phone="+919876543210", password="Password456!")

    def test_create_user_without_phone_raises_error(self):
        with pytest.raises(ValueError, match="The phone number must be set"):
            User.objects.create_user(phone="", password="Password123!")

    def test_create_superuser(self):
        superuser = User.objects.create_superuser(
            phone="+919999999999",
            password="AdminPassword123!",
            full_name="Admin User",
        )

        assert superuser.is_staff is True
        assert superuser.is_superuser is True
        assert superuser.role == User.Role.SUPERADMIN
        assert superuser.is_admin is True
        assert superuser.is_superadmin is True
        assert superuser.is_partner is False

    def test_superuser_validation_flags(self):
        with pytest.raises(ValueError, match="Superuser must have is_staff=True"):
            User.objects.create_superuser(
                phone="+919999999991", password="Password123!", is_staff=False
            )

        with pytest.raises(ValueError, match="Superuser must have is_superuser=True"):
            User.objects.create_superuser(
                phone="+919999999992", password="Password123!", is_superuser=False
            )

    def test_user_string_representation(self):
        user = User.objects.create_user(
            phone="+919876500000",
            full_name="Deepak Joshi",
            role=User.Role.CHANNEL_PARTNER,
        )
        assert str(user) == "Deepak Joshi (CHANNEL_PARTNER)"

        user_no_name = User.objects.create_user(
            phone="+919876500001",
            role=User.Role.ADMIN,
        )
        assert str(user_no_name) == "+919876500001 (ADMIN)"
