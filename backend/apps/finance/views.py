"""
REST API views for partner finance, earnings ledger, invoices, and payouts.
"""

from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import IsAdmin, IsPartner
from apps.finance.models import (
    Deal,
    Invoice,
    LedgerEntry,
    PayoutRequest,
)
from apps.finance.serializers import (
    DealCreateSerializer,
    DealSerializer,
    FinancialSummarySerializer,
    InvoiceSerializer,
    LedgerEntrySerializer,
    PayoutDisburseSerializer,
    PayoutRequestCreateSerializer,
    PayoutRequestSerializer,
    PayoutReviewSerializer,
)
from apps.finance.services import FinanceService


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class FinancialSummaryView(APIView):
    """
    Retrieves financial earnings, cleared balance, and payout summary for the partner.
    """

    permission_classes = [IsAuthenticated, IsPartner]

    def get(self, request):
        partner = getattr(request.user, "partner_profile", None)
        if not partner:
            raise PermissionDenied("Partner profile required.")
        summary = FinanceService.get_financial_summary(partner)
        serializer = FinancialSummarySerializer(summary)
        return Response({"success": True, "data": serializer.data})


class PartnerLedgerListView(APIView):
    """Lists double-entry transaction ledger records for the authenticated partner."""

    permission_classes = [IsAuthenticated, IsPartner]

    def get(self, request):
        partner = getattr(request.user, "partner_profile", None)
        if not partner:
            raise PermissionDenied("Partner profile required.")
        qs = LedgerEntry.objects.filter(partner=partner).order_by("-created_at")
        paginator = StandardPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = LedgerEntrySerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class PartnerInvoiceListView(APIView):
    """Lists commission invoices and statements for the authenticated partner."""

    permission_classes = [IsAuthenticated, IsPartner]

    def get(self, request):
        partner = getattr(request.user, "partner_profile", None)
        if not partner:
            raise PermissionDenied("Partner profile required.")
        qs = Invoice.objects.filter(partner=partner).order_by("-issued_at")
        paginator = StandardPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = InvoiceSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class PartnerInvoiceDetailView(APIView):
    """Retrieves detail of a commission invoice for the partner."""

    permission_classes = [IsAuthenticated, IsPartner]

    def get(self, request, pk):
        partner = getattr(request.user, "partner_profile", None)
        if not partner:
            raise PermissionDenied("Partner profile required.")
        try:
            invoice = Invoice.objects.get(id=pk, partner=partner)
        except Invoice.DoesNotExist:
            raise NotFound("Invoice not found.")
        serializer = InvoiceSerializer(invoice)
        return Response({"success": True, "data": serializer.data})


class PartnerPayoutListCreateView(APIView):
    """Lists partner payouts and submits new withdrawal requests."""

    permission_classes = [IsAuthenticated, IsPartner]

    def get(self, request):
        partner = getattr(request.user, "partner_profile", None)
        if not partner:
            raise PermissionDenied("Partner profile required.")
        qs = PayoutRequest.objects.filter(partner=partner).order_by("-created_at")
        paginator = StandardPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = PayoutRequestSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        partner = getattr(request.user, "partner_profile", None)
        if not partner:
            raise PermissionDenied("Partner profile required.")
        serializer = PayoutRequestCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            payout = FinanceService.create_payout_request(
                partner=partner,
                bank_account_id=serializer.validated_data["bank_account_id"],
                amount=serializer.validated_data["amount"],
                idempotency_key=serializer.validated_data.get("idempotency_key"),
                actor=request.user,
            )
        except Exception as e:
            if hasattr(e, "message_dict"):
                raise ValidationError(e.message_dict)
            raise ValidationError(str(e))

        return Response(
            {"success": True, "data": PayoutRequestSerializer(payout).data},
            status=status.HTTP_201_CREATED,
        )


class PartnerPayoutDetailView(APIView):
    """Retrieves detail of a payout request for the partner."""

    permission_classes = [IsAuthenticated, IsPartner]

    def get(self, request, pk):
        partner = getattr(request.user, "partner_profile", None)
        if not partner:
            raise PermissionDenied("Partner profile required.")
        try:
            payout = PayoutRequest.objects.get(id=pk, partner=partner)
        except PayoutRequest.DoesNotExist:
            raise NotFound("Payout request not found.")
        serializer = PayoutRequestSerializer(payout)
        return Response({"success": True, "data": serializer.data})


# ==============================================================================
# Admin Views
# ==============================================================================


class AdminPayoutListView(APIView):
    """Lists all payout requests across the platform with optional status filter."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        qs = PayoutRequest.objects.all().order_by("-created_at")
        payout_status = request.query_params.get("status")
        if payout_status:
            qs = qs.filter(status=payout_status)
        paginator = StandardPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = PayoutRequestSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class AdminPayoutDetailView(APIView):
    """Retrieves details of any payout request for administrators."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, pk):
        try:
            payout = PayoutRequest.objects.get(id=pk)
        except PayoutRequest.DoesNotExist:
            raise NotFound("Payout request not found.")
        serializer = PayoutRequestSerializer(payout)
        return Response({"success": True, "data": serializer.data})


class AdminPayoutReviewView(APIView):
    """Transitions payout request status to UNDER_REVIEW, APPROVED, or REJECTED."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        try:
            payout = PayoutRequest.objects.get(id=pk)
        except PayoutRequest.DoesNotExist:
            raise NotFound("Payout request not found.")

        serializer = PayoutReviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            updated = FinanceService.review_payout(
                payout=payout,
                new_status=serializer.validated_data["status"],
                actor=request.user,
                rejection_reason=serializer.validated_data.get("rejection_reason", ""),
            )
        except Exception as e:
            if hasattr(e, "message_dict"):
                raise ValidationError(e.message_dict)
            raise ValidationError(str(e))

        return Response(
            {"success": True, "data": PayoutRequestSerializer(updated).data}
        )


class AdminPayoutDisburseView(APIView):
    """Marks an approved payout request as PAID and atomically debits partner ledger."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        try:
            payout = PayoutRequest.objects.get(id=pk)
        except PayoutRequest.DoesNotExist:
            raise NotFound("Payout request not found.")

        serializer = PayoutDisburseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            disbursed = FinanceService.disburse_payout(
                payout=payout,
                utr_reference=serializer.validated_data["utr_reference"],
                payment_date=serializer.validated_data.get("payment_date"),
                actor=request.user,
            )
        except Exception as e:
            if hasattr(e, "message_dict"):
                raise ValidationError(e.message_dict)
            raise ValidationError(str(e))

        return Response(
            {"success": True, "data": PayoutRequestSerializer(disbursed).data}
        )


class AdminDealListCreateView(APIView):
    """Lists deals or creates a new deal for administrative tracking."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        qs = Deal.objects.all().order_by("-deal_date")
        paginator = StandardPagination()
        page = paginator.paginate_queryset(qs, request)
        serializer = DealSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = DealCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        deal = serializer.save()

        # Check if immediate registration is requested
        if request.data.get("register_immediately", False):
            try:
                invoice = FinanceService.register_deal_and_credit_commission(
                    deal=deal, actor=request.user
                )
                return Response(
                    {
                        "success": True,
                        "data": DealSerializer(deal).data,
                        "invoice": InvoiceSerializer(invoice).data,
                    },
                    status=status.HTTP_201_CREATED,
                )
            except Exception as e:
                if hasattr(e, "message_dict"):
                    raise ValidationError(e.message_dict)
                raise ValidationError(str(e))

        return Response(
            {"success": True, "data": DealSerializer(deal).data},
            status=status.HTTP_201_CREATED,
        )


class AdminDealRegisterView(APIView):
    """Registers an existing deal and issues invoice and partner commission credit."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        try:
            deal = Deal.objects.get(id=pk)
        except Deal.DoesNotExist:
            raise NotFound("Deal not found.")

        try:
            invoice = FinanceService.register_deal_and_credit_commission(
                deal=deal, actor=request.user
            )
        except Exception as e:
            if hasattr(e, "message_dict"):
                raise ValidationError(e.message_dict)
            raise ValidationError(str(e))

        return Response(
            {
                "success": True,
                "data": DealSerializer(deal).data,
                "invoice": InvoiceSerializer(invoice).data,
            }
        )


class AdminDealReverseView(APIView):
    """Reverses a registered deal commission and records a DEBIT ledger entry."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, pk):
        try:
            deal = Deal.objects.get(id=pk)
        except Deal.DoesNotExist:
            raise NotFound("Deal not found.")

        reason = request.data.get("reason", "")
        try:
            entry = FinanceService.reverse_deal_commission(
                deal=deal, reason=reason, actor=request.user
            )
        except Exception as e:
            if hasattr(e, "message_dict"):
                raise ValidationError(e.message_dict)
            raise ValidationError(str(e))

        return Response(
            {
                "success": True,
                "data": DealSerializer(deal).data,
                "ledger_entry": LedgerEntrySerializer(entry).data,
            }
        )


class AdminLedgerAdjustmentView(APIView):
    """
    Allows authorized finance admins to post manual double-entry ledger adjustments.
    """

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request):
        from apps.partners.models import PartnerProfile

        partner_id = request.data.get("partner_id")
        entry_type = request.data.get("entry_type")
        amount = request.data.get("amount")
        description = request.data.get("description", "")
        category = request.data.get("category", "ADJUSTMENT")

        if not partner_id or not entry_type or not amount or not description:
            raise ValidationError(
                "partner_id, entry_type, amount, and description are required."
            )

        try:
            partner = PartnerProfile.objects.get(id=partner_id)
        except PartnerProfile.DoesNotExist:
            raise NotFound("Partner profile not found.")

        from decimal import Decimal

        try:
            amount_dec = Decimal(str(amount))
        except Exception:
            raise ValidationError("Invalid monetary amount.")

        try:
            entry = FinanceService.record_ledger_entry(
                partner=partner,
                entry_type=entry_type,
                amount=amount_dec,
                category=category,
                description=description,
                actor=request.user,
            )
        except Exception as e:
            if hasattr(e, "message_dict"):
                raise ValidationError(e.message_dict)
            raise ValidationError(str(e))

        return Response(
            {"success": True, "data": LedgerEntrySerializer(entry).data},
            status=status.HTTP_201_CREATED,
        )
