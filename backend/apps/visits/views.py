"""
Views for property bookings, scheduled site visits, and OTP verification.
"""

from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied
from apps.core.permissions import IsAdmin
from apps.partners.models import PartnerProfile
from apps.properties.models import Property
from apps.leads.models import Lead
from apps.offers.models import Offer
from .models import Booking, Visit
from .serializers import (
    BookingSerializer,
    BookingCreateSerializer,
    VisitSerializer,
    VisitScheduleSerializer,
    VisitCancelSerializer,
    VisitRescheduleSerializer,
    VisitOtpVerifySerializer,
)
from .services import BookingService, VisitService


class BookingListCreateView(APIView):
    """Lists partner bookings or creates a new booking request."""

    permission_classes = [IsAuthenticated]

    def get_profile(self):
        profile, _ = PartnerProfile.objects.get_or_create(user=self.request.user)
        return profile

    def get(self, request):
        is_admin = getattr(request.user, "is_admin", False) or request.user.is_staff
        if is_admin:
            queryset = Booking.objects.all().order_by("-created_at")
        else:
            profile = self.get_profile()
            queryset = profile.bookings.all().order_by("-created_at")

        status_param = request.query_params.get("status")
        if status_param:
            queryset = queryset.filter(status=status_param.upper())

        serializer = BookingSerializer(queryset, many=True)
        return Response(
            {"success": True, "count": queryset.count(), "data": serializer.data}
        )

    def post(self, request):
        profile = self.get_profile()
        serializer = BookingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        prop_id = serializer.validated_data["property_id"]
        lead_id = serializer.validated_data["lead_id"]
        offer_id = serializer.validated_data.get("offer_id")
        notes = serializer.validated_data.get("notes", "")

        prop = Property.objects.filter(pk=prop_id).first()
        if not prop:
            raise NotFound("Property not found.")

        lead = Lead.objects.filter(pk=lead_id).first()
        if not lead:
            raise NotFound("Lead not found.")

        offer = None
        if offer_id:
            offer = Offer.objects.filter(pk=offer_id).first()

        ip_addr = request.META.get("REMOTE_ADDR")
        booking = BookingService.create_booking(
            partner_profile=profile,
            property_obj=prop,
            lead=lead,
            offer=offer,
            notes=notes,
            user=request.user,
            ip_address=ip_addr,
        )
        return Response(
            {"success": True, "data": BookingSerializer(booking).data},
            status=status.HTTP_201_CREATED,
        )


class BookingDetailView(APIView):
    """Retrieves an individual booking."""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        booking = Booking.objects.filter(pk=pk).first()
        if not booking:
            raise NotFound("Booking not found.")

        is_admin = getattr(request.user, "is_admin", False) or request.user.is_staff
        if not is_admin and booking.partner.user != request.user:
            raise PermissionDenied("You do not have access to this booking.")

        return Response({"success": True, "data": BookingSerializer(booking).data})


class BookingCancelView(APIView):
    """Cancels a booking request."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        booking = Booking.objects.filter(pk=pk).first()
        if not booking:
            raise NotFound("Booking not found.")

        reason = request.data.get("reason", "Cancelled by user.")
        ip_addr = request.META.get("REMOTE_ADDR")
        cancelled = BookingService.cancel_booking(
            booking=booking, reason=reason, user=request.user, ip_address=ip_addr
        )
        return Response(
            {
                "success": True,
                "data": {
                    "message": "Booking cancelled successfully.",
                    "booking": BookingSerializer(cancelled).data,
                },
            },
            status=status.HTTP_200_OK,
        )


class BookingConfirmView(APIView):
    """Administrative endpoint to confirm a requested booking."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        booking = Booking.objects.filter(pk=pk).first()
        if not booking:
            raise NotFound("Booking not found.")

        ip_addr = request.META.get("REMOTE_ADDR")
        confirmed = BookingService.confirm_booking(
            booking=booking, user=request.user, ip_address=ip_addr
        )
        return Response(
            {
                "success": True,
                "data": {
                    "message": "Booking confirmed successfully.",
                    "booking": BookingSerializer(confirmed).data,
                },
            },
            status=status.HTTP_200_OK,
        )


class VisitListScheduleView(APIView):
    """Lists scheduled visits or books a new visit slot."""

    permission_classes = [IsAuthenticated]

    def get_profile(self):
        profile, _ = PartnerProfile.objects.get_or_create(user=self.request.user)
        return profile

    def get(self, request):
        is_admin = getattr(request.user, "is_admin", False) or request.user.is_staff
        if is_admin:
            queryset = Visit.objects.all().order_by("-scheduled_start")
        else:
            profile = self.get_profile()
            queryset = profile.visits.all().order_by("-scheduled_start")

        status_param = request.query_params.get("status")
        if status_param:
            queryset = queryset.filter(status=status_param.upper())

        property_id = request.query_params.get("property_id")
        if property_id:
            queryset = queryset.filter(property_id=property_id)

        serializer = VisitSerializer(queryset, many=True)
        return Response(
            {"success": True, "count": queryset.count(), "data": serializer.data}
        )

    def post(self, request):
        profile = self.get_profile()
        serializer = VisitScheduleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        prop_id = serializer.validated_data["property_id"]
        lead_id = serializer.validated_data["lead_id"]
        booking_id = serializer.validated_data.get("booking_id")
        start = serializer.validated_data["scheduled_start"]
        end = serializer.validated_data["scheduled_end"]

        prop = Property.objects.filter(pk=prop_id).first()
        if not prop:
            raise NotFound("Property not found.")

        lead = Lead.objects.filter(pk=lead_id).first()
        if not lead:
            raise NotFound("Lead not found.")

        booking = None
        if booking_id:
            booking = Booking.objects.filter(pk=booking_id).first()

        ip_addr = request.META.get("REMOTE_ADDR")
        visit = VisitService.schedule_visit(
            partner_profile=profile,
            property_obj=prop,
            lead=lead,
            scheduled_start=start,
            scheduled_end=end,
            booking=booking,
            user=request.user,
            ip_address=ip_addr,
        )
        return Response(
            {"success": True, "data": VisitSerializer(visit).data},
            status=status.HTTP_201_CREATED,
        )


class VisitDetailView(APIView):
    """Retrieves an individual visit slot."""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        visit = Visit.objects.filter(pk=pk).first()
        if not visit:
            raise NotFound("Visit not found.")

        is_admin = getattr(request.user, "is_admin", False) or request.user.is_staff
        if not is_admin and visit.partner.user != request.user:
            raise PermissionDenied("You do not have access to this visit.")

        return Response({"success": True, "data": VisitSerializer(visit).data})


class VisitCancelView(APIView):
    """Cancels a scheduled visit (up to 2 hours prior)."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        visit = Visit.objects.filter(pk=pk).first()
        if not visit:
            raise NotFound("Visit not found.")

        serializer = VisitCancelSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reason = serializer.validated_data["reason"]
        ip_addr = request.META.get("REMOTE_ADDR")
        cancelled = VisitService.cancel_visit(
            visit=visit, reason=reason, user=request.user, ip_address=ip_addr
        )
        return Response(
            {
                "success": True,
                "data": {
                    "message": "Visit cancelled successfully.",
                    "visit": VisitSerializer(cancelled).data,
                },
            },
            status=status.HTTP_200_OK,
        )


class VisitRescheduleView(APIView):
    """Reschedules a scheduled visit slot."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        visit = Visit.objects.filter(pk=pk).first()
        if not visit:
            raise NotFound("Visit not found.")

        serializer = VisitRescheduleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_start = serializer.validated_data["new_start"]
        new_end = serializer.validated_data["new_end"]
        reason = serializer.validated_data["reason"]
        ip_addr = request.META.get("REMOTE_ADDR")

        rescheduled = VisitService.reschedule_visit(
            visit=visit,
            new_start=new_start,
            new_end=new_end,
            reason=reason,
            user=request.user,
            ip_address=ip_addr,
        )
        return Response(
            {
                "success": True,
                "data": {
                    "message": "Visit rescheduled successfully.",
                    "visit": VisitSerializer(rescheduled).data,
                },
            },
            status=status.HTTP_200_OK,
        )


class VisitOtpRequestView(APIView):
    """
    Generates and requests a 6-digit verification code for a visit slot.
    Available within 1 hour of scheduled start time.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        visit = Visit.objects.filter(pk=pk).first()
        if not visit:
            raise NotFound("Visit not found.")

        is_admin = getattr(request.user, "is_admin", False) or request.user.is_staff
        if not is_admin and visit.partner.user != request.user:
            raise PermissionDenied(
                "You do not have access to request OTP for this visit."
            )

        ip_addr = request.META.get("REMOTE_ADDR")
        otp_obj, raw_otp = VisitService.generate_visit_otp(
            visit=visit, user=request.user, ip_address=ip_addr
        )

        resp_data = {
            "message": "Visit verification OTP generated and dispatched.",
            "expires_at": otp_obj.expires_at,
        }
        if not getattr(settings, "IS_PRODUCTION", False):
            resp_data["otp_preview"] = raw_otp

        return Response({"success": True, "data": resp_data}, status=status.HTTP_200_OK)


class VisitOtpVerifyView(APIView):
    """
    Submits and verifies the 6-digit visit verification OTP at the door.
    Dual-mode: can be executed by visiting partner, on-site Proho staff, or admin.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        visit = Visit.objects.filter(pk=pk).first()
        if not visit:
            raise NotFound("Visit not found.")

        serializer = VisitOtpVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        raw_otp = serializer.validated_data["otp"]
        ip_addr = request.META.get("REMOTE_ADDR")

        VisitService.verify_visit_otp(
            visit=visit,
            raw_otp=raw_otp,
            user=request.user,
            ip_address=ip_addr,
        )
        return Response(
            {
                "success": True,
                "data": {
                    "message": "Visit successfully verified and completed.",
                    "visit": VisitSerializer(visit).data,
                },
            },
            status=status.HTTP_200_OK,
        )
