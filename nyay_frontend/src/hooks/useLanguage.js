import { useEffect, useState } from "react";
import i18n from "../i18n";

export function useLanguage() {
  const [lang, setLang] = useState(i18n.language || "hi");

  useEffect(() => {
    const handler = () => setLang(i18n.language);
    i18n.on("languageChanged", handler);
    return () => i18n.off("languageChanged", handler);
  }, []);

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem("nyaya-lang", code);
  };

  return { lang, changeLanguage };
}
