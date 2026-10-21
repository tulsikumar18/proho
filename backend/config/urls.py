"""
Proho URL Configuration.
All API endpoints are versioned under /api/v1/.
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from apps.core.views import (
    HealthCheckView,
    PartnerTestView,
    AdminTestView,
    OwnerTestView,
)
from apps.accounts.views import (
    OtpRequestView,
    OtpVerifyView,
    CurrentUserView,
)
from apps.partners.views import (
    PartnerProfileView,
    PartnerKycView,
    PartnerBankAccountListView,
    AdminKycListView,
    AdminKycDetailView,
    AdminKycReviewView,
)
from apps.properties.views import (
    SellingInventoryListView,
    PartnerPropertyListCreateView,
    PartnerPropertyDetailView,
    PartnerPropertySubmitView,
    PropertyMediaListCreateView,
    PropertyMediaDetailView,
    AdminPropertyListView,
    AdminPropertyReviewView,
    AdminPropertyArchiveView,
)
from apps.leads.views import (
    PartnerLeadListCreateView,
    PartnerLeadDetailView,
    ReferralTokenCreateView,
    PublicReferralTokenResolveView,
)
from apps.offers.views import (
    OfferListCreateView,
    OfferDetailView,
    OfferSubmitView,
    OfferReviewView,
    OfferCounterView,
)
from apps.visits.views import (
    BookingListCreateView,
    BookingDetailView,
    BookingCancelView,
    BookingConfirmView,
    VisitListScheduleView,
    VisitDetailView,
    VisitCancelView,
    VisitRescheduleView,
    VisitOtpRequestView,
    VisitOtpVerifyView,
)

v1_patterns = [
    # Core health & infrastructure
    path("health/", HealthCheckView.as_view(), name="health_check"),
    # OpenAPI Documentation
    path("schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
    # Authentication (Phone OTP & JWT)
    path("auth/otp/request/", OtpRequestView.as_view(), name="auth_otp_request"),
    path("auth/otp/verify/", OtpVerifyView.as_view(), name="auth_otp_verify"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="auth_token_refresh"),
    path("auth/me/", CurrentUserView.as_view(), name="auth_me"),
    # Partner Profiles, KYC, and Bank Accounts
    path("partner/profile/", PartnerProfileView.as_view(), name="partner_profile"),
    path("partner/kyc/", PartnerKycView.as_view(), name="partner_kyc"),
    path(
        "partner/bank-accounts/",
        PartnerBankAccountListView.as_view(),
        name="partner_bank_accounts",
    ),
    # Admin Operations (KYC Review)
    path("admin/kyc/", AdminKycListView.as_view(), name="admin_kyc_list"),
    path("admin/kyc/<uuid:pk>/", AdminKycDetailView.as_view(), name="admin_kyc_detail"),
    path(
        "admin/kyc/<uuid:pk>/review/",
        AdminKycReviewView.as_view(),
        name="admin_kyc_review",
    ),
    # Properties & Inventory Management (Phase 3)
    path(
        "properties/inventory/",
        SellingInventoryListView.as_view(),
        name="selling_inventory_list",
    ),
    path(
        "properties/",
        PartnerPropertyListCreateView.as_view(),
        name="partner_property_list_create",
    ),
    path(
        "properties/<uuid:pk>/",
        PartnerPropertyDetailView.as_view(),
        name="partner_property_detail",
    ),
    path(
        "properties/<uuid:pk>/submit/",
        PartnerPropertySubmitView.as_view(),
        name="partner_property_submit",
    ),
    path(
        "properties/<uuid:pk>/media/",
        PropertyMediaListCreateView.as_view(),
        name="property_media_list_create",
    ),
    path(
        "properties/<uuid:pk>/media/<uuid:media_id>/",
        PropertyMediaDetailView.as_view(),
        name="property_media_detail",
    ),
    path(
        "admin/properties/",
        AdminPropertyListView.as_view(),
        name="admin_property_list",
    ),
    path(
        "admin/properties/<uuid:pk>/review/",
        AdminPropertyReviewView.as_view(),
        name="admin_property_review",
    ),
    path(
        "admin/properties/<uuid:pk>/archive/",
        AdminPropertyArchiveView.as_view(),
        name="admin_property_archive",
    ),
    # Leads & Referrals (Phase 4)
    path("leads/", PartnerLeadListCreateView.as_view(), name="lead_list_create"),
    path("leads/<uuid:pk>/", PartnerLeadDetailView.as_view(), name="lead_detail"),
    path(
        "leads/share-property/",
        ReferralTokenCreateView.as_view(),
        name="referral_token_create",
    ),
    path(
        "leads/referral-token/<str:token>/",
        PublicReferralTokenResolveView.as_view(),
        name="referral_token_resolve",
    ),
    # Offers & Counteroffers (Phase 4)
    path("offers/", OfferListCreateView.as_view(), name="offer_list_create"),
    path("offers/<uuid:pk>/", OfferDetailView.as_view(), name="offer_detail"),
    path(
        "offers/<uuid:pk>/submit/",
        OfferSubmitView.as_view(),
        name="offer_submit",
    ),
    path(
        "offers/<uuid:pk>/review/",
        OfferReviewView.as_view(),
        name="offer_review",
    ),
    path(
        "offers/<uuid:pk>/counter/",
        OfferCounterView.as_view(),
        name="offer_counter",
    ),
    # Bookings & Visits (Phase 4)
    path(
        "bookings/",
        BookingListCreateView.as_view(),
        name="booking_list_create",
    ),
    path(
        "bookings/<uuid:pk>/",
        BookingDetailView.as_view(),
        name="booking_detail",
    ),
    path(
        "bookings/<uuid:pk>/cancel/",
        BookingCancelView.as_view(),
        name="booking_cancel",
    ),
    path(
        "bookings/<uuid:pk>/confirm/",
        BookingConfirmView.as_view(),
        name="booking_confirm",
    ),
    path("visits/", VisitListScheduleView.as_view(), name="visit_list_schedule"),
    path("visits/<uuid:pk>/", VisitDetailView.as_view(), name="visit_detail"),
    path(
        "visits/<uuid:pk>/cancel/",
        VisitCancelView.as_view(),
        name="visit_cancel",
    ),
    path(
        "visits/<uuid:pk>/reschedule/",
        VisitRescheduleView.as_view(),
        name="visit_reschedule",
    ),
    path(
        "visits/<uuid:pk>/request-otp/",
        VisitOtpRequestView.as_view(),
        name="visit_otp_request",
    ),
    path(
        "visits/<uuid:pk>/verify-otp/",
        VisitOtpVerifyView.as_view(),
        name="visit_otp_verify",
    ),
    # Authorization foundation test endpoints
    path("test/partner/", PartnerTestView.as_view(), name="test_partner_endpoint"),
    path("test/admin/", AdminTestView.as_view(), name="test_admin_endpoint"),
    path("test/owner/", OwnerTestView.as_view(), name="test_owner_endpoint"),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include((v1_patterns, "v1"))),
]
