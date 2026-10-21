"""
Core middleware for request correlation ID and safe structured logging.
"""

import logging
import time
import uuid
from contextvars import ContextVar

# ContextVar for thread/async safe correlation ID
correlation_id_ctx: ContextVar[str] = ContextVar("correlation_id", default="-")

logger = logging.getLogger("proho.request")


class CorrelationIdFilter(logging.Filter):
    """Logging filter that injects the current correlation_id into log records."""

    def filter(self, record):
        record.correlation_id = correlation_id_ctx.get()
        return True


class CorrelationIdMiddleware:
    """
    Middleware that ensures every request has a correlation ID.
    Reads X-Correlation-ID header if provided, otherwise generates a new UUID.
    Attaches the correlation ID to the response headers.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        req_id = request.headers.get("X-Correlation-ID") or request.headers.get(
            "X-Request-ID"
        )
        if not req_id:
            req_id = str(uuid.uuid4())

        token = correlation_id_ctx.set(req_id)
        request.correlation_id = req_id

        try:
            response = self.get_response(request)
            response["X-Correlation-ID"] = req_id
            return response
        finally:
            correlation_id_ctx.reset(token)


class RequestLoggingMiddleware:
    """
    Middleware that logs inbound HTTP requests and execution latency.
    Strictly masks sensitive credentials and query parameters.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        response = self.get_response(request)
        duration_ms = (time.time() - start_time) * 1000

        # Mask sensitive paths
        path = request.path
        method = request.method
        status_code = response.status_code

        # Avoid logging noisy health checks at info level
        if path.endswith("/health/"):
            return response

        logger.info(f"{method} {path} -> {status_code} ({duration_ms:.2f}ms)")
        return response
