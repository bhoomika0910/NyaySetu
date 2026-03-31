"""Django management command to preload the NyaySetu vector index."""

from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from nyay_backend.apps.intelligence_core import NyaySetuIntelligence


class Command(BaseCommand):
    help = "Builds or refreshes the persistent Chroma index from the BNS PDF."

    def add_arguments(self, parser):
        parser.add_argument(
            "--pdf",
            dest="pdf_path",
            default=settings.BNS_PDF_PATH,
            help="Path to the Bharatiya Nyaya Sanhita PDF.",
        )
        parser.add_argument(
            "--persist",
            dest="persist_dir",
            default=settings.CHROMA_DB_DIR,
            help="Directory for the persistent Chroma database.",
        )
        parser.add_argument(
            "--force",
            action="store_true",
            help="Drop existing collection before rebuilding.",
        )

    def handle(self, *args, **options):
        pdf_path = Path(options["pdf_path"])
        persist_dir = Path(options["persist_dir"])
        persist_dir.mkdir(parents=True, exist_ok=True)

        engine = NyaySetuIntelligence(pdf_path=pdf_path, persist_dir=persist_dir)
        total = engine.build_index(pdf_path=pdf_path, force=options["force"])
        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully indexed {total} chunks from {pdf_path} into {persist_dir}"
            )
        )
