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
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
  } catch {
    // localStorage blocked/unavailable (private browsing, quota, etc.)
  }
  try {
    const attribute = document.documentElement.getAttribute("data-theme");
    if (attribute === "light" || attribute === "dark") return attribute;
  } catch {
    // DOM access failed
  }
  return "system";
}

function systemTheme() {
  if (typeof window === "undefined") return "light";
  try {
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

export function resolveTheme(mode) {
  if (typeof window === "undefined") return "light";
  return mode === "system" ? systemTheme() : mode;
}

function pulseThemeSwitch() {
  if (typeof document === "undefined") return;
  try {
    const root = document.documentElement;
    root.classList.remove("theme-switching");
    void root.offsetWidth;
    root.classList.add("theme-switching");
    window.setTimeout(() => root.classList.remove("theme-switching"), 420);
  } catch {}
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
    try {
      document.documentElement.setAttribute("data-theme", next);
    } catch {}
    try {
      window.localStorage.setItem(STORAGE_KEY, initial);
    } catch {}
  }, []);

  useEffect(() => {
    if (!ready.current) return;
    const next = mode === "system" ? systemTheme() : mode;
    setResolved(next);
    try {
      document.documentElement.setAttribute("data-theme", next);
    } catch {}
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {}

    if (mode !== "system") return undefined;
    try {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => {
        const nr = systemTheme();
        setResolved(nr);
        try {
          document.documentElement.setAttribute("data-theme", nr);
        } catch {}
      };
      mq.addEventListener?.("change", onChange);
      return () => mq.removeEventListener?.("change", onChange);
    } catch {
      return undefined;
    }
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
