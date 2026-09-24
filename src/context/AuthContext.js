"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import apiClient from "@/lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      // Try to fetch user profile to verify auth status
      // This endpoint may not exist on backend, so we'll gracefully handle it
      try {
        const res = await apiClient.get("/user/profile");
        setUser(res.data.user || res.data);
      } catch (err) {
        // If 401, user is not logged in
        if (err.status === 401) {
          setUser(null);
        }
        // If other error, we might still be logged in (backend may not have profile endpoint)
        // So we silently fail here
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const res = await apiClient.post("/login", { email, password });
      setUser(res.data.user || { email });
      return res.data;
    } catch (err) {
      const msg = err.data?.error || err.data?.message || "Login failed";
      setError(msg);
      throw err;
    }
  };

  const signup = async (name, email, password, phone, otp) => {
    try {
      setError(null);
      const res = await apiClient.post("/signup", {
        name,
        email,
        password,
        phone,
        otp,
      });
      setUser(res.data.user || { email });
      return res.data;
    } catch (err) {
      const msg = err.data?.error || err.data?.message || "Signup failed";
      setError(msg);
      throw err;
    }
  };

  const sendOTP = async (email, phone) => {
    try {
      setError(null);
      const res = await apiClient.post("/send-otp", { email, phone });
      return res.data;
    } catch (err) {
      const msg = err.data?.error || err.data?.message || "Failed to send OTP";
      setError(msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await apiClient.post("/logout");
      setUser(null);
    } catch (err) {
      // Even if logout fails, clear local user state
      setUser(null);
      const msg = err.data?.error || err.data?.message || "Logout failed";
      setError(msg);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    sendOTP,
    logout,
    isAuthenticated: !!user,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
