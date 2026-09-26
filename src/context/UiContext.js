"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

const UiContext = createContext(null);

export function UiProvider({ children }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [globalMsg, setGlobalMsg] = useState(null);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const toggleCart = useCallback(() => setCartOpen((v) => !v), []);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const notify = useCallback((message) => {
    setGlobalMsg(message);
    if (message) {
      try {
        window.clearTimeout(notify._t);
        notify._t = window.setTimeout(() => setGlobalMsg(null), 2600);
      } catch {}
    }
  }, []);

  const value = {
    cartOpen,
    setCartOpen,
    openCart,
    closeCart,
    toggleCart,
    searchOpen,
    openSearch,
    closeSearch,
    globalMsg,
    notify,
  };

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used within UiProvider");
  return ctx;
}