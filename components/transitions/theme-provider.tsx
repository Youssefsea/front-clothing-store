"use client";

import { createContext, useCallback, useContext, useState } from "react";

type Theme = "light" | "dark";
type ContextValue = { theme: Theme; switchTheme: (origin?: { x?: number; y?: number }) => void; switching: boolean };
const Context = createContext<ContextValue | null>(null);

export function ThemeProvider({ initialTheme, children }: { initialTheme: Theme; children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [switching, setSwitching] = useState(false);

  const switchTheme = useCallback((origin?: { x?: number; y?: number }) => {
    if (switching) return;
    const target: Theme = theme === "dark" ? "light" : "dark";
    setSwitching(true);
    window.dispatchEvent(new CustomEvent("vanta:theme-transition", { detail: { target, x: origin?.x ?? window.innerWidth - 40, y: origin?.y ?? 40 } }));
    window.setTimeout(() => {
      document.documentElement.classList.toggle("dark", target === "dark");
      document.cookie = "vanta-theme=" + target + ";path=/;max-age=31536000;samesite=lax";
      setTheme(target);
    }, 360);
    window.setTimeout(() => setSwitching(false), 760);
  }, [theme, switching]);

  return <Context.Provider value={{ theme, switchTheme, switching }}>{children}</Context.Provider>;
}

export function useTheme() {
  const value = useContext(Context);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}
