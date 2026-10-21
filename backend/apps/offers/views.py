"""
Views for property purchase offers, counteroffers, and negotiation lifecycle.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied
from apps.core.permissions import IsAdmin
from apps.partners.models import PartnerProfile
from apps.properties.models import Property
from apps.leads.models import Lead
from .models import Offer
from .serializers import (
    OfferSerializer,
    OfferCreateSerializer,
    OfferUpdateSerializer,
    OfferReviewSerializer,
    OfferCounterSerializer,
)
from .services import OfferService


class OfferListCreateView(APIView):
    """Lists partner offers or creates a new draft offer."""

    permission_classes = [IsAuthenticated]

    def get_profile(self):
        profile, _ = PartnerProfile.objects.get_or_create(user=self.request.user)
        return profile

    def get(self, request):
        is_admin = getattr(request.user, "is_admin", False) or request.user.is_staff
        if is_admin:
            queryset = Offer.objects.all().order_by("-created_at")
        else:
            profile = self.get_profile()
            queryset = profile.offers.all().order_by("-created_at")

        status_param = request.query_params.get("status")
        if status_param:
            queryset = queryset.filter(status=status_param.upper())

        property_id = request.query_params.get("property_id")
        if property_id:
            queryset = queryset.filter(property_id=property_id)

        serializer = OfferSerializer(queryset, many=True)
        return Response(
            {"success": True, "count": queryset.count(), "data": serializer.data}
        )

    def post(self, request):
        profile = self.get_profile()
        serializer = OfferCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        prop_id = serializer.validated_data["property_id"]
        lead_id = serializer.validated_data["lead_id"]
        amount = serializer.validated_data["amount"]
        notes = serializer.validated_data.get("notes", "")

        prop = Property.objects.filter(pk=prop_id).first()
        if not prop:
            raise NotFound("Property not found.")

        lead = Lead.objects.filter(pk=lead_id).first()
        if not lead:
            raise NotFound("Lead not found.")

        ip_addr = request.META.get("REMOTE_ADDR")
        offer = OfferService.create_draft_offer(
            partner_profile=profile,
            lead=lead,
            property_obj=prop,
            amount=amount,
            notes=notes,
            user=request.user,
            ip_address=ip_addr,
        )
        return Response(
            {"success": True, "data": OfferSerializer(offer).data},
            status=status.HTTP_201_CREATED,
        )


class OfferDetailView(APIView):
    """Retrieves or updates an individual offer."""

    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        offer = Offer.objects.filter(pk=pk).first()
        if not offer:
            raise NotFound("Offer not found.")

        is_admin = getattr(user, "is_admin", False) or user.is_staff
        if not is_admin and offer.partner.user != user:
            raise PermissionDenied("You do not have access to this offer.")
        return offer

    def get(self, request, pk):
        offer = self.get_object(pk, request.user)
        return Response({"success": True, "data": OfferSerializer(offer).data})

    def patch(self, request, pk):
        offer = self.get_object(pk, request.user)
        serializer = OfferUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ip_addr = request.META.get("REMOTE_ADDR")
        updated = OfferService.update_draft_offer(
            offer=offer,
            amount=serializer.validated_data.get("amount"),
            notes=serializer.validated_data.get("notes"),
            user=request.user,
            ip_address=ip_addr,
        )
        return Response({"success": True, "data": OfferSerializer(updated).data})


class OfferSubmitView(APIView):
    """Submits a draft offer for review."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        offer = Offer.objects.filter(pk=pk).first()
        if not offer:
            raise NotFound("Offer not found.")

        ip_addr = request.META.get("REMOTE_ADDR")
        submitted = OfferService.submit_offer(
            offer=offer, user=request.user, ip_address=ip_addr
        )
        return Response(
            {
                "success": True,
                "data": {
                    "message": "Offer submitted successfully.",
                    "offer": OfferSerializer(submitted).data,
                },
            },
            status=status.HTTP_200_OK,
        )


class OfferReviewView(APIView):
    """Administrative review of an offer (ACCEPT or REJECT)."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        offer = Offer.objects.filter(pk=pk).first()
        if not offer:
            raise NotFound("Offer not found.")

        serializer = OfferReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        decision = serializer.validated_data["decision"]
        rejection_reason = serializer.validated_data.get("rejection_reason", "")
        ip_addr = request.META.get("REMOTE_ADDR")

        reviewed = OfferService.review_offer(
            offer=offer,
            reviewer_user=request.user,
            decision=decision,
            rejection_reason=rejection_reason,
            ip_address=ip_addr,
        )
        return Response(
            {
                "success": True,
                "data": {
                    "message": f"Offer marked as {decision}.",
                    "offer": OfferSerializer(reviewed).data,
                },
            },
            status=status.HTTP_200_OK,
        )


class OfferCounterView(APIView):
    """Proposes a counteroffer linked to an existing offer."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        offer = Offer.objects.filter(pk=pk).first()
        if not offer:
            raise NotFound("Offer not found.")

        serializer = OfferCounterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        counter_amount = serializer.validated_data["counter_amount"]
        notes = serializer.validated_data.get("notes", "")
        ip_addr = request.META.get("REMOTE_ADDR")

        new_counter = OfferService.counter_offer(
            originating_offer=offer,
            counter_amount=counter_amount,
            notes=notes,
            user=request.user,
            ip_address=ip_addr,
        )
        return Response(
            {
                "success": True,
                "data": {
                    "message": "Counteroffer created successfully.",
                    "offer": OfferSerializer(new_counter).data,
                },
            },
            status=status.HTTP_201_CREATED,
        )
