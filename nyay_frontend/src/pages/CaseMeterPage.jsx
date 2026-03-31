import { useState } from "react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { useCaseAnalysis } from "../hooks/useContractScan.js";

function Gauge({ score }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = score > 70 ? "#10B981" : score > 40 ? "#F59E0B" : "#EF4444";
  return (
    <svg viewBox="0 0 200 140" className="w-full">
      <path d="M20 120 A80 80 0 0 1 180 120" fill="none" stroke="#e5e7eb" strokeWidth="16" strokeLinecap="round" />
      <path
        d="M20 120 A80 80 0 0 1 180 120"
        fill="none"
        stroke={color}
        strokeWidth="16"
        strokeLinecap="round"
        strokeDasharray={`${progress} ${circumference}`}
      />
      <text x="100" y="105" textAnchor="middle" fontSize="32" fontWeight="700" fill={color}>{score}</text>
    </svg>
  );
}

function CaseMeterPage() {
  const [story, setStory] = useState("");
  const { data, refetch, isFetching } = useCaseAnalysis({ story }, !!story);

  return (
    <div className="space-y-4">
      <Card className="space-y-2">
        <label className="text-sm font-semibold text-neutral-700">Aapki kahani likhein...</label>
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          className="w-full min-h-[140px] border border-neutral-200 rounded-xl p-3 focus-visible:ring-2 ring-primary"
          placeholder="Detail likhien"
          aria-label="Case story"
        />
        <Button onClick={() => refetch()} loading={isFetching}>
          Analyze
        </Button>
      </Card>

      {data && (
        <Card className="space-y-3">
          <Gauge score={data.score || 65} />
          <p className="text-center text-lg font-bold">{data.label || "Mazboot dawa"}</p>
          <div className="space-y-2 text-sm">
            <details className="bg-neutral-50 p-3 rounded-xl">
              <summary className="font-bold">Applicable BNS sections</summary>
              <ul className="list-disc list-inside">{data.sections?.map((s) => <li key={s}>{s}</li>)}</ul>
            </details>
            <details className="bg-neutral-50 p-3 rounded-xl">
              <summary className="font-bold">Your rights</summary>
              <ul className="list-disc list-inside">{data.rights?.map((r) => <li key={r}>{r}</li>)}</ul>
            </details>
            <details className="bg-neutral-50 p-3 rounded-xl">
              <summary className="font-bold">Similar precedents</summary>
              <ul className="list-disc list-inside">{data.precedents?.map((p) => <li key={p}>{p}</li>)}</ul>
            </details>
          </div>
        </Card>
      )}
    </div>
  );
}

export default CaseMeterPage;
