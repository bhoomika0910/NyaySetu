"""Root URL configuration for NyaySetu backend."""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("nyay_backend.apps.api.urls")),
]
