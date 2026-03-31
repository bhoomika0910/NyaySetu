# NyaySetu Frontend

Vite + React dashboard that consumes the backend intelligence APIs.

## Available Scripts

```bash
pnpm install   # or npm/yarn
pnpm dev       # start local dev server on http://localhost:5173
pnpm build     # type-check + build for production
```

## Feature Blocks

- **SearchPanel** – orchestrates semantic search and IPC→BNS mapped context calls.
- **CaseStrengthMeter** – allows advocates to enter evidence metadata and view the heuristic score.
- **JusticeHeatmap** – renders the justice gap analytics returned by `/api/justice-heatmap/`.

Proxy settings (see `vite.config.ts`) forward `/api/*` calls to the Django backend during development.
