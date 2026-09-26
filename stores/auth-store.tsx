"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { apiRequest } from "@/lib/api";
import { clearSession, readSession, writeSession } from "@/lib/storage";
import type { User } from "@/types/domain";
import { ApiError } from "@/types/api";

type AuthStatus = "unknown" | "checking" | "authenticated" | "unauthenticated";

type AuthStore = {
  status: AuthStatus;
  user: User | null;
  init: () => Promise<void>;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
};

export const useAuth = create<AuthStore>((set, get) => ({
  status: "unknown",
  user: null,

  init: async () => {
    if (get().status === "checking") return;
    set({ status: "checking" });

    const snapshot = readSession();
    try {
      const session = await apiRequest<{ message: string; name: string; email: string }>("/isLoggedIn");
      const role = snapshot?.user.role ?? "user";
      let user: User = { name: session.name, email: session.email, role };
      if (snapshot?.user.email === session.email) user = { ...snapshot.user, name: session.name, email: session.email };

      if (user.role === "admin") {
        try {
          await apiRequest("/admin/users");
        } catch (error) {
          if (error instanceof ApiError && error.status === 403) user = { ...user, role: "user" };
        }
      }

      writeSession(user);
      set({ status: "authenticated", user });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) clearSession();
      set({ status: "unauthenticated", user: null });
    }
  },

  setUser: (user) => {
    writeSession(user);
    set({ status: "authenticated", user });
  },

  logout: async () => {
    try { await apiRequest("/logout", { method: "POST" }); } finally {
      clearSession();
      set({ status: "unauthenticated", user: null });
    }
  }
}));

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const status = useAuth((s) => s.status);
  const init = useAuth((s) => s.init);

  useEffect(() => { void init(); }, [init]);

  if (status === "unknown" || status === "checking") {
    return <div className="min-h-screen bg-background" aria-busy="true">{children}</div>;
  }

  return <>{children}</>;
}
