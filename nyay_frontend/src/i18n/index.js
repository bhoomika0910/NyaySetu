import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import hi from "./hi.json";
import en from "./en.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "hi",
    supportedLngs: ["hi", "en", "bn", "ta", "te", "mr", "gu", "pa"],
    resources: {
      hi: { translation: hi },
      en: { translation: en }
    },
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ["localStorage", "querystring", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "nyaya-lang"
    }
  });

export default i18n;
