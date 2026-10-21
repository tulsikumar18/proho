"""
Views for buyer leads, referral attribution, and property sharing tokens.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied
from apps.core.permissions import IsPartner
from apps.partners.models import PartnerProfile
from apps.properties.models import Property
from .models import Lead
from .serializers import (
    LeadSerializer,
    LeadCreateUpdateSerializer,
    ReferralTokenCreateSerializer,
    ReferralTokenSerializer,
)
from .services import LeadService


class PartnerLeadListCreateView(APIView):
    """
    Lists authenticated partner's buyer leads or registers a new lead.
    Enforces 60-day attribution lock-in and duplicate protection.
    """

    permission_classes = [IsAuthenticated]

    def get_profile(self):
        profile, _ = PartnerProfile.objects.get_or_create(user=self.request.user)
        return profile

    def get(self, request):
        is_admin = getattr(request.user, "is_admin", False) or request.user.is_staff
        if is_admin:
            queryset = Lead.objects.all().order_by("-created_at")
        else:
            profile = self.get_profile()
            queryset = profile.leads.all().order_by("-created_at")

        status_param = request.query_params.get("status")
        if status_param:
            queryset = queryset.filter(status=status_param.upper())

        phone_param = request.query_params.get("phone")
        if phone_param:
            queryset = queryset.filter(customer_phone__contains=phone_param)

        serializer = LeadSerializer(queryset, many=True)
        return Response(
            {"success": True, "count": queryset.count(), "data": serializer.data}
        )

    def post(self, request):
        profile = self.get_profile()
        serializer = LeadCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ip_addr = request.META.get("REMOTE_ADDR")
        lead = LeadService.create_lead(
            partner_profile=profile,
            data=serializer.validated_data,
            ip_address=ip_addr,
        )
        return Response(
            {"success": True, "data": LeadSerializer(lead).data},
            status=status.HTTP_201_CREATED,
        )


class PartnerLeadDetailView(APIView):
    """
    Retrieves or updates an individual buyer lead.
    """

    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        lead = Lead.objects.filter(pk=pk).first()
        if not lead:
            raise NotFound("Lead not found.")

        is_admin = getattr(user, "is_admin", False) or user.is_staff
        if not is_admin and lead.partner.user != user:
            raise PermissionDenied("You do not have access to this lead.")
        return lead

    def get(self, request, pk):
        lead = self.get_object(pk, request.user)
        return Response({"success": True, "data": LeadSerializer(lead).data})

    def patch(self, request, pk):
        lead = self.get_object(pk, request.user)
        serializer = LeadCreateUpdateSerializer(lead, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        ip_addr = request.META.get("REMOTE_ADDR")
        updated = LeadService.update_lead(
            lead=lead,
            data=serializer.validated_data,
            user=request.user,
            ip_address=ip_addr,
        )
        return Response({"success": True, "data": LeadSerializer(updated).data})


class ReferralTokenCreateView(APIView):
    """
    Generates an opaque referral token for sharing an approved property.
    """

    permission_classes = [IsAuthenticated, IsPartner]

    def post(self, request):
        profile, _ = PartnerProfile.objects.get_or_create(user=request.user)
        serializer = ReferralTokenCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        prop_id = serializer.validated_data["property_id"]
        prop = Property.objects.filter(pk=prop_id).first()
        if not prop:
            raise NotFound("Property not found.")

        expires_in_days = serializer.validated_data.get("expires_in_days", 30)
        ip_addr = request.META.get("REMOTE_ADDR")

        ref_token = LeadService.generate_referral_token(
            partner_profile=profile,
            property_obj=prop,
            expires_in_days=expires_in_days,
            ip_address=ip_addr,
        )
        return Response(
            {"success": True, "data": ReferralTokenSerializer(ref_token).data},
            status=status.HTTP_201_CREATED,
        )


class PublicReferralTokenResolveView(APIView):
    """
    Public endpoint to resolve a referral token into safe property details.
    Allows prospective buyers to view property without leaking private unit numbers.
    """

    permission_classes = [AllowAny]

    def get(self, request, token):
        data = LeadService.resolve_referral_token(token)
        return Response({"success": True, "data": data})
