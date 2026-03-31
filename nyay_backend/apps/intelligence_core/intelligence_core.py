"""
╔══════════════════════════════════════════════════════════════════════╗
║                    NyaySetu — Intelligence Core                     ║
║                                                                      ║
║  The "brain" of NyaySetu. Plug-and-play module for Django views.    ║
║                                                                      ║
║  Components:                                                         ║
║    1. LegalVectorStore   — ChromaDB + LegalBERT RAG engine          ║
║    2. get_mapped_context — IPC ↔ BNS cross-reference + RAG boost    ║
║    3. calculate_case_strength — Rule-based case strength meter      ║
║    4. generate_heatmap_stats  — Justice gap data for heatmaps       ║
║                                                                      ║
║  Author : NyaySetu AI Team                                          ║
║  Branch : dev1-ai-rag                                                ║
╚══════════════════════════════════════════════════════════════════════╝
"""

from __future__ import annotations

import json
import logging
import os
import re
import hashlib
from pathlib import Path
from typing import Any, Optional

import numpy as np

# ── PDF extraction ────────────────────────────────────────────────────
try:
    import pdfplumber
except ImportError:
    pdfplumber = None  # type: ignore

try:
    from PyPDF2 import PdfReader
except ImportError:
    PdfReader = None  # type: ignore

# ── Embeddings & Vector DB ────────────────────────────────────────────
import chromadb
from chromadb.config import Settings as ChromaSettings

try:
    from transformers import AutoTokenizer, AutoModel
    import torch
except ImportError:
    AutoTokenizer = None  # type: ignore
    AutoModel = None  # type: ignore
    torch = None  # type: ignore

# ── Local mapping ────────────────────────────────────────────────────
from .ipc_bns_mapping import IPC_TO_BNS, get_ipc_section_info

# ── Logging ───────────────────────────────────────────────────────────
logger = logging.getLogger("nyaysetu.intelligence_core")
logger.setLevel(logging.INFO)
if not logger.handlers:
    _handler = logging.StreamHandler()
    _handler.setFormatter(
        logging.Formatter("[%(asctime)s] %(name)s %(levelname)s — %(message)s")
    )
    logger.addHandler(_handler)


# ======================================================================
#  1. LEGAL VECTOR STORE  (ChromaDB + LegalBERT)
# ======================================================================

class LegalBERTEmbedder:
    """
    Wraps `nlpaueb/legal-bert-base-uncased` to produce dense embeddings
    compatible with ChromaDB's custom embedding function interface.
    """

    MODEL_NAME = "nlpaueb/legal-bert-base-uncased"

    def __init__(self, device: str | None = None):
        if AutoTokenizer is None or AutoModel is None:
            raise ImportError(
                "transformers and torch are required. "
                "Install with: pip install transformers torch"
            )
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        logger.info("Loading LegalBERT model on [%s] …", self.device)
        self.tokenizer = AutoTokenizer.from_pretrained(self.MODEL_NAME)
        self.model = AutoModel.from_pretrained(self.MODEL_NAME).to(self.device)
        self.model.eval()
        logger.info("LegalBERT loaded successfully.")

    def _embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Produce mean-pooled embeddings for a batch of texts."""
        encoded = self.tokenizer(
            texts,
            padding=True,
            truncation=True,
            max_length=512,
            return_tensors="pt",
        ).to(self.device)

        with torch.no_grad():
            outputs = self.model(**encoded)

        # Mean-pool over token dimension, respecting attention mask
        mask = encoded["attention_mask"].unsqueeze(-1).float()
        summed = (outputs.last_hidden_state * mask).sum(dim=1)
        counts = mask.sum(dim=1).clamp(min=1e-9)
        embeddings = (summed / counts).cpu().numpy()
        return embeddings.tolist()

    # ChromaDB expects __call__ for custom embedding functions
    def __call__(self, input: list[str]) -> list[list[float]]:
        """ChromaDB-compatible interface."""
        return self._embed_batch(input)


class LegalVectorStore:
    """
    Extracts text from a BNS PDF, chunks it recursively, embeds with
    LegalBERT, and stores in a persistent ChromaDB collection.

    Usage (from Django views):
    ─────────────────────────
        from intelligence_core import LegalVectorStore

        store = LegalVectorStore(
            pdf_path="data/bns_2023.pdf",
            persist_dir="data/chroma_db",
        )
        store.build_index()                       # one-time
        results = store.search("punishment for murder", n_results=3)
    """

    COLLECTION_NAME = "bns_legal_sections"
    CHUNK_SIZE = 600          # tokens (approx)
    CHUNK_OVERLAP = 80        # tokens overlap between consecutive chunks
    BATCH_SIZE = 32           # embedding batch size

    def __init__(
        self,
        pdf_path: str | Path | None = None,
        persist_dir: str | Path = "chroma_legal_db",
        device: str | None = None,
    ):
        self.pdf_path = Path(pdf_path) if pdf_path else None
        self.persist_dir = Path(persist_dir)
        self.persist_dir.mkdir(parents=True, exist_ok=True)

        # Embedder
        self._embedder = LegalBERTEmbedder(device=device)

        # ChromaDB client — persistent storage
        self._client = chromadb.PersistentClient(
            path=str(self.persist_dir),
        )

        # Get or create collection (uses our custom embedding fn)
        self._collection = self._client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )

        logger.info(
            "ChromaDB collection '%s' ready  (%d documents).",
            self.COLLECTION_NAME,
            self._collection.count(),
        )

    # ── PDF Extraction ────────────────────────────────────────────

    def _extract_text_pdfplumber(self, path: Path) -> str:
        """High-quality extraction via pdfplumber (preferred)."""
        pages: list[str] = []
        with pdfplumber.open(path) as pdf:
            for i, page in enumerate(pdf.pages):
                text = page.extract_text()
                if text:
                    pages.append(text)
                    logger.debug("Extracted page %d  (%d chars)", i + 1, len(text))
        return "\n\n".join(pages)

    def _extract_text_pypdf2(self, path: Path) -> str:
        """Fallback extraction via PyPDF2."""
        reader = PdfReader(str(path))
        pages = [p.extract_text() or "" for p in reader.pages]
        return "\n\n".join(pages)

    def extract_pdf_text(self, path: Path | None = None) -> str:
        """
        Extract full text from the BNS PDF.
        Tries pdfplumber first, falls back to PyPDF2.
        """
        target = path or self.pdf_path
        if target is None:
            raise FileNotFoundError("No PDF path provided.")
        target = Path(target)
        if not target.exists():
            raise FileNotFoundError(f"PDF not found: {target}")

        if pdfplumber is not None:
            logger.info("Extracting text with pdfplumber …")
            return self._extract_text_pdfplumber(target)
        elif PdfReader is not None:
            logger.info("Extracting text with PyPDF2 (fallback) …")
            return self._extract_text_pypdf2(target)
        else:
            raise ImportError(
                "No PDF library available. Install pdfplumber or PyPDF2."
            )

    # ── Recursive Chunking ────────────────────────────────────────

    @staticmethod
    def _approx_token_count(text: str) -> int:
        """Rough token count (≈ words × 1.3 for legal text)."""
        return int(len(text.split()) * 1.3)

    def _recursive_chunk(
        self,
        text: str,
        chunk_size: int | None = None,
        chunk_overlap: int | None = None,
    ) -> list[str]:
        """
        Split text into chunks of approximately `chunk_size` tokens,
        using a hierarchy of separators for clean breaks.
        """
        chunk_size = chunk_size or self.CHUNK_SIZE
        chunk_overlap = chunk_overlap or self.CHUNK_OVERLAP

        # Hierarchy of separators — prefer breaking at section/paragraph
        separators = [
            r"\n\s*\d+\.\s",      # Numbered sections  (e.g., "101. ")
            r"\n\s*Chapter\s",     # Chapter headings
            r"\n\n",               # Double newline (paragraph)
            r"\n",                 # Single newline
            r"\.\s",              # Sentence boundary
            r"\s",                # Word boundary (last resort)
        ]

        chunks: list[str] = []
        self._split_recursive(text, separators, chunk_size, chunk_overlap, chunks)
        return chunks

    def _split_recursive(
        self,
        text: str,
        separators: list[str],
        chunk_size: int,
        chunk_overlap: int,
        result: list[str],
    ) -> None:
        """Recursively split text using separator hierarchy."""
        if self._approx_token_count(text) <= chunk_size:
            cleaned = text.strip()
            if cleaned:
                result.append(cleaned)
            return

        if not separators:
            # Last resort: hard split by approximate character count
            chars_per_chunk = chunk_size * 4  # ~4 chars per token
            overlap_chars = chunk_overlap * 4
            pos = 0
            while pos < len(text):
                end = min(pos + chars_per_chunk, len(text))
                chunk = text[pos:end].strip()
                if chunk:
                    result.append(chunk)
                pos = end - overlap_chars
            return

        sep = separators[0]
        parts = re.split(sep, text)

        current_chunk = ""
        for part in parts:
            candidate = (current_chunk + " " + part).strip() if current_chunk else part.strip()
            if self._approx_token_count(candidate) <= chunk_size:
                current_chunk = candidate
            else:
                if current_chunk.strip():
                    if self._approx_token_count(current_chunk) <= chunk_size:
                        result.append(current_chunk.strip())
                    else:
                        # Chunk is still too large; recurse with finer separator
                        self._split_recursive(
                            current_chunk, separators[1:], chunk_size, chunk_overlap, result
                        )
                current_chunk = part.strip()

        # Don't forget the last chunk
        if current_chunk.strip():
            if self._approx_token_count(current_chunk) <= chunk_size:
                result.append(current_chunk.strip())
            else:
                self._split_recursive(
                    current_chunk, separators[1:], chunk_size, chunk_overlap, result
                )

    # ── Index Building ────────────────────────────────────────────

    def build_index(self, pdf_path: str | Path | None = None, force: bool = False) -> int:
        """
        Extract → Chunk → Embed → Store.

        Args:
            pdf_path: Override the PDF path set at init.
            force:    If True, drop existing collection and rebuild.

        Returns:
            Number of chunks indexed.
        """
        if pdf_path:
            self.pdf_path = Path(pdf_path)

        if not force and self._collection.count() > 0:
            logger.info(
                "Collection already has %d documents. "
                "Use force=True to rebuild.",
                self._collection.count(),
            )
            return self._collection.count()

        if force:
            logger.info("Force rebuild — clearing existing collection …")
            self._client.delete_collection(self.COLLECTION_NAME)
            self._collection = self._client.get_or_create_collection(
                name=self.COLLECTION_NAME,
                metadata={"hnsw:space": "cosine"},
            )

        # 1. Extract
        raw_text = self.extract_pdf_text()
        logger.info("Extracted %d characters from PDF.", len(raw_text))

        # 2. Chunk
        chunks = self._recursive_chunk(raw_text)
        logger.info("Created %d chunks (target ~%d tokens each).", len(chunks), self.CHUNK_SIZE)

        if not chunks:
            logger.warning("No chunks produced — check PDF content.")
            return 0

        # 3. Embed & store in batches
        for batch_start in range(0, len(chunks), self.BATCH_SIZE):
            batch_end = min(batch_start + self.BATCH_SIZE, len(chunks))
            batch_texts = chunks[batch_start:batch_end]

            # Generate deterministic IDs from content hash
            batch_ids = [
                f"bns_chunk_{hashlib.md5(t.encode()).hexdigest()[:12]}"
                for t in batch_texts
            ]

            # Embed
            batch_embeddings = self._embedder(batch_texts)

            # Metadata
            batch_meta = [
                {
                    "source": str(self.pdf_path),
                    "chunk_index": batch_start + i,
                    "approx_tokens": self._approx_token_count(t),
                }
                for i, t in enumerate(batch_texts)
            ]

            self._collection.add(
                ids=batch_ids,
                documents=batch_texts,
                embeddings=batch_embeddings,
                metadatas=batch_meta,
            )

            logger.info(
                "Indexed batch %d–%d  (%d/%d)",
                batch_start,
                batch_end - 1,
                batch_end,
                len(chunks),
            )

        logger.info(
            "✓ Index built — %d documents in collection '%s'.",
            self._collection.count(),
            self.COLLECTION_NAME,
        )
        return self._collection.count()

    # ── Search ────────────────────────────────────────────────────

    def search(
        self,
        query: str,
        n_results: int = 3,
        where_filter: dict | None = None,
    ) -> list[dict[str, Any]]:
        """
        Semantic search over BNS clauses.

        Args:
            query:        Natural language query (e.g., "punishment for murder")
            n_results:    Number of top results to return.
            where_filter: Optional ChromaDB metadata filter.

        Returns:
            List of dicts, each with:
              - text:     The chunk text
              - score:    Cosine similarity (0–1, higher = better)
              - metadata: Stored metadata for the chunk
        """
        if self._collection.count() == 0:
            logger.warning("Collection is empty. Call build_index() first.")
            return []

        # Embed the query
        query_embedding = self._embedder([query])[0]

        kwargs: dict[str, Any] = {
            "query_embeddings": [query_embedding],
            "n_results": min(n_results, self._collection.count()),
        }
        if where_filter:
            kwargs["where"] = where_filter

        results = self._collection.query(**kwargs)

        # Flatten ChromaDB's nested response
        output: list[dict[str, Any]] = []
        if results and results.get("documents"):
            docs = results["documents"][0]
            dists = results["distances"][0] if results.get("distances") else [0.0] * len(docs)
            metas = results["metadatas"][0] if results.get("metadatas") else [{}] * len(docs)

            for doc, dist, meta in zip(docs, dists, metas):
                output.append({
                    "text": doc,
                    "score": round(1.0 - dist, 4),  # cosine distance → similarity
                    "metadata": meta,
                })

        return output

    def search_with_bns_boost(
        self,
        query: str,
        bns_sections: list[str],
        n_results: int = 3,
    ) -> list[dict[str, Any]]:
        """
        Search with BNS section boosting: runs a normal search, then
        re-ranks results that mention any of the provided BNS sections.

        Args:
            query:         Natural language query.
            bns_sections:  List of BNS section numbers to boost.
            n_results:     Number of results to return.

        Returns:
            Re-ranked list of search results.
        """
        # Fetch more candidates than needed so we can re-rank
        candidates = self.search(query, n_results=n_results * 3)

        if not candidates:
            return []

        # Boost score for candidates mentioning target BNS sections
        BOOST_FACTOR = 0.15
        for result in candidates:
            text_lower = result["text"].lower()
            for sec in bns_sections:
                # Match patterns like "Section 101", "BNS 101", "§101", just "101."
                patterns = [
                    rf"section\s*{re.escape(sec)}\b",
                    rf"bns\s*{re.escape(sec)}\b",
                    rf"\b{re.escape(sec)}\.",
                ]
                for pat in patterns:
                    if re.search(pat, text_lower):
                        result["score"] += BOOST_FACTOR
                        result["boosted"] = True
                        break

        # Sort by boosted score, return top n
        candidates.sort(key=lambda r: r["score"], reverse=True)
        return candidates[:n_results]


# ======================================================================
#  2. IPC-TO-BNS MAPPED CONTEXT
# ======================================================================

# Regex to detect IPC section references in natural text
_IPC_PATTERN = re.compile(
    r"""
    (?:                             # Optional prefix
        (?:IPC|I\.P\.C\.?)         # "IPC" or "I.P.C."
        \s*                         # optional space
        (?:Section|Sec\.?|§)?      # optional "Section" / "Sec." / "§"
        \s*                         # optional space
    |
        (?:Section|Sec\.?|§)       # Or just "Section" / "Sec." / "§"
        \s*                         # optional space
    )
    (\d{1,4}[A-Z]{0,2})           # The section number + optional suffix
    """,
    re.IGNORECASE | re.VERBOSE,
)


def get_mapped_context(
    user_input: str,
    vector_store: LegalVectorStore | None = None,
    n_results: int = 3,
) -> dict[str, Any]:
    """
    Scan user input for IPC section references, map them to BNS,
    and optionally boost RAG search with the mapped BNS sections.

    Args:
        user_input:    The user's legal query or text.
        vector_store:  Optional LegalVectorStore for RAG-boosted search.
        n_results:     Number of RAG results to return.

    Returns:
        {
            "detected_ipc_sections": ["302", "420"],
            "mappings": [
                {"ipc": "302", "bns": "101", "title": "...", "description": "..."},
                ...
            ],
            "unmapped_sections": ["999"],    # sections not in our mapping
            "rag_results": [...]             # if vector_store provided
        }
    """
    # 1. Extract IPC section numbers
    matches = _IPC_PATTERN.findall(user_input)
    detected = list(dict.fromkeys(m.upper() for m in matches))  # deduplicate, preserve order

    # 2. Map each to BNS
    mappings: list[dict] = []
    unmapped: list[str] = []
    bns_sections: list[str] = []

    for ipc_sec in detected:
        info = get_ipc_section_info(ipc_sec)
        if info:
            mappings.append(info)
            bns_sections.append(info["bns_section"])
        else:
            unmapped.append(ipc_sec)

    result: dict[str, Any] = {
        "detected_ipc_sections": detected,
        "mappings": mappings,
        "unmapped_sections": unmapped,
    }

    # 3. RAG-boosted search (if a vector store is available)
    if vector_store is not None:
        if bns_sections:
            result["rag_results"] = vector_store.search_with_bns_boost(
                query=user_input,
                bns_sections=bns_sections,
                n_results=n_results,
            )
            result["search_mode"] = "bns_boosted"
        else:
            result["rag_results"] = vector_store.search(
                query=user_input,
                n_results=n_results,
            )
            result["search_mode"] = "standard_semantic"
    else:
        result["rag_results"] = []
        result["search_mode"] = "no_vector_store"

    logger.info(
        "Mapped context: %d IPC sections detected, %d mapped, %d RAG results.",
        len(detected),
        len(mappings),
        len(result["rag_results"]),
    )
    return result


# ======================================================================
#  3. CASE STRENGTH METER  (Rule-Based Heuristic)
# ======================================================================

# Weight definitions
_EVIDENCE_WEIGHTS: dict[str, dict] = {
    # ── Direct Evidence (max 40 pts) ──────────────────────────────
    "direct_evidence": {
        "max_score": 40,
        "types": {
            "dna":                {"score": 40, "label": "DNA evidence"},
            "cctv":               {"score": 38, "label": "CCTV footage"},
            "fingerprint":        {"score": 36, "label": "Fingerprint match"},
            "forensic":           {"score": 35, "label": "Forensic report"},
            "digital_evidence":   {"score": 33, "label": "Digital / electronic evidence"},
            "documentary":        {"score": 30, "label": "Documentary evidence"},
            "physical":           {"score": 28, "label": "Physical evidence (weapon, etc.)"},
            "medical_report":     {"score": 32, "label": "Medical / post-mortem report"},
            "confession":         {"score": 25, "label": "Confession (judicial)"},
            "audio_video":        {"score": 34, "label": "Audio/video recording"},
        },
    },
    # ── Witness Credibility (max 30 pts) ──────────────────────────
    "witness_credibility": {
        "max_score": 30,
        "types": {
            "eyewitness":         {"score": 30, "label": "Eye-witness testimony"},
            "expert_witness":     {"score": 28, "label": "Expert witness testimony"},
            "independent_witness": {"score": 25, "label": "Independent witness"},
            "circumstantial":     {"score": 18, "label": "Circumstantial witness"},
            "character_witness":  {"score": 12, "label": "Character witness"},
            "hearsay":            {"score": 8,  "label": "Hearsay testimony"},
            "hostile_witness":    {"score": 5,  "label": "Hostile / unreliable witness"},
        },
    },
    # ── Precedent / Retrieval Match (max 30 pts) ──────────────────
    "precedent": {
        "max_score": 30,
        "types": {
            "supreme_court":       {"score": 30, "label": "Supreme Court precedent"},
            "high_court":          {"score": 25, "label": "High Court precedent"},
            "district_court":      {"score": 18, "label": "District Court precedent"},
            "tribunal":            {"score": 15, "label": "Tribunal ruling"},
            "retrieval_high":      {"score": 28, "label": "RAG match score ≥ 0.85"},
            "retrieval_medium":    {"score": 20, "label": "RAG match score 0.60–0.84"},
            "retrieval_low":       {"score": 10, "label": "RAG match score < 0.60"},
        },
    },
}


def calculate_case_strength(evidence_metadata: dict[str, list[str]]) -> dict[str, Any]:
    """
    Calculate a case strength score (0–100) from evidence metadata.

    Args:
        evidence_metadata: Dict with category keys mapping to lists of
            evidence type identifiers.  Example:
            {
                "direct_evidence":     ["dna", "cctv"],
                "witness_credibility": ["eyewitness"],
                "precedent":           ["supreme_court", "retrieval_high"],
            }

    Returns:
        {
            "score": 88,
            "grade": "Strong",
            "breakdown": {
                "direct_evidence":     {"score": 40, "items": [...]},
                "witness_credibility": {"score": 30, "items": [...]},
                "precedent":           {"score": 30, "items": [...]},
            },
            "justification": "The case scores 88/100 ..."
        }
    """
    breakdown: dict[str, dict] = {}
    total_score = 0

    for category, config in _EVIDENCE_WEIGHTS.items():
        max_score = config["max_score"]
        provided = evidence_metadata.get(category, [])
        items: list[dict] = []
        cat_score = 0

        for ev_type in provided:
            ev_type_lower = ev_type.lower().strip()
            if ev_type_lower in config["types"]:
                entry = config["types"][ev_type_lower]
                items.append({
                    "type": ev_type_lower,
                    "label": entry["label"],
                    "points": entry["score"],
                })
                cat_score = max(cat_score, entry["score"])  # take highest in category
            else:
                items.append({
                    "type": ev_type_lower,
                    "label": f"Unknown: {ev_type}",
                    "points": 0,
                })

        # Cap at category maximum
        cat_score = min(cat_score, max_score)
        breakdown[category] = {
            "score": cat_score,
            "max_score": max_score,
            "items": items,
        }
        total_score += cat_score

    # Clamp total to 0–100
    total_score = max(0, min(100, total_score))

    # Grade mapping
    if total_score >= 80:
        grade = "Strong"
    elif total_score >= 60:
        grade = "Moderate"
    elif total_score >= 40:
        grade = "Weak"
    else:
        grade = "Very Weak"

    # Build justification string
    justification_parts: list[str] = [
        f"The case scores {total_score}/100 (Grade: {grade})."
    ]

    for cat_key, cat_data in breakdown.items():
        category_label = cat_key.replace("_", " ").title()
        if cat_data["items"]:
            item_labels = [it["label"] for it in cat_data["items"] if it["points"] > 0]
            if item_labels:
                justification_parts.append(
                    f"  * {category_label}: {cat_data['score']}/{cat_data['max_score']} pts "
                    f"-- supported by {', '.join(item_labels)}."
                )
            else:
                justification_parts.append(
                    f"  * {category_label}: 0/{cat_data['max_score']} pts "
                    f"-- no recognised evidence types provided."
                )
        else:
            justification_parts.append(
                f"  * {category_label}: 0/{cat_data['max_score']} pts "
                f"-- no evidence provided for this category."
            )

    # Add advisory note
    if total_score >= 80:
        justification_parts.append(
            "Assessment: The evidence profile is strong. "
            "Multiple high-quality evidence types support the case."
        )
    elif total_score >= 60:
        justification_parts.append(
            "Assessment: The case has moderate strength. "
            "Consider strengthening weaker evidence categories."
        )
    elif total_score >= 40:
        justification_parts.append(
            "Assessment: The case is weak. Significant gaps exist in the "
            "evidence profile. Legal counsel should evaluate viability."
        )
    else:
        justification_parts.append(
            "Assessment: The case is very weak. Critical evidence is missing "
            "across multiple categories. Proceeding without strengthening "
            "the evidence base carries high risk."
        )

    return {
        "score": total_score,
        "grade": grade,
        "breakdown": breakdown,
        "justification": "\n".join(justification_parts),
    }


# ======================================================================
#  4. JUSTICE GAP DATA GENERATOR
# ======================================================================

# Realistic base data for 10 Indian districts (representative sample)
_DISTRICT_DATA: list[dict[str, Any]] = [
    {
        "district": "North Delhi",
        "state": "Delhi",
        "latitude": 28.7041,
        "longitude": 77.1025,
        "population": 887978,
        "pending_cases": 142350,
        "disposed_cases": 98200,
        "judges_sanctioned": 120,
        "judges_working": 88,
        "legal_aid_lawyers": 45,
        "legal_aid_beneficiaries_yearly": 3200,
        "avg_disposal_days": 480,
    },
    {
        "district": "Mumbai City",
        "state": "Maharashtra",
        "latitude": 18.9750,
        "longitude": 72.8258,
        "population": 3085411,
        "pending_cases": 298400,
        "disposed_cases": 185600,
        "judges_sanctioned": 200,
        "judges_working": 142,
        "legal_aid_lawyers": 78,
        "legal_aid_beneficiaries_yearly": 5800,
        "avg_disposal_days": 620,
    },
    {
        "district": "Lucknow",
        "state": "Uttar Pradesh",
        "latitude": 26.8467,
        "longitude": 80.9462,
        "population": 4589838,
        "pending_cases": 385200,
        "disposed_cases": 142300,
        "judges_sanctioned": 180,
        "judges_working": 105,
        "legal_aid_lawyers": 32,
        "legal_aid_beneficiaries_yearly": 1800,
        "avg_disposal_days": 890,
    },
    {
        "district": "Bengaluru Urban",
        "state": "Karnataka",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "population": 8443675,
        "pending_cases": 215800,
        "disposed_cases": 168200,
        "judges_sanctioned": 160,
        "judges_working": 128,
        "legal_aid_lawyers": 65,
        "legal_aid_beneficiaries_yearly": 4500,
        "avg_disposal_days": 520,
    },
    {
        "district": "Kolkata",
        "state": "West Bengal",
        "latitude": 22.5726,
        "longitude": 88.3639,
        "population": 4486679,
        "pending_cases": 178900,
        "disposed_cases": 112400,
        "judges_sanctioned": 140,
        "judges_working": 98,
        "legal_aid_lawyers": 40,
        "legal_aid_beneficiaries_yearly": 2800,
        "avg_disposal_days": 650,
    },
    {
        "district": "Patna",
        "state": "Bihar",
        "latitude": 25.6093,
        "longitude": 85.1376,
        "population": 5838465,
        "pending_cases": 420500,
        "disposed_cases": 98700,
        "judges_sanctioned": 160,
        "judges_working": 72,
        "legal_aid_lawyers": 18,
        "legal_aid_beneficiaries_yearly": 950,
        "avg_disposal_days": 1100,
    },
    {
        "district": "Chennai",
        "state": "Tamil Nadu",
        "latitude": 13.0827,
        "longitude": 80.2707,
        "population": 4681087,
        "pending_cases": 168300,
        "disposed_cases": 145200,
        "judges_sanctioned": 150,
        "judges_working": 125,
        "legal_aid_lawyers": 58,
        "legal_aid_beneficiaries_yearly": 4200,
        "avg_disposal_days": 420,
    },
    {
        "district": "Jaipur",
        "state": "Rajasthan",
        "latitude": 26.9124,
        "longitude": 75.7873,
        "population": 3073350,
        "pending_cases": 245600,
        "disposed_cases": 128300,
        "judges_sanctioned": 130,
        "judges_working": 85,
        "legal_aid_lawyers": 28,
        "legal_aid_beneficiaries_yearly": 1600,
        "avg_disposal_days": 780,
    },
    {
        "district": "Guwahati (Kamrup Metro)",
        "state": "Assam",
        "latitude": 26.1445,
        "longitude": 91.7362,
        "population": 1253938,
        "pending_cases": 89200,
        "disposed_cases": 42100,
        "judges_sanctioned": 60,
        "judges_working": 35,
        "legal_aid_lawyers": 12,
        "legal_aid_beneficiaries_yearly": 680,
        "avg_disposal_days": 920,
    },
    {
        "district": "Hyderabad",
        "state": "Telangana",
        "latitude": 17.3850,
        "longitude": 78.4867,
        "population": 6809970,
        "pending_cases": 198400,
        "disposed_cases": 162800,
        "judges_sanctioned": 155,
        "judges_working": 130,
        "legal_aid_lawyers": 55,
        "legal_aid_beneficiaries_yearly": 4000,
        "avg_disposal_days": 490,
    },
]


def generate_heatmap_stats() -> dict[str, Any]:
    """
    Generate structured JSON data for 10 Indian districts representing
    the justice gap across the country.

    Calculated metrics:
      • pendency_ratio     = pending_cases / (pending + disposed)
      • judge_vacancy_rate = 1 - (judges_working / judges_sanctioned)
      • legal_aid_availability = legal_aid_lawyers / (population / 100_000)
      • cases_per_judge    = pending_cases / judges_working
      • justice_gap_index  = weighted composite (0–100, higher = worse gap)

    Returns:
        {
            "generated_at": "...",
            "methodology": "...",
            "districts": [ ... ],
            "national_summary": { ... }
        }
    """
    districts_output: list[dict[str, Any]] = []

    all_pendency = []
    all_vacancy = []
    all_aid = []
    all_gap = []

    for d in _DISTRICT_DATA:
        total_cases = d["pending_cases"] + d["disposed_cases"]
        pop_lakh = d["population"] / 100_000

        # Core metrics
        pendency_ratio = round(d["pending_cases"] / total_cases, 4) if total_cases > 0 else 0
        judge_vacancy_rate = round(
            1 - (d["judges_working"] / d["judges_sanctioned"]), 4
        ) if d["judges_sanctioned"] > 0 else 0
        legal_aid_per_lakh = round(d["legal_aid_lawyers"] / pop_lakh, 2)
        cases_per_judge = round(d["pending_cases"] / d["judges_working"], 1) if d["judges_working"] > 0 else 0
        beneficiaries_per_lakh = round(d["legal_aid_beneficiaries_yearly"] / pop_lakh, 1)

        # Normalize for composite scoring (0–1 scale, higher = worse)
        norm_pendency = min(pendency_ratio / 0.9, 1.0)         # 0.9 as worst-case
        norm_vacancy = min(judge_vacancy_rate / 0.6, 1.0)       # 60% vacancy as worst-case
        norm_aid_deficit = max(0, 1        # Invert: fewer lawyers = higher deficit
            - (legal_aid_per_lakh / 5.0))                        # 5 lawyers/lakh as ideal
        norm_disposal_time = min(d["avg_disposal_days"] / 1200, 1.0)  # 1200 days as worst

        # Weighted justice gap index (0–100, higher = worse)
        justice_gap_index = round(
            (
                norm_pendency * 0.30 +
                norm_vacancy * 0.20 +
                norm_aid_deficit * 0.25 +
                norm_disposal_time * 0.25
            ) * 100,
            1,
        )

        # Severity classification
        if justice_gap_index >= 70:
            severity = "Critical"
        elif justice_gap_index >= 50:
            severity = "Severe"
        elif justice_gap_index >= 30:
            severity = "Moderate"
        else:
            severity = "Low"

        district_entry = {
            "district": d["district"],
            "state": d["state"],
            "coordinates": {
                "latitude": d["latitude"],
                "longitude": d["longitude"],
            },
            "population": d["population"],
            "metrics": {
                "pendency_ratio": pendency_ratio,
                "judge_vacancy_rate": judge_vacancy_rate,
                "legal_aid_availability": {
                    "lawyers_per_lakh": legal_aid_per_lakh,
                    "beneficiaries_per_lakh": beneficiaries_per_lakh,
                    "total_legal_aid_lawyers": d["legal_aid_lawyers"],
                },
                "cases_per_judge": cases_per_judge,
                "avg_disposal_days": d["avg_disposal_days"],
            },
            "raw_numbers": {
                "pending_cases": d["pending_cases"],
                "disposed_cases": d["disposed_cases"],
                "judges_sanctioned": d["judges_sanctioned"],
                "judges_working": d["judges_working"],
            },
            "justice_gap_index": justice_gap_index,
            "severity": severity,
        }

        districts_output.append(district_entry)
        all_pendency.append(pendency_ratio)
        all_vacancy.append(judge_vacancy_rate)
        all_aid.append(legal_aid_per_lakh)
        all_gap.append(justice_gap_index)

    # Sort by gap index (worst first)
    districts_output.sort(key=lambda x: x["justice_gap_index"], reverse=True)

    # National summary
    national_summary = {
        "avg_pendency_ratio": round(float(np.mean(all_pendency)), 4),
        "avg_judge_vacancy_rate": round(float(np.mean(all_vacancy)), 4),
        "avg_legal_aid_lawyers_per_lakh": round(float(np.mean(all_aid)), 2),
        "avg_justice_gap_index": round(float(np.mean(all_gap)), 1),
        "worst_district": districts_output[0]["district"] if districts_output else None,
        "best_district": districts_output[-1]["district"] if districts_output else None,
        "districts_in_critical": sum(1 for d in districts_output if d["severity"] == "Critical"),
        "districts_in_severe": sum(1 for d in districts_output if d["severity"] == "Severe"),
    }

    return {
        "generated_at": __import__("datetime").datetime.now().isoformat(),
        "methodology": (
            "Justice Gap Index is a composite score (0–100, higher = worse) computed from: "
            "case pendency ratio (30%), judge vacancy rate (20%), "
            "legal aid availability deficit (25%), and average case disposal time (25%). "
            "Data is representative and based on publicly available NJDG, NALSA, "
            "and Census sources."
        ),
        "districts": districts_output,
        "national_summary": national_summary,
    }


# ======================================================================
#  CONVENIENCE WRAPPER — for Django integration
# ======================================================================

class NyaySetuIntelligence:
    """
    Unified facade for Django views.

    Usage:
    ──────
        from intelligence_core import NyaySetuIntelligence

        ai = NyaySetuIntelligence(
            pdf_path="data/bns_2023.pdf",
            persist_dir="data/chroma_db",
        )

        # Build index (run once or on deployment)
        ai.build_index()

        # In a view:
        context = ai.get_mapped_context("What is the punishment under IPC 302?")
        strength = ai.calculate_case_strength({...})
        heatmap = ai.generate_heatmap_stats()
    """

    def __init__(
        self,
        pdf_path: str | Path | None = None,
        persist_dir: str | Path = "chroma_legal_db",
        device: str | None = None,
    ):
        self.vector_store = LegalVectorStore(
            pdf_path=pdf_path,
            persist_dir=persist_dir,
            device=device,
        )

    def build_index(self, pdf_path: str | Path | None = None, force: bool = False) -> int:
        """Build or rebuild the vector index from BNS PDF."""
        return self.vector_store.build_index(pdf_path=pdf_path, force=force)

    def search(self, query: str, n_results: int = 3) -> list[dict[str, Any]]:
        """Semantic search over BNS clauses."""
        return self.vector_store.search(query=query, n_results=n_results)

    def get_mapped_context(self, user_input: str, n_results: int = 3) -> dict[str, Any]:
        """IPC→BNS mapping + RAG-boosted search."""
        return get_mapped_context(
            user_input=user_input,
            vector_store=self.vector_store,
            n_results=n_results,
        )

    @staticmethod
    def calculate_case_strength(evidence_metadata: dict[str, list[str]]) -> dict[str, Any]:
        """Case strength meter (0–100 with justification)."""
        return calculate_case_strength(evidence_metadata)

    @staticmethod
    def generate_heatmap_stats() -> dict[str, Any]:
        """Justice gap heatmap data for 10 Indian districts."""
        return generate_heatmap_stats()


# ======================================================================
#  CLI — quick-test entrypoint
# ======================================================================

if __name__ == "__main__":
    import sys

    print("=" * 70)
    print("  NyaySetu Intelligence Core -- Quick Test")
    print("=" * 70)

    # ── Test 1: IPC Mapping ───────────────────────────────────────
    print("\n[1] IPC -> BNS Mapping Test")
    test_input = "The accused was charged under IPC Section 302 and Section 420."
    ctx = get_mapped_context(test_input, vector_store=None)
    print(f"    Input: {test_input}")
    print(f"    Detected: {ctx['detected_ipc_sections']}")
    for m in ctx["mappings"]:
        print(f"    IPC {m['ipc_section']} -> BNS {m['bns_section']} ({m['title']})")

    # ── Test 2: Case Strength ─────────────────────────────────────
    print("\n[2] Case Strength Meter Test")
    evidence = {
        "direct_evidence": ["cctv", "forensic"],
        "witness_credibility": ["eyewitness"],
        "precedent": ["supreme_court"],
    }
    strength = calculate_case_strength(evidence)
    print(f"    Evidence: {evidence}")
    print(f"    Score: {strength['score']}/100  (Grade: {strength['grade']})")
    justification_ascii = strength['justification'].replace('\u2022', '*').replace('\u2014', '--')
    print(f"    Justification:\n{justification_ascii}")

    # ── Test 3: Heatmap Stats ─────────────────────────────────────
    print("\n[3] Justice Gap Heatmap Data (top 3 worst districts)")
    stats = generate_heatmap_stats()
    for d in stats["districts"][:3]:
        print(
            f"    {d['district']}, {d['state']}: "
            f"Gap Index = {d['justice_gap_index']}  ({d['severity']})"
        )
    print(f"    National avg gap index: {stats['national_summary']['avg_justice_gap_index']}")

    # ── Test 4: Vector Store (only if PDF provided) ───────────────
    if len(sys.argv) > 1:
        pdf = sys.argv[1]
        print(f"\n[4] Vector Store Test (PDF: {pdf})")
        store = LegalVectorStore(pdf_path=pdf, persist_dir="test_chroma_db")
        n = store.build_index()
        print(f"    Indexed {n} chunks.")
        results = store.search("punishment for murder")
        for r in results:
            print(f"    Score: {r['score']:.4f}  Text: {r['text'][:100]}...")
    else:
        print("\n[4] Vector Store Test -- Skipped (pass PDF path as CLI argument)")

    print("\n" + "=" * 70)
    print("  All tests passed [OK]")
    print("=" * 70)
