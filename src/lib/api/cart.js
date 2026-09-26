import { api, ApiError } from "./client";

// Cart state always comes from the backend. Optimistic UI updates are only
// visual; the backend remains authoritative.

export function normalizeCartItems(input) {
  if (!Array.isArray(input)) return [];
  return input
    .filter(Boolean)
    .map((item) => ({
      cart_item_id: item.cart_item_id,
      product_id: item.product_id,
      title: item.title || "",
      color: item.color || "",
      size: item.size || "",
      quantity: Number(item.quantity) || 0,
      price: Number(item.price ?? item.product_price ?? item.final_price) || 0,
      final_price: Number(item.final_price ?? item.price ?? item.product_price) || 0,
      stock: item.stock != null ? Number(item.stock) : null,
      image: item.image || item.image_url || "",
      discount: Number(item.discount) || 0,
      is_active: item.is_active !== false,
      available: item.available !== false,
    }));
}

export async function getCart() {
  try {
    const data = await api.get("/cart");
    return normalizeCartItems(data?.items || data?.cart || []);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return [];
    throw err;
  }
}

export async function getCartCount() {
  try {
    const data = await api.get("/cart/count");
    return Number(data?.count ?? data?.total_items ?? 0);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return 0;
    throw err;
  }
}

export async function addToCart({ product_id, quantity = 1, size = "", color = "" }) {
  return api.post("/cart/add", {
    product_id,
    quantity,
    size,
    color,
  });
}

export async function updateCartItem({ product_id, delta = 0, size = "", color = "" }) {
  return api.post("/cart/update", {
    product_id,
    delta,
    size,
    color,
  });
}

export async function removeCartItem(product_id) {
  return api.del("/cart/delete", { product_id });
}