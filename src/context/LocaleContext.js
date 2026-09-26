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
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "ar" || saved === "en") return saved;
  const attribute = document.documentElement.getAttribute("lang");
  if (attribute === "ar" || attribute === "en") return attribute;
  return DEFAULT_LANG;
}

function applyLang(language) {
  const dir = getLangDir(language);
  document.documentElement.setAttribute("lang", language);
  document.documentElement.setAttribute("dir", dir);
}

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [lang, setLangState] = useState(DEFAULT_LANG);
  const [pendingLang, setPendingLang] = useState(null);
  const ready = useRef(false);
  const skipTransition = useRef(true);

  useEffect(() => {
    const initial = readStoredLang();
    ready.current = true;
    skipTransition.current = true;
    setLangState(initial);
    applyLang(initial);
    window.localStorage.setItem(STORAGE_KEY, initial);
    // Defer enabling transitions until after the hydration sync settles.
    const id = window.requestAnimationFrame(() => {
      skipTransition.current = false;
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!ready.current) return;
    applyLang(lang);
    window.localStorage.setItem(STORAGE_KEY, lang);

    if (skipTransition.current) return undefined;

    const root = document.documentElement;
    root.classList.add("lang-switching");
    const t = window.setTimeout(() => root.classList.remove("lang-switching"), 380);
    return () => window.clearTimeout(t);
  }, [lang]);

  const t = useCallback(
    (key, vars) => translate(lang, key, vars),
    [lang]
  );

  const requestLang = useCallback((next) => {
    if (next !== "en" && next !== "ar") return;
    if (next === lang) return;
    setPendingLang(next);
  }, [lang]);

  const confirmLang = useCallback(() => {
    if (!pendingLang) return;
    setLangState(pendingLang);
    setPendingLang(null);
  }, [pendingLang]);

  const cancelLang = useCallback(() => {
    setPendingLang(null);
  }, []);

  const setLang = useCallback((next) => {
    if (next !== "en" && next !== "ar") return;
    setLangState(next);
    setPendingLang(null);
  }, []);

  const toggleLang = useCallback(() => {
    const next = lang === "en" ? "ar" : "en";
    setPendingLang(next);
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      dir: getLangDir(lang),
      isRtl: getLangDir(lang) === "rtl",
      setLang,
      requestLang,
      toggleLang,
      pendingLang,
      confirmLang,
      cancelLang,
      t,
    }),
    [lang, t, setLang, requestLang, toggleLang, pendingLang, confirmLang, cancelLang]
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
