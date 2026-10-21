"""
API views for Partner Profiles, KYC submissions, bank accounts, and admin KYC review.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.exceptions import NotFound, ValidationError
from apps.core.permissions import IsPartner, IsAdmin
from .models import PartnerProfile, KycSubmission, BankAccount
from .serializers import (
    PartnerProfileSerializer,
    KycSubmissionSerializer,
    KycReviewSerializer,
    BankAccountSerializer,
)
from .services import KycService


class PartnerProfileView(APIView):
    """Retrieves or updates authenticated partner profile."""

    permission_classes = [IsAuthenticated, IsPartner]

    def get_object(self):
        profile, _ = PartnerProfile.objects.get_or_create(user=self.request.user)
        return profile

    def get(self, request):
        profile = self.get_object()
        return Response(
            {"success": True, "data": PartnerProfileSerializer(profile).data}
        )

    def patch(self, request):
        profile = self.get_object()
        serializer = PartnerProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"success": True, "data": serializer.data})


class PartnerKycView(APIView):
    """Retrieves latest KYC submission or submits new KYC documents."""

    permission_classes = [IsAuthenticated, IsPartner]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_profile(self):
        profile, _ = PartnerProfile.objects.get_or_create(user=self.request.user)
        return profile

    def get(self, request):
        profile = self.get_profile()
        submission = profile.kyc_submissions.order_by("-created_at").first()
        if not submission:
            return Response(
                {
                    "success": True,
                    "data": {
                        "kyc_status": profile.kyc_status,
                        "latest_submission": None,
                    },
                }
            )
        return Response(
            {
                "success": True,
                "data": {
                    "kyc_status": profile.kyc_status,
                    "latest_submission": KycSubmissionSerializer(submission).data,
                },
            }
        )

    def post(self, request):
        profile = self.get_profile()

        pan_number = request.data.get("pan_number")
        pan_document = request.FILES.get("pan_document")
        aadhaar_last_four = request.data.get("aadhaar_last_four")
        address_document = request.FILES.get("address_document")
        rera_document = request.FILES.get("rera_document")

        errors = {}
        if not pan_number:
            errors["pan_number"] = ["This field is required."]
        if not pan_document:
            errors["pan_document"] = ["This field is required."]
        if not aadhaar_last_four:
            errors["aadhaar_last_four"] = ["This field is required."]
        if not address_document:
            errors["address_document"] = ["This field is required."]

        if errors:
            raise ValidationError(errors)

        ip_addr = request.META.get("REMOTE_ADDR")
        submission = KycService.submit_kyc(
            partner_profile=profile,
            pan_number=pan_number,
            pan_document=pan_document,
            aadhaar_last_four=aadhaar_last_four,
            address_document=address_document,
            rera_document=rera_document,
            ip_address=ip_addr,
        )

        return Response(
            {"success": True, "data": KycSubmissionSerializer(submission).data},
            status=status.HTTP_201_CREATED,
        )


class PartnerBankAccountListView(APIView):
    """Lists registered bank accounts or adds a new payout bank account."""

    permission_classes = [IsAuthenticated, IsPartner]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_profile(self):
        profile, _ = PartnerProfile.objects.get_or_create(user=self.request.user)
        return profile

    def get(self, request):
        profile = self.get_profile()
        accounts = profile.bank_accounts.all()
        return Response(
            {"success": True, "data": BankAccountSerializer(accounts, many=True).data}
        )

    def post(self, request):
        profile = self.get_profile()
        serializer = BankAccountSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        proof_doc = request.FILES.get("proof_document")
        account = BankAccount.objects.create(
            partner=profile,
            account_holder_name=serializer.validated_data["account_holder_name"],
            account_number=serializer.validated_data["account_number"],
            ifsc_code=serializer.validated_data["ifsc_code"],
            bank_name=serializer.validated_data["bank_name"],
            proof_document=proof_doc,
            is_primary=serializer.validated_data.get("is_primary", True),
        )

        return Response(
            {"success": True, "data": BankAccountSerializer(account).data},
            status=status.HTTP_201_CREATED,
        )


class AdminKycListView(APIView):
    """Lists KYC submissions for admin review, with optional status filter."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        queryset = KycSubmission.objects.select_related("partner__user").all()
        status_filter = request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter.upper())

        serializer = KycSubmissionSerializer(queryset, many=True)
        return Response(
            {"success": True, "count": queryset.count(), "data": serializer.data}
        )


class AdminKycDetailView(APIView):
    """Retrieves specific KYC submission details for admin inspection."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, pk):
        submission = KycSubmission.objects.filter(pk=pk).first()
        if not submission:
            raise NotFound("KYC submission not found.")
        return Response(
            {"success": True, "data": KycSubmissionSerializer(submission).data}
        )


class AdminKycReviewView(APIView):
    """Processes admin review decisions (APPROVED or REJECTED) on a KYC submission."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        submission = KycSubmission.objects.filter(pk=pk).first()
        if not submission:
            raise NotFound("KYC submission not found.")

        serializer = KycReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        decision = serializer.validated_data["decision"]
        rejection_reason = serializer.validated_data.get("rejection_reason", "")
        ip_addr = request.META.get("REMOTE_ADDR")

        updated = KycService.review_kyc(
            submission=submission,
            reviewer_user=request.user,
            decision=decision,
            rejection_reason=rejection_reason,
            ip_address=ip_addr,
        )

        return Response(
            {
                "success": True,
                "data": {
                    "message": f"KYC successfully marked as {decision}.",
                    "submission": KycSubmissionSerializer(updated).data,
                },
            },
            status=status.HTTP_200_OK,
        )
