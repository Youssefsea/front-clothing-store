"use client";

import React from "react";
import { create } from "zustand";
import { apiRequest } from "@/lib/api";
import { ApiError } from "@/types/api";
import type { CartItem } from "@/types/domain";
import { useAuth } from "@/stores/auth-store";

type CartStatus = "idle" | "loading" | "ready" | "error";

type CartStore = {
  status: CartStatus;
  items: CartItem[];
  total: number;
  count: number;
  error: string | null;
  hydrate: () => Promise<void>;
  add: (input: { product_id: number; quantity: number; size: string; color: string }) => Promise<void>;
  update: (input: { product_id: number; delta: number; size: string; color: string }) => Promise<void>;
  remove: (product_id: number) => Promise<void>;
  clear: () => void;
};

export const useCart = create<CartStore>((set) => ({
  status: "idle",
  items: [],
  total: 0,
  count: 0,
  error: null,

  hydrate: async () => {
    set({ status: "loading", error: null });
    try {
      const response = await apiRequest<{ items?: CartItem[]; total?: number }>("/cart");
      const items = Array.isArray(response.items) ? response.items : [];
      const count = items.reduce((sum, item) => sum + Math.max(0, Number(item.quantity) || 0), 0);
      set({ status: "ready", items, total: Number(response.total ?? 0), count, error: null });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        set({ status: "ready", items: [], total: 0, count: 0, error: null });
      } else if (error instanceof ApiError && error.status === 401) {
        set({ status: "idle", items: [], total: 0, count: 0, error: null });
      } else {
        set({ status: "error", error: error instanceof Error ? error.message : "Cart failed" });
      }
    }
  },

  add: async (input) => {
    await apiRequest("/cart/add", { method: "POST", body: input });
    await useCart.getState().hydrate();
  },

  update: async (input) => {
    await apiRequest("/cart/update", { method: "POST", body: input });
    await useCart.getState().hydrate();
  },

  remove: async (product_id) => {
    await apiRequest("/cart/delete", { method: "DELETE", body: { product_id } });
    await useCart.getState().hydrate();
  },

  clear: () => set({ status: "ready", items: [], total: 0, count: 0, error: null })
}));

export function CartBootstrap({ children }: { children: React.ReactNode }) {
  const authStatus = useAuth((s) => s.status);
  const hydrate = useCart((s) => s.hydrate);

  React.useEffect(() => {
    if (authStatus === "authenticated") queueMicrotask(() => void hydrate());
  }, [authStatus, hydrate]);

  return <>{children}</>;
}
