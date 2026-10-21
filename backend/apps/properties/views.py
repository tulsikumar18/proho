"""
Views for property listings, inventory discovery, media assets, and admin reviews.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.exceptions import NotFound, PermissionDenied
from django.db.models import Q
from apps.core.permissions import IsPartner, IsAdmin
from apps.partners.models import PartnerProfile
from .models import Property, PropertyStatus, PropertyMedia
from .serializers import (
    PropertySerializer,
    PropertyCreateUpdateSerializer,
    PropertyInventorySerializer,
    PropertyMediaSerializer,
    PropertyReviewSerializer,
)
from .services import PropertyService


class PartnerPropertyListCreateView(APIView):
    """Lists authenticated partner's properties or creates a new DRAFT listing."""

    permission_classes = [IsAuthenticated, IsPartner]

    def get_profile(self):
        profile, _ = PartnerProfile.objects.get_or_create(user=self.request.user)
        return profile

    def get(self, request):
        profile = self.get_profile()
        queryset = profile.properties.all().order_by("-created_at")
        serializer = PropertySerializer(queryset, many=True)
        return Response(
            {"success": True, "count": queryset.count(), "data": serializer.data}
        )

    def post(self, request):
        profile = self.get_profile()
        serializer = PropertyCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ip_addr = request.META.get("REMOTE_ADDR")
        prop = PropertyService.create_draft(
            owner_profile=profile,
            data=serializer.validated_data,
            ip_address=ip_addr,
        )
        return Response(
            {"success": True, "data": PropertySerializer(prop).data},
            status=status.HTTP_201_CREATED,
        )


class PartnerPropertyDetailView(APIView):
    """Retrieves, updates, or deletes an authenticated partner's property."""

    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        prop = Property.objects.filter(pk=pk).first()
        if not prop:
            raise NotFound("Property not found.")

        is_admin = getattr(user, "is_admin", False) or user.is_staff
        if not is_admin and prop.owner.user != user:
            raise PermissionDenied("You do not have access to this property.")
        return prop

    def get(self, request, pk):
        prop = self.get_object(pk, request.user)
        return Response({"success": True, "data": PropertySerializer(prop).data})

    def patch(self, request, pk):
        prop = self.get_object(pk, request.user)
        serializer = PropertyCreateUpdateSerializer(
            prop, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)

        ip_addr = request.META.get("REMOTE_ADDR")
        updated = PropertyService.update_property(
            prop=prop,
            data=serializer.validated_data,
            user=request.user,
            ip_address=ip_addr,
        )
        return Response({"success": True, "data": PropertySerializer(updated).data})

    def delete(self, request, pk):
        prop = self.get_object(pk, request.user)
        is_admin = getattr(request.user, "is_admin", False) or request.user.is_staff
        if not is_admin and prop.status != PropertyStatus.DRAFT:
            raise PermissionDenied("Only DRAFT properties can be deleted.")
        prop.delete()
        return Response({"success": True, "data": {"message": "Property deleted."}})


class PartnerPropertySubmitView(APIView):
    """Submits a DRAFT property for administrative review."""

    permission_classes = [IsAuthenticated, IsPartner]

    def post(self, request, pk):
        prop = Property.objects.filter(pk=pk).first()
        if not prop:
            raise NotFound("Property not found.")

        ip_addr = request.META.get("REMOTE_ADDR")
        submitted = PropertyService.submit_for_review(
            prop=prop,
            user=request.user,
            ip_address=ip_addr,
        )
        return Response(
            {
                "success": True,
                "data": {
                    "message": "Property submitted for review successfully.",
                    "property": PropertySerializer(submitted).data,
                },
            },
            status=status.HTTP_200_OK,
        )


class PropertyMediaListCreateView(APIView):
    """Lists media assets or uploads a photo to a property."""

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_property(self, pk, user):
        prop = Property.objects.filter(pk=pk).first()
        if not prop:
            raise NotFound("Property not found.")

        is_admin = getattr(user, "is_admin", False) or user.is_staff
        # If approved, public/partners can view media; otherwise owner or admin
        if (
            not is_admin
            and prop.owner.user != user
            and prop.status != PropertyStatus.APPROVED
        ):
            raise PermissionDenied(
                "You do not have permission to view media for this listing."
            )
        return prop

    def get(self, request, pk):
        prop = self.get_property(pk, request.user)
        media_list = prop.media.all()
        return Response(
            {
                "success": True,
                "data": PropertyMediaSerializer(media_list, many=True).data,
            }
        )

    def post(self, request, pk):
        prop = self.get_property(pk, request.user)
        file_obj = request.FILES.get("file")
        media_type = request.data.get("media_type", "IMAGE")
        caption = request.data.get("caption", "")
        is_cover = str(request.data.get("is_cover", "false")).lower() in ["true", "1"]
        display_order = int(request.data.get("display_order", 0))

        ip_addr = request.META.get("REMOTE_ADDR")
        media = PropertyService.attach_media(
            prop=prop,
            file_obj=file_obj,
            media_type=media_type,
            caption=caption,
            is_cover=is_cover,
            display_order=display_order,
            user=request.user,
            ip_address=ip_addr,
        )
        return Response(
            {"success": True, "data": PropertyMediaSerializer(media).data},
            status=status.HTTP_201_CREATED,
        )


class PropertyMediaDetailView(APIView):
    """Updates or deletes an individual property media item."""

    permission_classes = [IsAuthenticated]

    def get_media(self, pk, media_id, user):
        media = PropertyMedia.objects.filter(pk=media_id, property_id=pk).first()
        if not media:
            raise NotFound("Media item not found.")

        is_admin = getattr(user, "is_admin", False) or user.is_staff
        if not is_admin and media.property.owner.user != user:
            raise PermissionDenied(
                "You do not have permission to modify this media item."
            )
        return media

    def delete(self, request, pk, media_id):
        media = self.get_media(pk, media_id, request.user)
        ip_addr = request.META.get("REMOTE_ADDR")
        PropertyService.delete_media(media, user=request.user, ip_address=ip_addr)
        return Response({"success": True, "data": {"message": "Media item deleted."}})

    def patch(self, request, pk, media_id):
        media = self.get_media(pk, media_id, request.user)
        if "is_cover" in request.data:
            is_cover = bool(request.data["is_cover"])
            if is_cover:
                media.property.media.filter(is_cover=True).update(is_cover=False)
            media.is_cover = is_cover
        if "caption" in request.data:
            media.caption = request.data["caption"]
        if "display_order" in request.data:
            media.display_order = int(request.data["display_order"])
        media.save()
        return Response({"success": True, "data": PropertyMediaSerializer(media).data})


class SellingInventoryListView(APIView):
    """
    Public / Selling inventory discovery for verified Proho properties.
    Accessible to authenticated partners and prospective users.
    Supports filtering by BHK, society, price range, and free-text search.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        queryset = Property.objects.filter(
            status=PropertyStatus.APPROVED
        ).prefetch_related("media")

        # Filters
        bhk = request.query_params.get("bhk")
        if bhk:
            queryset = queryset.filter(bhk_type=bhk.upper())

        society = request.query_params.get("society")
        if society:
            queryset = queryset.filter(society_name__icontains=society)

        min_price = request.query_params.get("min_price")
        if min_price:
            queryset = queryset.filter(price__gte=min_price)

        max_price = request.query_params.get("max_price")
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        search = request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(society_name__icontains=search)
                | Q(locality__icontains=search)
                | Q(city__icontains=search)
            )

        serializer = PropertyInventorySerializer(queryset, many=True)
        return Response(
            {"success": True, "count": queryset.count(), "data": serializer.data}
        )


class AdminPropertyListView(APIView):
    """Administrative listing of all properties with lifecycle status filtering."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        queryset = Property.objects.all().order_by("-created_at")
        status_filter = request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter.upper())

        serializer = PropertySerializer(queryset, many=True)
        return Response(
            {"success": True, "count": queryset.count(), "data": serializer.data}
        )


class AdminPropertyReviewView(APIView):
    """Processes admin review decisions (APPROVED or REJECTED) on a property listing."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        prop = Property.objects.filter(pk=pk).first()
        if not prop:
            raise NotFound("Property not found.")

        serializer = PropertyReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        decision = serializer.validated_data["decision"]
        rejection_reason = serializer.validated_data.get("rejection_reason", "")
        ip_addr = request.META.get("REMOTE_ADDR")

        reviewed = PropertyService.review_property(
            prop=prop,
            reviewer_user=request.user,
            decision=decision,
            rejection_reason=rejection_reason,
            ip_address=ip_addr,
        )

        return Response(
            {
                "success": True,
                "data": {
                    "message": f"Listing marked as {decision}.",
                    "property": PropertySerializer(reviewed).data,
                },
            },
            status=status.HTTP_200_OK,
        )


class AdminPropertyArchiveView(APIView):
    """Administrative endpoint to archive a property listing."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        prop = Property.objects.filter(pk=pk).first()
        if not prop:
            raise NotFound("Property not found.")

        ip_addr = request.META.get("REMOTE_ADDR")
        archived = PropertyService.archive_property(
            prop=prop, user=request.user, ip_address=ip_addr
        )
        return Response(
            {"success": True, "data": PropertySerializer(archived).data},
            status=status.HTTP_200_OK,
        )
