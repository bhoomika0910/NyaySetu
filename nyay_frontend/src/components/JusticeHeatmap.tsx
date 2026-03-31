import { useEffect, useState } from "react";

import { useApi } from "../hooks/useApi";

interface HeatmapDistrict {
  district: string;
  state: string;
  justice_gap_index: number;
  severity: string;
  metrics: {
    pendency_ratio: number;
    judge_vacancy_rate: number;
    cases_per_judge: number;
    avg_disposal_days: number;
    legal_aid_availability: {
      lawyers_per_lakh: number;
    };
  };
}

interface HeatmapResponse {
  generated_at: string;
  districts: HeatmapDistrict[];
  national_summary: {
    avg_justice_gap_index: number;
  };
}

export default function JusticeHeatmap() {
  const { callApi } = useApi();
  const [data, setData] = useState<HeatmapResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    callApi<HeatmapResponse>("/justice-heatmap/", "GET")
      .then(setData)
      .catch((apiError) => setError((apiError as Error).message));
  }, [callApi]);

  return (
    <section className="panel">
      <header>
        <h2>Justice Gap Atlas</h2>
        <p>District-level pendency & access-to-justice indicators.</p>
      </header>

      {error && <p className="error">{error}</p>}

      {data && (
        <>
          <p className="summary">
            National average gap score: {data.national_summary.avg_justice_gap_index}
          </p>
          <div className="heatmap-grid">
            {data.districts.map((district) => (
              <article key={district.district} className={`heatmap-card severity-${district.severity.toLowerCase()}`}>
                <header>
                  <strong>
                    {district.district}, {district.state}
                  </strong>
                  <span>{district.justice_gap_index}</span>
                </header>
                <ul>
                  <li>Pendency: {(district.metrics.pendency_ratio * 100).toFixed(1)}%</li>
                  <li>Vacancy: {(district.metrics.judge_vacancy_rate * 100).toFixed(1)}%</li>
                  <li>Cases/Judge: {district.metrics.cases_per_judge}</li>
                  <li>Lawyers/Lakh: {district.metrics.legal_aid_availability.lawyers_per_lakh}</li>
                </ul>
                <small>{district.severity} gap</small>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
