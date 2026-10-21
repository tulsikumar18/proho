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
    # Authorization foundation test endpoints
    path("test/partner/", PartnerTestView.as_view(), name="test_partner_endpoint"),
    path("test/admin/", AdminTestView.as_view(), name="test_admin_endpoint"),
    path("test/owner/", OwnerTestView.as_view(), name="test_owner_endpoint"),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include((v1_patterns, "v1"))),
]
