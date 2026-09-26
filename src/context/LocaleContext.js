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
// SSR-safety: the server always renders English, so the first client render
// must also start on DEFAULT_LANG — reading the persisted/"ar" locale during
// the initial render would make every translated text node mismatch and
// abort hydration (#418). The real locale is applied in an effect instead;
// the no-flash script keeps the pre-hydration direction correct, and this
// provider swaps the strings right after hydration.

const STORAGE_KEY = "vanta.lang";

function readInitial() {
  if (typeof window === "undefined") return DEFAULT_LANG;
  const attribute = document.documentElement.getAttribute("lang");
  if (attribute === "ar" || attribute === "en") return attribute;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "ar" || saved === "en" ? saved : DEFAULT_LANG;
}

function applyLang(language) {
  const dir = getLangDir(language);
  document.documentElement.setAttribute("lang", language);
  document.documentElement.setAttribute("dir", dir);
}

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [lang, setLang] = useState(DEFAULT_LANG);
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    setLang(readInitial());
  }, []);

  useEffect(() => {
    if (!didInit.current) return;
    applyLang(lang);
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const t = useCallback(
    (key, vars) => translate(lang, key, vars),
    [lang]
  );

  const value = useMemo(
    () => ({
      lang,
      dir: getLangDir(lang),
      isRtl: getLangDir(lang) === "rtl",
      setLang,
      toggleLang: () => setLang((l) => (l === "en" ? "ar" : "en")),
      t,
    }),
    [lang, t]
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