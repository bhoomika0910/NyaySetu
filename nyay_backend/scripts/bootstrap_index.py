"""Utility script to (re)build the Chroma index from the BNS PDF."""

from pathlib import Path

from nyay_backend.apps.intelligence_core import NyaySetuIntelligence


def main() -> None:
    pdf_path = Path("nyay_backend/data/bns.pdf")
    persist_dir = Path("nyay_backend/data/chroma_db")
    persist_dir.mkdir(parents=True, exist_ok=True)

    engine = NyaySetuIntelligence(pdf_path=pdf_path, persist_dir=persist_dir)
    total = engine.build_index()
    print(f"Indexed {total} chunks into {persist_dir} using {pdf_path}")


if __name__ == "__main__":
    main()
