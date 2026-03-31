# NyaySetu Backend

This folder hosts the Django-based service layer that exposes the AI intelligence core to the rest of the platform.

## Layout

```
nyay_backend/
├── apps/
│   ├── intelligence_core/     # Vector store, IPC→BNS mapping, heuristics
│   └── api/                   # DRF views, serializers, URL routes
├── backend_config/            # Django settings, urls, ASGI/WSGI entrypoints
├── data/                      # Local BNS PDF + Chroma persistence
├── scripts/                   # Operational helpers (index bootstrap, etc.)
├── tests/                     # Django/PyTest-compatible backend tests
└── manage.py                  # Standard Django management entrypoint
```

## Getting Started

1. **Install dependencies** (from the project root):
   ```bash
   pip install -r nyay_backend/requirements.txt
   ```
2. **Place the BNS knowledge base PDF** at `nyay_backend/data/bns.pdf` or set `NYAYSETU_BNS_PDF_PATH`.
3. **Build embeddings** (one-time per PDF revision):
   ```bash
   python nyay_backend/manage.py build_vector_index --force
   ```
4. **Run the API server**:
   ```bash
   python nyay_backend/manage.py runserver 0.0.0.0:8000
   ```

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `NYAYSETU_BNS_PDF_PATH` | Absolute path to the BNS PDF corpus |
| `NYAYSETU_CHROMA_DIR` | Persistent directory for ChromaDB |
| `DJANGO_SECRET_KEY` | Production secret key |
| `DJANGO_ALLOWED_HOSTS` | Comma-separated hostnames |

## API Surface

- `POST /api/search/` – semantic RAG search over the BNS corpus.
- `POST /api/mapped-context/` – IPC detection + boosted search.
- `POST /api/case-strength/` – rule-based case strength meter.
- `GET /api/justice-heatmap/` – justice gap analytics dataset.

Refer to `apps/api/serializers.py` for the request/response schema.
