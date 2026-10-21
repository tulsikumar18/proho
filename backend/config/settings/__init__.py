"""Settings module selector."""

import os

env_name = os.environ.get("DJANGO_ENV", "development").lower()

if env_name == "production":
    from .production import *
elif env_name == "test":
    from .test import *
else:
    from .development import *
