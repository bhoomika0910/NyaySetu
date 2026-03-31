import { useState } from "react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { submitReport } from "../services/api";

function AnonymousReportPage() {
  const [payload, setPayload] = useState({ type: "", description: "", state: "", district: "" });
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await submitReport(payload);
      setToken(res.token || "NYAYA-12345");
    } catch (err) {
      setError("Server se sampark nahi ho paya");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2">
        <span className="font-bold">🔒</span>
        <p className="font-semibold">आपकी पहचान बिल्कुल safe है</p>
      </Card>

      <Card className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            aria-label="Incident type"
            className="h-12 border border-neutral-200 rounded-xl px-3"
            onChange={(e) => setPayload({ ...payload, type: e.target.value })}
          >
            <option value="">Incident type</option>
            <option value="violence">Violence</option>
            <option value="fraud">Fraud</option>
            <option value="harassment">Harassment</option>
          </select>
          <input
            className="h-12 border border-neutral-200 rounded-xl px-3"
            placeholder="State"
            aria-label="State"
            onChange={(e) => setPayload({ ...payload, state: e.target.value })}
          />
          <input
            className="h-12 border border-neutral-200 rounded-xl px-3"
            placeholder="District"
            aria-label="District"
            onChange={(e) => setPayload({ ...payload, district: e.target.value })}
          />
        </div>
        <textarea
          className="w-full min-h-[120px] border border-neutral-200 rounded-xl p-3"
          placeholder="Kya hua, likhein"
          aria-label="Description"
          onChange={(e) => setPayload({ ...payload, description: e.target.value })}
        />
        {error && <p className="text-danger text-sm font-semibold">{error}</p>}
        <Button onClick={handleSubmit} loading={loading}>Submit</Button>
      </Card>

      {token && (
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600">Yeh token save karein</p>
            <p className="text-lg font-bold">{token}</p>
          </div>
          <Button fullWidth={false} onClick={() => navigator.clipboard.writeText(token)}>
            Copy
          </Button>
        </Card>
      )}
    </div>
  );
}

export default AnonymousReportPage;
