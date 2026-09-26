"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { DICTIONARY, type Locale } from "@/lib/i18n";
import { usePathname } from "next/navigation";
import { useCallback } from "react";

type ContextValue = {
  locale: Locale;
  t: (key: string) => string;
  switchLocale: (origin?: { x?: number; y?: number }) => void;
};

const Context = createContext<ContextValue | null>(null);

export function LanguageProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const pathname = usePathname();

  const t = useCallback((key: string) => DICTIONARY[locale][key] ?? DICTIONARY.en[key] ?? key, [locale]);

  const switchLocale = useCallback((origin?: { x?: number; y?: number }) => {
    const target = locale === "en" ? "ar" : "en";
    window.dispatchEvent(new CustomEvent("vanta:locale-transition", { detail: { target, x: origin?.x ?? window.innerWidth / 2, y: origin?.y ?? window.innerHeight / 2 } }));
    window.setTimeout(() => {
      setLocale(target);
      document.documentElement.lang = target;
      document.documentElement.dir = target === "ar" ? "rtl" : "ltr";
      document.cookie = "vanta-locale=" + target + ";path=/;max-age=31536000;samesite=lax";
    }, 360);
  }, [locale]);

  useMemo(() => { void pathname; }, [pathname]);

  return <Context.Provider value={{ locale, t, switchLocale }}>{children}</Context.Provider>;
}

export function useLang() {
  const value = useContext(Context);
  if (!value) throw new Error("useLang must be used inside LanguageProvider");
  return value;
}
