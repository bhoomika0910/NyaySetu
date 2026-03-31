import { useState } from "react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { findNGOs } from "../services/api";

const chips = ["Women", "Children", "Legal Aid", "Disability", "Senior Citizen", "LGBTQ+"];

function NGOLocatorPage() {
  const [filters, setFilters] = useState({ state: "", district: "", specialization: "" });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    try {
      const data = await findNGOs(filters);
      setResults(data?.ngos || []);
    } catch (e) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            className="h-12 rounded-xl border border-neutral-200 px-3"
            placeholder="State"
            aria-label="State"
            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
          />
          <input
            className="h-12 rounded-xl border border-neutral-200 px-3"
            placeholder="District"
            aria-label="District"
            onChange={(e) => setFilters({ ...filters, district: e.target.value })}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {chips.map((chip) => (
            <button
              key={chip}
              onClick={() => setFilters({ ...filters, specialization: chip })}
              className={`px-4 py-2 rounded-full border text-sm font-bold whitespace-nowrap ${
                filters.specialization === chip ? "bg-primary text-white border-primary" : "bg-white border-neutral-200"
              }`}
            >
              {chip}
            </button>
          ))}
        </div>
        <Button onClick={search} loading={loading}>Search NGO</Button>
      </Card>

      {results.length === 0 && !loading && (
        <Card className="text-sm text-neutral-700">Is area mein koi NGO nahi mila — helpline pe call karein: 15100</Card>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((ngo) => (
            <Card key={ngo.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold">{ngo.name}</p>
                <span className="px-3 py-1 rounded-full bg-primary-light text-primary text-sm font-bold">{ngo.specialization}</span>
              </div>
              <a href={`tel:${ngo.phone}`} className="text-primary font-bold underline">
                {ngo.phone}
              </a>
              <span className={`text-xs px-2 py-1 rounded-full w-fit ${ngo.free ? "bg-success/10 text-success" : "bg-amber-100 text-amber-900"}`}>
                {ngo.free ? "Free" : "Paid"}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default NGOLocatorPage;
