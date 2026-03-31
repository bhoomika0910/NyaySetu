"""URL routes for the public NyaySetu API."""

from django.urls import path

from .views import (
    CaseStrengthView,
    HealthView,
    IPCMappedContextView,
    JusticeHeatmapView,
    SemanticSearchView,
)

urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
    path("search/", SemanticSearchView.as_view(), name="semantic-search"),
    path("mapped-context/", IPCMappedContextView.as_view(), name="mapped-context"),
    path("case-strength/", CaseStrengthView.as_view(), name="case-strength"),
    path("justice-heatmap/", JusticeHeatmapView.as_view(), name="justice-heatmap"),
]
