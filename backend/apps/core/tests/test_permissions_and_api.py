"""
Tests for API error formatting, correlation IDs, and RBAC permissions.
"""

import pytest
from rest_framework.test import APIClient
from apps.accounts.models import User


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def partner_user(db):
    return User.objects.create_user(
        phone="+919811111111",
        password="TestPassword123!",
        role=User.Role.CHANNEL_PARTNER,
    )


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        phone="+919822222222",
        password="TestPassword123!",
        role=User.Role.ADMIN,
        is_staff=True,
    )


@pytest.fixture
def superadmin_user(db):
    return User.objects.create_superuser(
        phone="+919833333333",
        password="TestPassword123!",
    )


@pytest.mark.django_db
class TestApiPermissionsAndErrors:
    """Verifies RBAC boundaries, RFC-7807 error responses, and middleware."""

    def test_health_check_public(self, api_client):
        response = api_client.get("/api/v1/health/")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["status"] == "healthy"
        assert "X-Correlation-ID" in response.headers

    def test_correlation_id_propagated_or_generated(self, api_client):
        # Case 1: Client provides correlation ID
        custom_id = "custom-test-correlation-id-12345"
        response = api_client.get("/api/v1/health/", HTTP_X_CORRELATION_ID=custom_id)
        assert response.headers.get("X-Correlation-ID") == custom_id

        # Case 2: Server generates correlation ID
        response_gen = api_client.get("/api/v1/health/")
        assert response_gen.headers.get("X-Correlation-ID") is not None

    def test_unauthenticated_request_returns_rfc7807_error(self, api_client):
        response = api_client.get("/api/v1/test/partner/")
        assert response.status_code == 401
        data = response.json()
        assert data["success"] is False
        assert data["error"]["code"] == "UNAUTHORIZED"
        assert "message" in data["error"]

    def test_partner_endpoint_access(self, api_client, partner_user, admin_user):
        # Partner user succeeds
        api_client.force_authenticate(user=partner_user)
        response = api_client.get("/api/v1/test/partner/")
        assert response.status_code == 200
        assert response.json()["data"]["role"] == User.Role.CHANNEL_PARTNER

        # Admin user is forbidden on partner-only endpoint
        api_client.force_authenticate(user=admin_user)
        res_admin = api_client.get("/api/v1/test/partner/")
        assert res_admin.status_code == 403
        assert res_admin.json()["error"]["code"] == "PERMISSION_DENIED"

    def test_admin_endpoint_access(
        self, api_client, partner_user, admin_user, superadmin_user
    ):
        # Partner user forbidden on admin endpoint
        api_client.force_authenticate(user=partner_user)
        res_partner = api_client.get("/api/v1/test/admin/")
        assert res_partner.status_code == 403
        assert res_partner.json()["error"]["code"] == "PERMISSION_DENIED"

        # Admin user succeeds
        api_client.force_authenticate(user=admin_user)
        res_admin = api_client.get("/api/v1/test/admin/")
        assert res_admin.status_code == 200
        assert res_admin.json()["data"]["role"] == User.Role.ADMIN

        # Superadmin user succeeds
        api_client.force_authenticate(user=superadmin_user)
        res_super = api_client.get("/api/v1/test/admin/")
        assert res_super.status_code == 200

    def test_owner_or_admin_permission(self, api_client, partner_user, admin_user):
        api_client.force_authenticate(user=partner_user)
        response = api_client.get("/api/v1/test/owner/")
        assert response.status_code == 200

        api_client.force_authenticate(user=admin_user)
        res_admin = api_client.get("/api/v1/test/owner/")
        assert res_admin.status_code == 200

    def test_openapi_schema_generation(self, api_client):
        response = api_client.get("/api/v1/schema/")
        assert response.status_code == 200
        assert "openapi" in response.content.decode().lower()
