"""
Signals for automated creation of PartnerProfile.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.accounts.models import User
from .models import PartnerProfile


@receiver(post_save, sender=User)
def create_partner_profile(sender, instance, created, **kwargs):
    """
    Automatically creates a PartnerProfile whenever a User with role
    CHANNEL_PARTNER is created.
    """
    if created and instance.role == User.Role.CHANNEL_PARTNER:
        PartnerProfile.objects.get_or_create(user=instance)
