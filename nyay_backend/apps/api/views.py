"""REST API views that expose the intelligent core to the Django layer."""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from nyay_backend.apps.intelligence_core import (
    calculate_case_strength,
    generate_heatmap_stats,
    get_mapped_context,
)
from nyay_backend.apps.intelligence_core.container import get_intelligence_core

from .serializers import (
    CaseStrengthRequestSerializer,
    IPCMappedContextRequestSerializer,
    SemanticSearchRequestSerializer,
)


class HealthView(APIView):
    """Simple readiness probe."""

    authentication_classes: list = []
    permission_classes: list = []

    def get(self, request, *_args, **_kwargs):
        return Response({"status": "ok"})


class SemanticSearchView(APIView):
    """Expose vector search over the BNS corpus."""

    def post(self, request, *_args, **_kwargs):
        serializer = SemanticSearchRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        core = get_intelligence_core()
        results = core.search(
            query=serializer.validated_data["query"],
            n_results=serializer.validated_data.get("n_results", 3),
        )
        return Response({"results": results})


class IPCMappedContextView(APIView):
    """Run IPC→BNS mapping and optionally boost the vector search."""

    def post(self, request, *_args, **_kwargs):
        serializer = IPCMappedContextRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        core = get_intelligence_core()
        payload = get_mapped_context(
            user_input=serializer.validated_data["user_input"],
            vector_store=core.vector_store,
            n_results=serializer.validated_data.get("n_results", 3),
        )
        return Response(payload)


class CaseStrengthView(APIView):
    """Score the available evidence using the heuristic meter."""

    def post(self, request, *_args, **_kwargs):
        serializer = CaseStrengthRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = calculate_case_strength(serializer.to_evidence_metadata())
        return Response(payload)


class JusticeHeatmapView(APIView):
    """Return the pre-computed justice gap dataset."""

    authentication_classes: list = []
    permission_classes: list = []

    def get(self, request, *_args, **_kwargs):
        payload = generate_heatmap_stats()
        return Response(payload, status=status.HTTP_200_OK)
