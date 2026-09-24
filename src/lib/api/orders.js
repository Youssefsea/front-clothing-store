import { api } from "./client";

// Order responses can vary slightly between the user and admin views.
// Normalize defensively so the UI can rely on a stable shape.

export function normalizeOrderItems(items) {
  if (!Array.isArray(items)) return [];
  return items.map((i) => ({
    title: i.title || i.product_title || "",
    price: Number(i.price ?? i.final_price ?? 0),
    quantity: Number(i.quantity) || 1,
    image_url: i.image_url || i.image || "",
    size: i.size || "",
    color: i.color || "",
    product_id: i.product_id,
  }));
}

export function normalizeOrder(o) {
  return {
    id: o.id ?? o.order_id,
    status: o.status || "pending",
    total: Number(o.total ?? 0),
    address: o.address || "",
    payment_method: o.payment_method || "",
    payment_screenshot: o.payment_screenshot || "",
    created_at: o.created_at || o.createdAt || null,
    items: normalizeOrderItems(o.items),
    customer: {
      name: o.customer_name || o.user_name || o.name || "",
      email: o.customer_email || o.user_email || o.email || "",
      phone: o.customer_phone || o.phone || "",
    },
  };
}

export function normalizeOrders(input) {
  if (!Array.isArray(input)) return [];
  return input.map(normalizeOrder);
}

export async function confirmOrder({ paymentMethod, address, screenshot }) {
  const formData = new FormData();
  formData.append("payment_method", paymentMethod);
  formData.append("address", address);
  formData.append("payment_screenshot", screenshot);
  // Note: browser sets the multipart boundary automatically.
  return api.fetch("/orders/confirm", { method: "POST", formData });
}

export async function getMyOrders() {
  const data = await api.get("/orders/orderForUser");
  return normalizeOrders(data?.orders || []);
}