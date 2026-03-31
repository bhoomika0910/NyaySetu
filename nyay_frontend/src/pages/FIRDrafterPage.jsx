import { useState } from "react";
import { FileCheck, Loader2 } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { useFIRDraft } from "../hooks/useFIRDraft.js";
import { downloadTextAsPdf } from "../utils/pdf.js";

function FIRDrafterPage() {
  const [story, setStory] = useState("");
  const draft = useFIRDraft();

  const onSubmit = async () => {
    if (!story) return;
    await draft.mutateAsync({ narrative: story });
  };

  return (
    <div className="space-y-4">
      <Card className="p-4" tone="border-l-4 border-primary">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">FIR ड्राफ्ट करें</h1>
          <span className="text-sm text-neutral-600">3 आसान स्टेप</span>
        </div>
      </Card>

      <Card className="space-y-3">
        <label className="flex flex-col gap-2 text-sm font-semibold text-neutral-700">
          <span>क्या हुआ?</span>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            className="w-full min-h-[140px] border border-neutral-200 rounded-xl p-3 focus-visible:ring-2 ring-primary"
            placeholder="दिनांक, स्थान, लोगों के नाम और घटना लिखें"
            aria-label="FIR details"
          />
        </label>
        <Button onClick={onSubmit} loading={draft.isPending}>
          Generate FIR
        </Button>
      </Card>

      {draft.isPending && (
        <Card className="flex items-center gap-3 text-neutral-700">
          <Loader2 className="animate-spin" />
          <span>आपका FIR तैयार हो रहा है...</span>
        </Card>
      )}

      {draft.data && (
        <Card className="space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <FileCheck />
            <span className="font-bold">Draft Ready</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {draft.data.bns_sections?.map((s) => (
              <span key={s} className="px-3 py-1 rounded-full bg-primary-light text-primary text-sm font-bold">
                {s}
              </span>
            ))}
          </div>
          <pre className="bg-neutral-50 p-3 rounded-xl text-sm whitespace-pre-wrap">{draft.data.fir_text}</pre>
          <div className="flex flex-wrap gap-2">
            <Button fullWidth={false} onClick={() => downloadTextAsPdf("FIR", draft.data.fir_text)}>
              Download PDF
            </Button>
            <Button variant="secondary" fullWidth={false} onClick={() => navigator.clipboard.writeText(draft.data.fir_text)}>
              Copy Text
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

export default FIRDrafterPage;
