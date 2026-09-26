"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  checkLoggedIn,
  login as apiLogin,
  logout as apiLogout,
  normalizeUser,
} from "@/lib/api/auth";
import { ApiError, isApiError } from "@/lib/api/client";

const AuthContext = createContext(null);
const SESSION_USER_KEY = "vanta.sessionUser";

function readStoredUser() {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(window.sessionStorage.getItem(SESSION_USER_KEY) || "null"); } catch { return null; }
}
function writeStoredUser(user) {
  if (typeof window === "undefined") return;
  try { window.sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user)); } catch {}
}
function clearStoredUser() {
  if (typeof window === "undefined") return;
  try { window.sessionStorage.removeItem(SESSION_USER_KEY); } catch {}
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true); // initial session restore
  const [error, setError] = useState(null);

  const restoreSession = useCallback(async () => {
    setLoading(true);
    try {
      const found = await checkLoggedIn();
      if (found) {
        const stored = readStoredUser();
        const merged = normalizeUser({ ...stored, ...found, role: found.role || stored?.role });
        setUser(merged);
        setIsAdmin(merged?.isAdmin === true || merged?.role === "admin");
        writeStoredUser(merged);
      } else {
        setUser(null);
        setIsAdmin(false);
        clearStoredUser();
      }
    } catch (err) {
      setUser(null);
      setIsAdmin(false);
      clearStoredUser();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = useCallback(
    async (email, password) => {
      setError(null);
      let data;
      try {
        data = await apiLogin(email, password);
      } catch (err) {
        const msg =
          err instanceof ApiError
            ? err.message
            : err?.data?.error || err?.data?.message || "Sign in failed";
        setError(msg);
        throw err;
      }
      const candidate = data?.user || data;
      const normalized =
        normalizeUser(candidate) ||
        normalizeUser({ email, name: email?.split("@")[0] });
      setUser(normalized);
      setIsAdmin(normalized?.isAdmin === true || normalized?.role === "admin");
      writeStoredUser(normalized);
      return data;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (err) {
      // Ignore logout failures — clear local session regardless.
    }
    setUser(null);
    setIsAdmin(false);
    clearStoredUser();
  }, []);

  const value = {
    user,
    isAdmin,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    checkAuth: restoreSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}