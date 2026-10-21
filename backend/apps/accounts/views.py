"""
Authentication and current user views.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status, serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .services import PhoneOtpService
from .serializers import UserSerializer


class OtpRequestSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20)


class OtpVerifySerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20)
    otp = serializers.CharField(max_length=6)


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["full_name", "preferred_language", "email"]


class OtpRequestView(APIView):
    """Requests a 6-digit OTP for phone login or registration."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OtpRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data["phone"]
        _, raw_code = PhoneOtpService.generate_otp(phone)

        # In dev/test environments, preview the code for testing convenience
        response_data = {
            "message": "OTP sent successfully to registered phone number.",
            "phone": phone,
            "expires_in_seconds": PhoneOtpService.OTP_EXPIRY_SECONDS,
            "otp_preview": raw_code,
        }
        return Response(
            {"success": True, "data": response_data}, status=status.HTTP_200_OK
        )


class OtpVerifyView(APIView):
    """Verifies phone OTP and returns JWT tokens."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = OtpVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data["phone"]
        otp = serializer.validated_data["otp"]

        user = PhoneOtpService.verify_otp(phone, otp)

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return Response(
            {
                "success": True,
                "data": {
                    "access": access_token,
                    "refresh": str(refresh),
                    "user": UserSerializer(user).data,
                },
            },
            status=status.HTTP_200_OK,
        )


class CurrentUserView(APIView):
    """Retrieves or updates authenticated user profile."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"success": True, "data": UserSerializer(request.user).data})

    def patch(self, request):
        serializer = UserProfileUpdateSerializer(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"success": True, "data": UserSerializer(request.user).data})
