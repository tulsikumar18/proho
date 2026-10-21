"""
Standardized API error handling and RFC-7807 inspired response formatting.
"""

import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import (
    AuthenticationFailed,
    NotAuthenticated,
    PermissionDenied,
    NotFound,
    ValidationError,
)
from django.http import Http404
from django.core.exceptions import PermissionDenied as DjangoPermissionDenied

logger = logging.getLogger("proho.exceptions")


def custom_exception_handler(exc, context):
    """
    Transforms any DRF exception or unhandled error into a consistent format:
    {
        "success": False,
        "error": {
            "code": "ERROR_CODE",
            "message": "Human readable message",
            "details": {...} or null
        }
    }
    """
    # Call DRF's default exception handler first to get the standard response
    response = exception_handler(exc, context)

    if isinstance(exc, (NotAuthenticated, AuthenticationFailed)):
        error_code = "UNAUTHORIZED"
        message = "Authentication credentials were not provided or are invalid."
        details = response.data if response else None
    elif isinstance(exc, (PermissionDenied, DjangoPermissionDenied)):
        error_code = "PERMISSION_DENIED"
        message = "You do not have permission to perform this action."
        details = response.data if response else None
    elif isinstance(exc, (NotFound, Http404)):
        error_code = "NOT_FOUND"
        message = "The requested resource was not found."
        details = response.data if response else None
    elif isinstance(exc, ValidationError):
        error_code = "VALIDATION_ERROR"
        message = "Input validation failed. Please check the provided fields."
        details = response.data if response else None
    elif response is not None:
        error_code = getattr(exc, "default_code", "API_ERROR").upper()
        message = (
            str(exc.detail) if hasattr(exc, "detail") else "An API error occurred."
        )
        details = response.data
    else:
        # Unhandled 500 server error
        logger.exception(
            "Unhandled server exception encountered in API view", exc_info=exc
        )
        return Response(
            {
                "success": False,
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": (
                        "An unexpected server error occurred. Please try again later."
                    ),
                    "details": None,
                },
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # Format consistent response payload
    custom_payload = {
        "success": False,
        "error": {
            "code": error_code,
            "message": message,
            "details": details,
        },
    }

    response.data = custom_payload
    return response
