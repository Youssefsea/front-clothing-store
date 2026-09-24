"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// Theme system — `vanta.theme` (light | dark | system) persisted in
// localStorage. The <html> element is pre-themed by the no-flash script
// in layout.js before React hydrates, so state starts from that value.

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
  return typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveTheme(mode) {
  return mode === "system" ? systemTheme() : mode;
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(readInitial);

  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute("data-theme", resolveTheme(mode));
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      document.documentElement.setAttribute("data-theme", systemTheme());
    };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [mode]);

  const toggle = useCallback(() => {
    setMode((m) => (resolveTheme(m) === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({
      mode,
      resolved: resolveTheme(mode),
      isDark: resolveTheme(mode) === "dark",
      toggle,
      setMode,
    }),
    [mode, toggle]
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