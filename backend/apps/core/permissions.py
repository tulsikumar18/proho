"""
Core role-based and object-level permissions.
"""

from rest_framework.permissions import BasePermission


class IsPartner(BasePermission):
    """
    Allows access only to authenticated users with the CHANNEL_PARTNER role.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "is_partner", False)
        )


class IsAdmin(BasePermission):
    """
    Allows access to operational staff (ADMIN or SUPERADMIN role, or is_staff).
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                getattr(request.user, "is_admin", False)
                or getattr(request.user, "is_superadmin", False)
                or request.user.is_staff
            )
        )


class IsSuperAdmin(BasePermission):
    """
    Allows access only to system superadmins.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                getattr(request.user, "is_superadmin", False)
                or request.user.is_superuser
            )
        )


class IsOwnerOrAdmin(BasePermission):
    """
    Object-level permission allowing access to object owner or admin staff.
    Supports objects referencing user directly (`obj.user`), via partner profile
    (`obj.partner.user`), or if the object is the user instance itself.
    """

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        # Admins and Superadmins have global object access
        if (
            getattr(request.user, "is_admin", False)
            or getattr(request.user, "is_superadmin", False)
            or request.user.is_staff
        ):
            return True

        # If object is the user model itself
        if obj == request.user:
            return True

        # If object has direct 'user' attribute
        if hasattr(obj, "user") and obj.user == request.user:
            return True

        # If object has 'partner' attribute with 'user'
        if hasattr(obj, "partner") and hasattr(obj.partner, "user"):
            return obj.partner.user == request.user

        return False
