import { useState } from "react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import { downloadTextAsPdf } from "../utils/pdf.js";

function RightsCardPage() {
  const [details, setDetails] = useState({ situation: "", rights: "", bns: "", contacts: "" });

  const buildText = () =>
    `Situation: ${details.situation}\nRights: ${details.rights}\nBNS: ${details.bns}\nContacts: ${details.contacts}`;

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <input
          className="h-12 rounded-xl border border-neutral-200 px-3"
          placeholder="Your situation"
          aria-label="Situation"
          onChange={(e) => setDetails({ ...details, situation: e.target.value })}
        />
        <textarea
          className="w-full min-h-[100px] rounded-xl border border-neutral-200 p-3"
          placeholder="Applicable rights"
          aria-label="Rights"
          onChange={(e) => setDetails({ ...details, rights: e.target.value })}
        />
        <input
          className="h-12 rounded-xl border border-neutral-200 px-3"
          placeholder="BNS sections"
          aria-label="BNS sections"
          onChange={(e) => setDetails({ ...details, bns: e.target.value })}
        />
        <input
          className="h-12 rounded-xl border border-neutral-200 px-3"
          placeholder="Emergency contacts"
          aria-label="Contacts"
          onChange={(e) => setDetails({ ...details, contacts: e.target.value })}
        />
      </Card>

      <Card className="border border-primary text-center space-y-3">
        <h2 className="text-2xl font-bold text-primary">Rights Card</h2>
        <p className="text-lg font-semibold">{details.situation || "Your situation"}</p>
        <div className="space-y-1 text-sm">
          <p><strong>Rights:</strong> {details.rights || "Add rights"}</p>
          <p><strong>BNS:</strong> {details.bns || "Add sections"}</p>
          <p><strong>Contacts:</strong> {details.contacts || "Police, Lawyer, Helpline"}</p>
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
          <Button fullWidth={false} onClick={() => downloadTextAsPdf("RightsCard", buildText())}>
            Download PDF
          </Button>
          <Button
            variant="secondary"
            fullWidth={false}
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(buildText())}`, "_blank")}
          >
            Share via WhatsApp
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default RightsCardPage;
