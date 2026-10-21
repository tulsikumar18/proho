"""Testing settings for Proho backend."""

from .base import *

DEBUG = False
# Use in-memory SQLite for rapid test execution
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]
