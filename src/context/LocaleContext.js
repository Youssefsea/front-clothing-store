"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DEFAULT_LANG, LANGS, getLangDir, translate } from "@/lib/i18n";

// Language — `vanta.lang` (en | ar) persisted in localStorage. The
// no-flash script in layout.js sets <html lang|dir> before hydration.
//
// SSR-safety: the server always renders English, so the first client
// render must also start on DEFAULT_LANG. Real locale is applied after
// hydration; the no-flash script keeps pre-hydration direction correct.

const STORAGE_KEY = "vanta.lang";

function readStoredLang() {
  if (typeof window === "undefined") return DEFAULT_LANG;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "ar" || saved === "en") return saved;
  } catch {
    // localStorage blocked/unavailable
  }
  try {
    const attribute = document.documentElement.getAttribute("lang");
    if (attribute === "ar" || attribute === "en") return attribute;
  } catch {
    // DOM access failed
  }
  return DEFAULT_LANG;
}

function applyLang(language) {
  if (typeof document === "undefined") return;
  try {
    const dir = getLangDir(language);
    document.documentElement.setAttribute("lang", language);
    document.documentElement.setAttribute("dir", dir);
  } catch {
    // DOM access failed
  }
}

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [lang, setLangState] = useState(DEFAULT_LANG);
  const ready = useRef(false);

  useEffect(() => {
    const initial = readStoredLang();
    ready.current = true;
    setLangState(initial);
    applyLang(initial);
    try {
      window.localStorage.setItem(STORAGE_KEY, initial);
    } catch {}
  }, []);

  useEffect(() => {
    if (!ready.current) return;
    applyLang(lang);
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
  }, [lang]);

  const t = useCallback(
    (key, vars) => translate(lang, key, vars),
    [lang]
  );

  const setLang = useCallback((next) => {
    if (next !== "en" && next !== "ar") return;
    if (next === lang) return;
    
    try {
      const root = document.documentElement;
      root.classList.add("lang-wave-active");
      
      window.setTimeout(() => {
        setLangState(next);
        window.setTimeout(() => {
          try {
            root.classList.remove("lang-wave-active");
          } catch {}
        }, 500);
      }, 450);
    } catch {
      setLangState(next);
    }
  }, [lang]);

  const toggleLang = useCallback(() => {
    const next = lang === "en" ? "ar" : "en";
    setLang(next);
  }, [lang, setLang]);

  const value = useMemo(
    () => ({
      lang,
      dir: getLangDir(lang),
      isRtl: getLangDir(lang) === "rtl",
      setLang,
      toggleLang,
      t,
    }),
    [lang, t, setLang, toggleLang]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

export { LANGS, DEFAULT_LANG };
