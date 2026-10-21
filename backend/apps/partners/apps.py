from django.apps import AppConfig


class PartnersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.partners"
    verbose_name = "Partner Profiles & KYC"

    def ready(self):
        import apps.partners.signals  # noqa: F401
