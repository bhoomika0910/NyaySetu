import CaseStrengthMeter from "../components/CaseStrengthMeter";
import JusticeHeatmap from "../components/JusticeHeatmap";
import SearchPanel from "../components/SearchPanel";

export default function Dashboard() {
  return (
    <main className="layout">
      <header className="hero">
        <div>
          <p className="eyebrow">NyaySetu Intelligence</p>
          <h1>Unified legal reasoning workspace</h1>
          <p>
            Explore BNS clauses, map IPC charges, measure case strength, and surface
            justice-gap signals from a single pane of glass.
          </p>
        </div>
      </header>

      <div className="grid">
        <SearchPanel />
        <CaseStrengthMeter />
        <JusticeHeatmap />
      </div>
    </main>
  );
}
