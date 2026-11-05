import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import zh from "./locales/zh.json";

// Strings are used as their own translation keys (keySeparator/nsSeparator
// disabled): anything missing from the zh table falls back to the original
// English string, so partial coverage degrades gracefully instead of
// rendering raw keys.
export const LANG_STORAGE_KEY = "lelab.lang";
export const SUPPORTED_LANGUAGES = ["en", "zh"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const resolveInitialLanguage = (): Language => {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
  if (stored === "zh" || stored === "en") return stored;
  return navigator.language?.toLowerCase().startsWith("zh") ? "zh" : "en";
};

i18n.use(initReactI18next).init({
  resources: { zh: { translation: zh } },
  lng: resolveInitialLanguage(),
  fallbackLng: "en",
  // Natural keys: the whole English string is the key.
  keySeparator: false,
  nsSeparator: false,
  interpolation: { escapeValue: false },
});

if (typeof document !== "undefined") {
  document.documentElement.lang = resolveInitialLanguage() === "zh" ? "zh-CN" : "en";
}

export const changeLanguage = (language: Language) => {
  i18n.changeLanguage(language);
  if (typeof document !== "undefined") {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }
};

export default i18n;
