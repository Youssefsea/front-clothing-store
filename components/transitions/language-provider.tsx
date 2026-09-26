"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { DICTIONARY, type Locale } from "@/lib/i18n";

type ContextValue = { locale: Locale; t: (key: string) => string; switchLocale: (origin?: { x?: number; y?: number }) => void; switching: boolean };
const Context = createContext<ContextValue | null>(null);

export function LanguageProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [switching, setSwitching] = useState(false);
  const t = useCallback((key: string) => DICTIONARY[locale][key] ?? DICTIONARY.en[key] ?? key, [locale]);

  const switchLocale = useCallback((origin?: { x?: number; y?: number }) => {
    if (switching) return;
    const target = locale === "en" ? "ar" : "en";
    setSwitching(true);
    window.dispatchEvent(new CustomEvent("vanta:locale-transition", { detail: { target, x: origin?.x ?? window.innerWidth / 2, y: origin?.y ?? window.innerHeight / 2 } }));
    window.setTimeout(() => {
      setLocale(target);
      document.documentElement.lang = target;
      document.documentElement.dir = target === "ar" ? "rtl" : "ltr";
      document.cookie = "vanta-locale=" + target + ";path=/;max-age=31536000;samesite=lax";
    }, 360);
    window.setTimeout(() => setSwitching(false), 760);
  }, [locale, switching]);

  return <Context.Provider value={{ locale, t, switchLocale, switching }}>{children}</Context.Provider>;
}

export function useLang() {
  const value = useContext(Context);
  if (!value) throw new Error("useLang must be used inside LanguageProvider");
  return value;
}
