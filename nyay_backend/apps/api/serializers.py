"""DRF serializers for the NyaySetu backend endpoints."""

from rest_framework import serializers


class SemanticSearchRequestSerializer(serializers.Serializer):
    query = serializers.CharField(max_length=2000)
    n_results = serializers.IntegerField(min_value=1, max_value=10, default=3)


class IPCMappedContextRequestSerializer(serializers.Serializer):
    user_input = serializers.CharField(max_length=4000)
    n_results = serializers.IntegerField(min_value=1, max_value=10, default=3)


class CaseStrengthRequestSerializer(serializers.Serializer):
    direct_evidence = serializers.ListField(
        child=serializers.CharField(max_length=100), required=False, default=list
    )
    witness_credibility = serializers.ListField(
        child=serializers.CharField(max_length=100), required=False, default=list
    )
    precedent = serializers.ListField(
        child=serializers.CharField(max_length=100), required=False, default=list
    )

    def to_evidence_metadata(self) -> dict:
        return {
            "direct_evidence": self.validated_data.get("direct_evidence", []),
            "witness_credibility": self.validated_data.get("witness_credibility", []),
            "precedent": self.validated_data.get("precedent", []),
        }
