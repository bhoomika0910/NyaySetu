import { useEffect, useState } from "react";
import i18n from "../../i18n";

const LANGUAGES = [
  { code: "hi", label: "हिंदी", flag: "🇮🇳" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "bn", label: "বাংলা", flag: "🇧🇩" },
  { code: "ta", label: "தமிழ்", flag: "🇮🇳" },
  { code: "te", label: "తెలుగు", flag: "🇮🇳" },
  { code: "mr", label: "मराठी", flag: "🇮🇳" },
  { code: "gu", label: "ગુજરાતી", flag: "🇮🇳" },
  { code: "pa", label: "ਪੰਜਾਬੀ", flag: "🇮🇳" }
];

function LanguageSelector({ className = "" }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(i18n.language || "hi");

  useEffect(() => {
    const saved = localStorage.getItem("nyaya-lang");
    if (saved) {
      setCurrent(saved);
      i18n.changeLanguage(saved);
    }
  }, []);

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem("nyaya-lang", code);
    setCurrent(code);
    setOpen(false);
    document.documentElement.dir = code === "pa" ? "rtl" : "ltr";
  };

  const currentLang = LANGUAGES.find((l) => l.code === current) || LANGUAGES[0];

  return (
    <div className={`relative ${className}`}>
      <button
        aria-label="Language selector"
        onClick={() => setOpen((p) => !p)}
        className="h-10 px-4 bg-white rounded-full shadow-md flex items-center gap-2 text-sm font-semibold focus-visible:ring-2 ring-primary"
      >
        <span>{currentLang.flag}</span>
        <span>{currentLang.label}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-neutral-100 z-10">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-primary-light ${
                lang.code === current ? "font-bold text-primary" : ""
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;
