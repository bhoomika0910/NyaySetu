import { FormEvent, useMemo, useState } from "react";

import { useApi } from "../hooks/useApi";

interface CaseStrengthResponse {
  score: number;
  grade: string;
  justification: string;
}

export default function CaseStrengthMeter() {
  const { callApi } = useApi();
  const [directEvidence, setDirectEvidence] = useState("cctv,dna");
  const [witnessCredibility, setWitnessCredibility] = useState("eyewitness");
  const [precedent, setPrecedent] = useState("supreme_court");
  const [result, setResult] = useState<CaseStrengthResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const normalizedPayload = useMemo(
    () => ({
      direct_evidence: directEvidence
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      witness_credibility: witnessCredibility
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      precedent: precedent
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    }),
    [directEvidence, witnessCredibility, precedent]
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await callApi<CaseStrengthResponse, typeof normalizedPayload>(
        "/case-strength/",
        "POST",
        normalizedPayload
      );
      setResult(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel">
      <header>
        <h2>Case Strength Meter</h2>
        <p>Rule-based heuristic (0–100) across evidence pillars.</p>
      </header>

      <form className="panel-form" onSubmit={submit}>
        <label>
          Direct Evidence (comma separated)
          <input
            value={directEvidence}
            onChange={(e) => setDirectEvidence(e.target.value)}
            placeholder="dna,cctv"
          />
        </label>
        <label>
          Witness Credibility
          <input
            value={witnessCredibility}
            onChange={(e) => setWitnessCredibility(e.target.value)}
            placeholder="eyewitness"
          />
        </label>
        <label>
          Precedent / Retrieval Signals
          <input
            value={precedent}
            onChange={(e) => setPrecedent(e.target.value)}
            placeholder="supreme_court,retrieval_high"
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Scoring..." : "Score evidence"}
        </button>
      </form>

      {result && (
        <div className="case-strength-result">
          <div className="score">{result.score}</div>
          <div className="grade">{result.grade}</div>
          <pre>{result.justification}</pre>
        </div>
      )}
    </section>
  );
}
