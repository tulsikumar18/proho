"""
Phone OTP authentication and verification service.
"""

import random
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth.hashers import make_password, check_password
from rest_framework.exceptions import ValidationError
from .models import PhoneOtp, User


class PhoneOtpService:
    """Handles secure generation and verification of phone OTPs."""

    OTP_EXPIRY_SECONDS = 300
    MAX_ATTEMPTS = 3

    @classmethod
    def generate_otp(cls, phone: str) -> tuple[PhoneOtp, str]:
        """
        Generates a 6-digit numeric OTP and stores a salted hash.
        Returns (PhoneOtp instance, raw_code).
        """
        phone = phone.strip()
        # In test/dev mode or production, generate 6-digit random number
        raw_code = f"{random.randint(100000, 999999)}"
        otp_hash = make_password(raw_code)
        expires_at = timezone.now() + timedelta(seconds=cls.OTP_EXPIRY_SECONDS)

        # Invalidate any previously unconsumed active OTPs for this phone
        PhoneOtp.objects.filter(
            phone=phone, is_consumed=False, expires_at__gt=timezone.now()
        ).update(is_consumed=True)

        phone_otp = PhoneOtp.objects.create(
            phone=phone,
            otp_hash=otp_hash,
            expires_at=expires_at,
            attempts=0,
            is_consumed=False,
        )
        return phone_otp, raw_code

    @classmethod
    def verify_otp(cls, phone: str, raw_code: str) -> User:
        """
        Verifies the provided OTP code against the latest active OTP for phone.
        If valid, marks it consumed and returns (or creates) the User instance.
        """
        phone = phone.strip()
        raw_code = raw_code.strip()

        latest_otp = (
            PhoneOtp.objects.filter(phone=phone, is_consumed=False)
            .order_by("-created_at")
            .first()
        )

        if not latest_otp:
            raise ValidationError(
                {"otp": ["No active OTP found. Please request a new OTP."]}
            )

        if timezone.now() > latest_otp.expires_at:
            raise ValidationError(
                {"otp": ["OTP has expired. Please request a new OTP."]}
            )

        if latest_otp.attempts >= cls.MAX_ATTEMPTS:
            raise ValidationError(
                {"otp": ["Maximum attempts exceeded. This OTP is locked."]}
            )

        if not check_password(raw_code, latest_otp.otp_hash):
            latest_otp.attempts += 1
            latest_otp.save(update_fields=["attempts"])
            remaining = cls.MAX_ATTEMPTS - latest_otp.attempts
            if remaining <= 0:
                raise ValidationError(
                    {"otp": ["Invalid OTP. Maximum attempts reached. Locked."]}
                )
            raise ValidationError(
                {"otp": [f"Invalid OTP code. {remaining} attempt(s) remaining."]}
            )

        # Mark consumed
        latest_otp.is_consumed = True
        latest_otp.save(update_fields=["is_consumed"])

        # Fetch or get user
        user = User.objects.filter(phone=phone).first()
        if not user:
            # Register new partner user automatically upon first phone verification
            user = User.objects.create_user(phone=phone, role=User.Role.CHANNEL_PARTNER)

        return user
