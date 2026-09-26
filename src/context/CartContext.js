"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import { useAuth } from "./AuthContext";

import {
  getCart,
  getCartCount,
  addToCart as apiAdd,
  updateCartItem as apiUpdate,
  removeCartItem as apiRemove,
} from "@/lib/api/cart";

import { ApiError } from "@/lib/api/client";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const {
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState({});
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    // Do nothing while auth state is still being resolved.
    if (authLoading) return;

    // Logged out = empty cart.
    if (!isAuthenticated) {
      setItems([]);
      setCount(0);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Cart items are the primary source.
      const cartItems = await getCart();

      const safeItems = Array.isArray(cartItems)
        ? cartItems
        : [];

      setItems(safeItems);

      // Count is secondary.
      try {
        const cartCount = await getCartCount();
        setCount(Number(cartCount) || 0);
      } catch {
        // Fallback: calculate count locally.
        const fallbackCount = safeItems.reduce(
          (sum, item) => sum + (Number(item.quantity) || 0),
          0
        );

        setCount(fallbackCount);
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not load cart"
      );
    } finally {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addToCart = useCallback(
    async (productId, quantity = 1, size = "", color = "") => {
      setError(null);

      await apiAdd({
        product_id: productId,
        quantity,
        size,
        color,
      });

      await refresh();
    },
    [refresh]
  );

  const updateQuantity = useCallback(
    async (cartItemId, delta) => {
      const item = items.find(
        (i) => i.cart_item_id === cartItemId
      );

      if (!item) return;

      setMutating((m) => ({
        ...m,
        [cartItemId]: true,
      }));

      const previous = items;

      setItems((list) =>
        list.map((i) =>
          i.cart_item_id === cartItemId
            ? {
                ...i,
                quantity: Math.max(
                  0,
                  i.quantity + delta
                ),
              }
            : i
        )
      );

      try {
        await apiUpdate({
          product_id: item.product_id,
          delta,
          size: item.size,
          color: item.color,
        });

        await refresh();
      } catch (err) {
        setItems(previous);

        setError(
          err instanceof ApiError
            ? err.message
            : "Update failed"
        );
      } finally {
        setMutating((m) => ({
          ...m,
          [cartItemId]: false,
        }));
      }
    },
    [items, refresh]
  );

  const removeFromCart = useCallback(
    async (cartItemId) => {
      const previous = items;

      setError(null);

      setMutating((m) => ({
        ...m,
        [cartItemId]: true,
      }));

      setItems((list) =>
        list.filter(
          (i) => i.cart_item_id !== cartItemId
        )
      );

      try {
        await apiRemove(cartItemId);
        await refresh();
      } catch (err) {
        setItems(previous);

        setError(
          err instanceof ApiError
            ? err.message
            : "Remove failed"
        );

        throw err;
      } finally {
        setMutating((m) => ({
          ...m,
          [cartItemId]: false,
        }));
      }
    },
    [items, refresh]
  );

  const totals = useMemo(() => {
    const totalItems = items.reduce(
      (sum, item) =>
        sum + (Number(item.quantity) || 0),
      0
    );

    const subtotal = items.reduce(
      (sum, item) =>
        sum +
        (Number(item.final_price) || 0) *
          (Number(item.quantity) || 0),
      0
    );

    return {
      totalItems,
      subtotal,
      itemLines: items.length,
    };
  }, [items]);

  const value = {
    items,
    count,
    loading,
    mutating,
    error,
    refresh,
    addToCart,
    updateQuantity,
    removeFromCart,
    totals,
    ...totals,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error(
      "useCart must be used within CartProvider"
    );
  }

  return ctx;
}