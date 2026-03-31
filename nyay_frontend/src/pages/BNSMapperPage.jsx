import { useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { useBNSMapper } from "../hooks/useBNSMapper.js";

function BNSMapperPage() {
  const [section, setSection] = useState("");
  const mapper = useBNSMapper();

  const onSearch = async () => {
    if (!section) return;
    await mapper.mutateAsync({ section });
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <Search />
          <h1 className="text-xl font-bold">IPC → BNS मैपिंग</h1>
        </div>
        <div className="flex gap-2">
          <input
            value={section}
            onChange={(e) => setSection(e.target.value)}
            placeholder="IPC section dhundein..."
            className="flex-1 h-12 rounded-xl px-4 border border-neutral-200 focus-visible:ring-2 ring-primary"
            aria-label="Search IPC section"
          />
          <Button fullWidth={false} onClick={onSearch} loading={mapper.isPending}>
            Search
          </Button>
        </div>
      </Card>

      {mapper.data && (
        <Card className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-neutral-50 p-4 rounded-xl space-y-2">
            <p className="text-sm text-neutral-600">IPC</p>
            <p className="text-lg font-bold">{mapper.data.ipc}</p>
            <p className="text-neutral-700">{mapper.data.description}</p>
          </div>
          <div className="bg-primary text-white p-4 rounded-xl space-y-2">
            <p className="text-sm text-white/80">BNS</p>
            <p className="text-lg font-bold">{mapper.data.bns}</p>
            <p className="text-primary-light">{mapper.data.bns_title}</p>
          </div>
          <div className="col-span-full flex items-center gap-2 text-sm font-semibold">
            <ArrowRight />
            <span>{mapper.data.severity_label || "Severity"}</span>
          </div>
        </Card>
      )}
    </div>
  );
}

export default BNSMapperPage;
