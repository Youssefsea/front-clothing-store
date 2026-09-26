import { api, apiGetWithBody } from "./client";
import { normalizeOrders } from "./orders";

// Admin API — every endpoint requires the HTTP-only token cookie.

export async function getAdminOrders() {
  const data = await api.get("/admin/orders");
  return normalizeOrders(data?.orders || []);
}

export async function getAdminOrdersByUserId(userId) {
  const data = await apiGetWithBody("/admin/orders/userId", {
    user_id: userId,
  });
  return normalizeOrders(data?.orders || []);
}

export async function getAdminOrdersByEmail(email) {
  const data = await apiGetWithBody("/admin/orders/userEmail", { email });
  return normalizeOrders(data?.orders || []);
}

export async function updateOrderStatus(orderId, status) {
  return api.put("/admin/orders/status", {
    order_id: String(orderId),
    status,
  });
}

export function normalizeAdminUsers(input) {
  if (!Array.isArray(input)) return [];
  return input
    .filter(Boolean)
    .map((u) => ({
      id: u.id ?? u.user_id,
      name: u.name || u.username || "",
      email: u.email || "",
      phone: u.phone || "",
      role: u.role || (u.is_admin ? "admin" : "customer"),
      created_at: u.created_at || null,
    }));
}

export async function getAdminUsers() {
  const data = await api.get("/admin/users");
  return normalizeAdminUsers(data?.users || []);
}

export async function deleteAdminUser(userId) {
  return api.del("/admin/users/delete", { user_id: String(userId) });
}

export async function findAdminUserByEmail(email) {
  const data = await apiGetWithBody("/admin/users/email", { email });
  return normalizeAdminUsers(data?.users || (data?.user ? [data.user] : []));
}

export async function findAdminUserByPhone(phone) {
  const data = await apiGetWithBody("/admin/users/phone", { phone });
  return normalizeAdminUsers(data?.users || (data?.user ? [data.user] : []));
}

export function normalizeAdminOrderStats(orders) {
  const pending = orders.filter((o) => o.status === "pending").length;
  const shipped = orders.filter((o) => o.status === "shipped").length;
  const delivered = orders.filter((o) => o.status === "delivered").length;
  const paid = orders.filter((o) => o.status === "paid").length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  return { pending, shipped, delivered, paid, totalRevenue };
}

export const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];
