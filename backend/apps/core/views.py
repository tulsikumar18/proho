"""
Core infrastructure and authorization verification views.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from .permissions import IsPartner, IsAdmin, IsOwnerOrAdmin


class HealthCheckView(APIView):
    """Public health check endpoint returning API service status."""

    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {
                "success": True,
                "data": {
                    "status": "healthy",
                    "service": "proho-backend",
                    "version": "v1.0.0",
                },
            },
            status=status.HTTP_200_OK,
        )


class PartnerTestView(APIView):
    """Protected endpoint accessible only by Channel Partners."""

    permission_classes = [IsAuthenticated, IsPartner]

    def get(self, request):
        return Response(
            {
                "success": True,
                "data": {
                    "message": "Authorized as Channel Partner",
                    "user_id": str(request.user.id),
                    "role": request.user.role,
                },
            }
        )


class AdminTestView(APIView):
    """Protected endpoint accessible only by Admins / Superadmins."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        return Response(
            {
                "success": True,
                "data": {
                    "message": "Authorized as Admin",
                    "user_id": str(request.user.id),
                    "role": request.user.role,
                },
            }
        )


class OwnerTestView(APIView):
    """
    Protected endpoint verifying object-level permission IsOwnerOrAdmin.
    """

    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def get(self, request):
        # Test has_object_permission using authenticated user as target object
        self.check_object_permissions(request, request.user)
        return Response(
            {
                "success": True,
                "data": {
                    "message": "Authorized as Owner or Admin",
                    "user_id": str(request.user.id),
                },
            }
        )
