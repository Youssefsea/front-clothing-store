"use client";

import { createContext, useContext, useState, useCallback } from "react";

type Theme = "light" | "dark";
type ContextValue = { theme: Theme; switchTheme: (origin?: { x?: number; y?: number }) => void };
const Context = createContext<ContextValue | null>(null);

export function ThemeProvider({ initialTheme, children }: { initialTheme: Theme; children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  const apply = (target: Theme) => {
    document.documentElement.classList.toggle("dark", target === "dark");
    document.cookie = "vanta-theme=" + target + ";path=/;max-age=31536000;samesite=lax";
    setTheme(target);
  };

  const switchTheme = useCallback((origin?: { x?: number; y?: number }) => {
    const target = theme === "dark" ? "light" : "dark";
    window.dispatchEvent(new CustomEvent("vanta:theme-transition", { detail: { target, x: origin?.x ?? window.innerWidth - 40, y: origin?.y ?? 40 } }));
    window.setTimeout(() => apply(target), 360);
  }, [theme]);

  return <Context.Provider value={{ theme, switchTheme }}>{children}</Context.Provider>;
}

export function useTheme() {
  const value = useContext(Context);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}
