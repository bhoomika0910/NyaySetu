import { FormEvent, useState } from "react";

import { useApi } from "../hooks/useApi";

interface SearchResult {
  text: string;
  score: number;
  metadata: Record<string, unknown>;
  boosted?: boolean;
}

interface SearchResponse {
  results: SearchResult[];
}

interface MappedContextResponse {
  detected_ipc_sections: string[];
  mappings: Array<{
    ipc_section: string;
    bns_section: string;
    title: string;
    description: string;
  }>;
  rag_results: SearchResult[];
  search_mode: string;
}

export default function SearchPanel() {
  const { callApi } = useApi();
  const [query, setQuery] = useState("punishment for murder");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [mappedContext, setMappedContext] = useState<MappedContextResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const [semantic, mapped] = await Promise.all([
        callApi<SearchResponse, { query: string; n_results: number }>(
          "/search/",
          "POST",
          { query, n_results: 3 }
        ),
        callApi<MappedContextResponse, { user_input: string; n_results: number }>(
          "/mapped-context/",
          "POST",
          { user_input: query, n_results: 3 }
        )
      ]);
      setResults(semantic.results);
      setMappedContext(mapped);
    } catch (apiError) {
      setError((apiError as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel">
      <header>
        <h2>Intelligent Legal Search</h2>
        <p>Vector search + IPC→BNS context boost.</p>
      </header>

      <form className="panel-form" onSubmit={handleSearch}>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={3}
          placeholder="Describe the fact pattern or cite IPC sections"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Run RAG Search"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {mappedContext && (
        <div className="mapped-context">
          <strong>Detected IPC Sections:</strong> {" "}
          {mappedContext.detected_ipc_sections.join(", ") || "None"}
          <ul>
            {mappedContext.mappings.map((mapping) => (
              <li key={mapping.ipc_section}>
                IPC {mapping.ipc_section} → BNS {mapping.bns_section} ({mapping.title})
              </li>
            ))}
          </ul>
          <small>Search mode: {mappedContext.search_mode}</small>
        </div>
      )}

      <div className="results-grid">
        {results.map((result, idx) => (
          <article className="result" key={`${result.metadata?.chunk_index}-${idx}`}>
            <header>
              <span>Score: {result.score.toFixed(3)}</span>
              {result.boosted && <span className="badge">Boosted</span>}
            </header>
            <p>{result.text.slice(0, 280)}...</p>
          </article>
        ))}
      </div>
    </section>
  );
}
