"""WSGI config for NyaySetu backend."""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "nyay_backend.backend_config.settings")

application = get_wsgi_application()
