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

const STORAGE_KEY = "vanta.theme";

function readStoredMode() {
  if (typeof window === "undefined") return "system";
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark" || saved === "system") return saved;
  const attribute = document.documentElement.getAttribute("data-theme");
  if (attribute === "light" || attribute === "dark") return attribute;
  return "system";
}

function systemTheme() {
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveTheme(mode) {
  if (typeof window === "undefined") return "light";
  return mode === "system" ? systemTheme() : mode;
}

function pulseThemeSwitch() {
  const root = document.documentElement;
  root.classList.remove("theme-switching");
  // Force reflow so re-adding the class retriggers the animation.
  void root.offsetWidth;
  root.classList.add("theme-switching");
  window.setTimeout(() => root.classList.remove("theme-switching"), 420);
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState("light");
  const [resolved, setResolved] = useState("light");
  const ready = useRef(false);

  useEffect(() => {
    const initial = readStoredMode();
    const next = initial === "system" ? systemTheme() : initial;
    ready.current = true;
    setModeState(initial);
    setResolved(next);
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem(STORAGE_KEY, initial);
  }, []);

  useEffect(() => {
    if (!ready.current) return;
    const next = mode === "system" ? systemTheme() : mode;
    setResolved(next);
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem(STORAGE_KEY, mode);

    if (mode !== "system") return undefined;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const nr = systemTheme();
      setResolved(nr);
      document.documentElement.setAttribute("data-theme", nr);
    };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, [mode]);

  const setMode = useCallback((next) => {
    setModeState(next);
  }, []);

  const toggle = useCallback(() => {
    pulseThemeSwitch();
    setModeState((m) => {
      const current = m === "system" ? systemTheme() : m;
      return current === "dark" ? "light" : "dark";
    });
  }, []);

  const value = useMemo(
    () => ({
      mode,
      resolved,
      isDark: resolved === "dark",
      toggle,
      setMode,
    }),
    [mode, resolved, toggle, setMode]
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
