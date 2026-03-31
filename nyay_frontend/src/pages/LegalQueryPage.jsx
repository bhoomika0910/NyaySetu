import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Mic, Send, Shield, Info } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Spinner from "../components/ui/Spinner.jsx";
import { useLegalQuery } from "../hooks/useLegalQuery.js";

const examples = [
  "query.examples.one",
  "query.examples.two",
  "query.examples.three"
];

function ConfidenceDot({ level }) {
  const map = {
    high: "bg-success",
    medium: "bg-accent",
    low: "bg-danger"
  };
  return <span className={`w-3 h-3 rounded-full ${map[level] || "bg-accent"}`} aria-hidden />;
}

function MessageBubble({ from, text, sections, rights, confidence }) {
  const isUser = from === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl p-4 space-y-3 shadow ${
          isUser ? "bg-primary text-white" : "bg-white border-l-4 border-primary"
        }`}
      >
        <p className="text-base leading-relaxed">{text}</p>
        {!isUser && (
          <div className="flex flex-wrap gap-2 text-sm">
            {sections?.length ? (
              <details className="bg-primary-light text-primary rounded-full px-3 py-1">
                <summary className="cursor-pointer font-bold flex items-center gap-2">
                  <Shield size={16} />
                  BNS
                </summary>
                <ul className="ml-1 mt-2 list-disc list-inside text-neutral-800">
                  {sections.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </details>
            ) : null}
            {rights?.length ? (
              <details className="bg-white text-neutral-900 rounded-full px-3 py-1 border border-neutral-200">
                <summary className="cursor-pointer font-bold flex items-center gap-2">
                  <Info size={16} />
                  Rights
                </summary>
                <ul className="ml-1 mt-2 list-disc list-inside">
                  {rights.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </details>
            ) : null}
            {confidence && (
              <span className="inline-flex items-center gap-2 bg-white rounded-full px-3 py-1 border border-neutral-200 text-neutral-800">
                <ConfidenceDot level={confidence} />
                <span className="font-semibold capitalize">{confidence}</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-neutral-500">
      <span className="inline-flex gap-1">
        <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "120ms" }} />
        <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "240ms" }} />
      </span>
      <span>soch rahe hain...</span>
    </div>
  );
}

function LegalQueryPage() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const mutation = useLegalQuery();

  const sendMessage = async (text) => {
    if (!text) return;
    const userMessage = { from: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    try {
      const response = await mutation.mutateAsync({ query: text });
      setMessages((prev) => [
        ...prev,
        {
          from: "ai",
          text: response.answer,
          sections: response.sections,
          rights: response.rights,
          confidence: response.confidence
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          from: "ai",
          text: error?.message || "Server se sampark nahin ho paya",
          sections: [],
          rights: [],
          confidence: "low"
        }
      ]);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button aria-label="Back" className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center">
            ←
          </button>
          <div>
            <p className="text-xs text-neutral-500 uppercase">Nyaya Setu</p>
            <h2 className="text-xl font-bold">{t("query.title")}</h2>
          </div>
        </div>
        <span className="text-xs font-semibold text-neutral-600">Warm. Clear. Friendly.</span>
      </Card>

      <Card className="p-4 h-[60vh] overflow-y-auto space-y-4" tone="border-primary">
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {examples.map((key) => (
              <button
                key={key}
                onClick={() => sendMessage(t(key))}
                className="px-3 py-2 rounded-full bg-white border border-primary text-primary text-sm font-bold"
                aria-label={t(key)}
              >
                {t(key)}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <MessageBubble {...msg} />
          </motion.div>
        ))}

        {mutation.isPending && <TypingIndicator />}
      </Card>

      <div className="bg-white rounded-2xl p-3 shadow flex items-center gap-2">
        <button
          className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center font-bold focus-visible:ring-2 ring-primary"
          aria-label={t("query.voice")}
        >
          <Mic size={20} />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("query.placeholder")}
          aria-label={t("query.placeholder")}
          className="flex-1 h-12 rounded-full px-4 border border-neutral-200 focus-visible:ring-2 ring-primary text-base"
        />
        <Button
          variant="primary"
          size="md"
          fullWidth={false}
          onClick={() => sendMessage(input)}
          loading={mutation.isPending}
          aria-label={t("query.send")}
          className="w-12 h-12 rounded-full !px-0"
        >
          <Send size={18} />
        </Button>
      </div>
    </div>
  );
}

export default LegalQueryPage;
