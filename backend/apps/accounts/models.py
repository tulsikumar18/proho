"""
Custom User Model for Proho Platform.
"""

import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils.translation import gettext_lazy as _
from .managers import CustomUserManager


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom user model with UUID primary key, phone-based identity,
    explicit role-based support, and bilingual preference.
    """

    class Role(models.TextChoices):
        CHANNEL_PARTNER = "CHANNEL_PARTNER", _("Channel Partner")
        ADMIN = "ADMIN", _("Operations Admin")
        SUPERADMIN = "SUPERADMIN", _("Superadmin")

    class Language(models.TextChoices):
        ENGLISH = "en", _("English")
        HINDI = "hi", _("Hindi")

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        help_text=_("Primary phone number in E.164 format or standard mobile number."),
    )
    email = models.EmailField(
        max_length=255,
        unique=True,
        null=True,
        blank=True,
        help_text=_("Optional unique email address."),
    )
    full_name = models.CharField(max_length=255, blank=True)
    role = models.CharField(
        max_length=30,
        choices=Role.choices,
        default=Role.CHANNEL_PARTNER,
        db_index=True,
        help_text=_("Role determining administrative and platform permissions."),
    )
    preferred_language = models.CharField(
        max_length=10,
        choices=Language.choices,
        default=Language.ENGLISH,
        help_text=_("Preferred UI language (English/Hindi)."),
    )
    is_active = models.BooleanField(
        default=True,
        help_text=_(
            "Designates whether this user account should be treated as active."
        ),
    )
    is_staff = models.BooleanField(
        default=False,
        help_text=_("Designates whether the user can log into the Django admin site."),
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = _("user")
        verbose_name_plural = _("users")
        ordering = ["-created_at"]

    def __str__(self):
        display = self.full_name or self.phone
        return f"{display} ({self.role})"

    @property
    def is_partner(self) -> bool:
        """True if user has the Channel Partner role."""
        return self.role == self.Role.CHANNEL_PARTNER

    @property
    def is_admin(self) -> bool:
        """True if user has the Admin role or is staff."""
        return self.role in [self.Role.ADMIN, self.Role.SUPERADMIN] or self.is_staff

    @property
    def is_superadmin(self) -> bool:
        """True if user is a Superadmin or Django superuser."""
        return self.role == self.Role.SUPERADMIN or self.is_superuser
