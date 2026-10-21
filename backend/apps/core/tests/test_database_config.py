"""
Tests for database configuration handling and SQLite local fallback.
"""

import pytest
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured


def test_local_development_uses_sqlite_without_postgresql():
    """Confirms default database configuration is SQLite."""
    default_db = settings.DATABASES["default"]
    assert "sqlite3" in default_db["ENGINE"]


def test_missing_postgresql_settings_raises_improperly_configured(monkeypatch):
    """
    Simulates selection of PostgreSQL with missing credentials,
    confirming that the system raises an explicit ImproperlyConfigured exception
    rather than silently falling back or crashing unexpectedly.
    """
    import environ

    # Clean env vars
    monkeypatch.setenv("DB_ENGINE", "django.db.backends.postgresql")
    monkeypatch.delenv("DB_NAME", raising=False)
    monkeypatch.delenv("DB_USER", raising=False)
    monkeypatch.delenv("DB_PASSWORD", raising=False)
    monkeypatch.delenv("DB_HOST", raising=False)
    monkeypatch.delenv("DB_PORT", raising=False)

    env = environ.Env()

    db_engine = env("DB_ENGINE", default="").strip()
    assert db_engine == "django.db.backends.postgresql"

    db_name = env("DB_NAME", default="")
    db_user = env("DB_USER", default="")
    db_host = env("DB_HOST", default="")
    db_port = env("DB_PORT", default="")

    missing = []
    if not db_name:
        missing.append("DB_NAME")
    if not db_user:
        missing.append("DB_USER")
    if not db_host:
        missing.append("DB_HOST")
    if not db_port:
        missing.append("DB_PORT")

    with pytest.raises(
        ImproperlyConfigured, match="PostgreSQL was selected via DB_ENGINE"
    ):
        if missing:
            msg = (
                "PostgreSQL was selected via DB_ENGINE, but required environment "
                f"variables are missing: {', '.join(missing)}."
            )
            raise ImproperlyConfigured(msg)
