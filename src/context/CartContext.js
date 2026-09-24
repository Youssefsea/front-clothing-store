"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import apiClient from "@/lib/api";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get("/cart");
      setItems(res.data.items || []);
    } catch (err) {
      // If 401, user is not logged in (this is okay)
      if (err.status !== 401) {
        setError(err.data?.error || "Failed to load cart");
      }
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1, size, color) => {
    try {
      setError(null);
      const res = await apiClient.post("/cart/add", {
        product_id: productId,
        quantity,
        size,
        color,
      });
      await fetchCart();
      return res.data;
    } catch (err) {
      const msg = err.data?.error || err.data?.message || "Failed to add to cart";
      setError(msg);
      throw err;
    }
  };

  const updateCart = async (productId, delta, size, color) => {
    try {
      setError(null);
      const res = await apiClient.post("/cart/update", {
        product_id: productId,
        delta,
        size,
        color,
      });
      await fetchCart();
      return res.data;
    } catch (err) {
      const msg = err.data?.error || err.data?.message || "Failed to update cart";
      setError(msg);
      throw err;
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      setError(null);
      const res = await apiClient.post("/cart/remove", { cart_item_id: cartItemId });
      await fetchCart();
      return res.data;
    } catch (err) {
      const msg = err.data?.error || err.data?.message || "Failed to remove from cart";
      setError(msg);
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      setError(null);
      const res = await apiClient.post("/cart/clear");
      setItems([]);
      return res.data;
    } catch (err) {
      const msg = err.data?.error || err.data?.message || "Failed to clear cart";
      setError(msg);
      throw err;
    }
  };

  const getCartSummary = () => {
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = items.reduce((acc, item) => acc + (item.final_price || 0) * item.quantity, 0);
    return { totalItems, subtotal, itemCount: items.length };
  };

  const value = {
    items,
    loading,
    error,
    addToCart,
    updateCart,
    removeFromCart,
    clearCart,
    fetchCart,
    getCartSummary,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
