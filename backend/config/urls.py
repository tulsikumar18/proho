"""
Proho URL Configuration.
All API endpoints are versioned under /api/v1/.
"""

from django.contrib import admin
from django.urls import path, include
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
    # Authorization foundation test endpoints
    path("test/partner/", PartnerTestView.as_view(), name="test_partner_endpoint"),
    path("test/admin/", AdminTestView.as_view(), name="test_admin_endpoint"),
    path("test/owner/", OwnerTestView.as_view(), name="test_owner_endpoint"),
]

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include((v1_patterns, "v1"))),
]
