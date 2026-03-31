"""Factory helpers for sharing a single NyaySetuIntelligence instance."""

from functools import lru_cache
from pathlib import Path

from django.conf import settings

from .intelligence_core import NyaySetuIntelligence


@lru_cache(maxsize=1)
def get_intelligence_core() -> NyaySetuIntelligence:
    """Return a cached NyaySetuIntelligence instance configured via settings."""
    pdf_path = Path(settings.BNS_PDF_PATH)
    persist_dir = Path(settings.CHROMA_DB_DIR)
    persist_dir.mkdir(parents=True, exist_ok=True)
    return NyaySetuIntelligence(pdf_path=pdf_path, persist_dir=persist_dir)
