import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  LANGUAGE_STORAGE_KEY,
  TRANSLATIONS,
  detectLanguage,
  type Dictionary,
  type Language,
} from "@/lib/i18n";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  /** The active dictionary. Named `t` so call sites read `t.digest.saved`. */
  t: Dictionary;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Lazy initial state: the detection reads localStorage, which shouldn't run
  // on every render.
  const [lang, setLangState] = useState<Language>(() => detectLanguage());

  // Keeps <html lang> honest for screen readers, browser translation prompts
  // and search engines - none of which look at React state.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Language) => {
    setLangState(next);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
  }, []);

  const value = useMemo(() => ({ lang, setLang, t: TRANSLATIONS[lang] }), [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return ctx;
}
