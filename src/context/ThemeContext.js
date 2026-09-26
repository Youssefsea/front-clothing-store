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

// Theme system — `vanta.theme` (light | dark | system) persisted in
// localStorage. The <html> element is pre-themed by the no-flash script
// in layout.js before React hydrates.
//
// SSR-safety: `resolveTheme()` depends on matchMedia (browser-only), so we
// must NOT compute it during the first render — server would resolve to
// light while the client could resolve to dark, aborting hydration (#418).
// The provider therefore starts both sides on `resolved = "light"` and only
// reconciles to the real preference inside an effect (already hydrated at
// that point). The no-flash script keeps the pre-hydration paint correct.

const STORAGE_KEY = "vanta.theme";

function readInitial() {
  if (typeof window === "undefined") return "system";
  const attribute = document.documentElement.getAttribute("data-theme");
  if (attribute === "light" || attribute === "dark") return attribute;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "light" || saved === "dark" || saved === "system"
    ? saved
    : "system";
}

function systemTheme() {
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveTheme(mode) {
  return mode === "system" ? systemTheme() : mode;
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState("system");
  const [resolved, setResolved] = useState("light");
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    setMode(readInitial());
  }, []);

  useEffect(() => {
    if (!didInit.current) return;
    const next = mode === "system" ? systemTheme() : mode;
    setResolved(next);
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem(STORAGE_KEY, mode);

    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const nr = systemTheme();
      setResolved(nr);
      document.documentElement.setAttribute("data-theme", nr);
    };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [mode]);

  const toggle = useCallback(() => {
    setMode((m) => (m !== "system" && m === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({
      mode,
      resolved,
      isDark: resolved === "dark",
      toggle,
      setMode,
    }),
    [mode, resolved, toggle]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}