import { api } from "./client";

// The backend authenticates requests through the HTTP-only `token` cookie.
// Every call here relies on credentials: "include" (set in the client).

export function normalizeUser(u) {
  if (u == null) return null;
  const name = u.name || u.username || u.full_name || "";
  const email = u.email || "";
  const phone = u.phone || "";
  const isAdmin =
    u.role === "admin" ||
    u.is_admin === true ||
    u.isAdmin === true ||
    u.user_role === "admin";
  const role = u.role || u.user_role || (isAdmin ? "admin" : "customer");
  return { name, email, phone, role, isAdmin, _raw: u };
}

export async function sendOtp(email, phone) {
  const data = await api.post("/send-otp", { email, phone });
  return data;
}

export async function signup({ name, email, password, phone, otp }) {
  const data = await api.post("/signup", { name, email, password, phone, otp });
  return data;
}

export async function login(email, password) {
  const data = await api.post("/login", { email, password });
  return data;
}

export async function logout() {
  return api.post("/logout");
}

export async function checkLoggedIn() {
  const data = await api.get("/isLoggedIn");
  // The backend may return the user wrapped under `user` or directly.
  const candidate = data?.user || data;
  if (candidate === null || typeof candidate !== "object") {
    return null;
  }
  return normalizeUser(candidate);
}