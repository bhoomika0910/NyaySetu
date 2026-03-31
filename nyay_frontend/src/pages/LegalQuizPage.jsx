import { useState } from "react";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";

const sampleQuestions = [
  {
    question: "Police bina warrant kab giraftari kar sakti hai?",
    options: ["Kabhi nahi", "Sanghein jurm par", "Supreme Court order par", "DSP ki izin par"],
    answer: 1,
    explanation: "Gambhir अपराधिक मामलों में बिना warrant गिरफ़्तारी हो सकती है."
  },
  {
    question: "Mahila ki giraftari kab hogi?",
    options: ["Raat 6 ke baad", "Din 6 baje se pehle", "Kabhi bhi", "Court order se"],
    answer: 1,
    explanation: "महिला की गिरफ़्तारी दिन में 6 बजे से पहले प्राथमिकता है."
  }
];

function LegalQuizPage() {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const current = sampleQuestions[index];

  const submit = (idx) => {
    setSelected(idx);
    setShowAnswer(true);
    if (idx === current.answer) setScore((s) => s + 1);
  };

  const next = () => {
    setSelected(null);
    setShowAnswer(false);
    setIndex((i) => Math.min(sampleQuestions.length - 1, i + 1));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span className="px-3 py-1 rounded-full bg-primary-light text-primary">Question {index + 1}/{sampleQuestions.length}</span>
        <span className="px-3 py-1 rounded-full bg-white shadow">Score: {score}</span>
      </div>
      <Card className="space-y-3">
        <p className="text-lg font-bold leading-relaxed">{current.question}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {current.options.map((opt, idx) => {
            const isCorrect = showAnswer && idx === current.answer;
            const isSelected = selected === idx;
            return (
              <button
                key={idx}
                onClick={() => submit(idx)}
                disabled={showAnswer}
                className={`h-14 rounded-xl px-4 text-left font-semibold border transition ${
                  isCorrect
                    ? "bg-success/10 border-success text-success"
                    : isSelected
                    ? "bg-primary-light border-primary text-primary"
                    : "bg-white border-neutral-200"
                }`}
                aria-label={`Option ${idx + 1}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {showAnswer && (
          <div className="p-3 rounded-xl bg-neutral-50 text-sm text-neutral-800">
            <strong className="block mb-1">सही जवाब:</strong>
            {current.options[current.answer]}
            <p className="mt-2 text-neutral-700">{current.explanation}</p>
          </div>
        )}
        <div className="flex justify-end">
          <Button fullWidth={false} onClick={next} disabled={index === sampleQuestions.length - 1}>
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default LegalQuizPage;
