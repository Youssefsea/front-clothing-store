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
import { probeAdmin } from "@/lib/api/admin";
import { ApiError, isApiError } from "@/lib/api/client";

const AuthContext = createContext(null);

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
        setUser(found);
        // Sessions are authoritative: probe a real admin route before trusting client state.
        try {
          await probeAdmin();
          setIsAdmin(true);
        } catch {
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
    } catch (err) {
      setUser(null);
      setIsAdmin(false);
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
      try {
        await probeAdmin();
        setIsAdmin(true);
      } catch {
        setIsAdmin(false);
      }
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