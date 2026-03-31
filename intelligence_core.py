"""Compatibility wrapper for legacy imports.

This module now simply re-exports the core intelligence utilities from
`nyay_backend.apps.intelligence_core`. Existing scripts that imported
`intelligence_core` from the repository root can continue to do so without
modification.
"""

from nyay_backend.apps.intelligence_core.intelligence_core import (  # noqa: F401
    LegalVectorStore,
    NyaySetuIntelligence,
    calculate_case_strength,
    generate_heatmap_stats,
    get_mapped_context,
)

__all__ = [
    "LegalVectorStore",
    "NyaySetuIntelligence",
    "calculate_case_strength",
    "generate_heatmap_stats",
    "get_mapped_context",
]
