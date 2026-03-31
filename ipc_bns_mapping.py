"""Compatibility shim for IPC↔BNS mapping utilities.

The authoritative mapping now lives inside
`nyay_backend.apps.intelligence_core.ipc_bns_mapping`.
"""

from nyay_backend.apps.intelligence_core.ipc_bns_mapping import (  # noqa: F401
    IPC_TO_BNS,
    get_all_mappings,
    get_ipc_section_info,
)

__all__ = [
    "IPC_TO_BNS",
    "get_all_mappings",
    "get_ipc_section_info",
]
