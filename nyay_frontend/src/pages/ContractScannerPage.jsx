import { useState } from "react";
import { UploadCloud, ShieldCheck } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { useContractScan } from "../hooks/useContractScan.js";

function riskColor(level) {
  if (level === "HIGH") return "border-l-4 border-danger";
  if (level === "MEDIUM") return "border-l-4 border-accent";
  return "border-l-4 border-success";
}

function ContractScannerPage() {
  const [file, setFile] = useState(null);
  const scan = useContractScan();

  const onUpload = async () => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    await scan.mutateAsync(form);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 flex items-center gap-3">
        <UploadCloud className="text-primary" />
        <div>
          <p className="text-lg font-bold">Contract Scanner</p>
          <p className="text-sm text-neutral-600">PDF yahan drop karein</p>
        </div>
      </Card>

      <label className="w-full border-2 border-dashed border-primary/40 rounded-2xl h-48 flex flex-col items-center justify-center gap-3 text-neutral-700 bg-white cursor-pointer">
        <UploadCloud size={42} className="text-primary" />
        <span className="font-semibold">PDF यहाँ drop करें</span>
        <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </label>

      <Button onClick={onUpload} loading={scan.isPending} disabled={!file}>
        Scan Document
      </Button>

      {scan.data?.risks?.length ? (
        <div className="space-y-3">
          {scan.data.risks.map((risk, idx) => (
            <Card key={idx} className={`space-y-2 ${riskColor(risk.level)}`}>
              <div className="flex items-center gap-2 text-sm font-bold">
                <span className={`w-3 h-3 rounded-full ${risk.level === "HIGH" ? "bg-danger" : risk.level === "MEDIUM" ? "bg-accent" : "bg-success"}`} />
                <span>{risk.level} risk</span>
              </div>
              <pre className="bg-neutral-50 p-3 rounded-xl text-sm whitespace-pre-wrap font-mono overflow-auto max-h-40">{risk.clause}</pre>
              <div className="bg-amber-50 text-amber-900 p-3 rounded-xl text-sm">{risk.explanation}</div>
            </Card>
          ))}
        </div>
      ) : scan.isSuccess ? (
        <Card className="flex items-center gap-2 text-success">
          <ShieldCheck />
          <span>Contract safe lagta hai!</span>
        </Card>
      ) : null}
    </div>
  );
}

export default ContractScannerPage;
