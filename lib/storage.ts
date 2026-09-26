const VERSION = 1;
const KEY = "vanta-session";

export type SessionSnapshot = {
  version: number;
  user: { id?: number; name: string; email: string; role: "user" | "admin"; phone?: string | null };
};

export function readSession(): SessionSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const value = parsed as Partial<SessionSnapshot>;
    if (value.version !== VERSION || !value.user || typeof value.user !== "object") return null;
    const user = value.user as Partial<SessionSnapshot["user"]>;
    if (typeof user.name !== "string" || typeof user.email !== "string" || (user.role !== "user" && user.role !== "admin")) return null;
    return { version: VERSION, user: { id: typeof user.id === "number" ? user.id : undefined, name: user.name, email: user.email, role: user.role, phone: typeof user.phone === "string" ? user.phone : null } };
  } catch {
    return null;
  }
}

export function writeSession(user: SessionSnapshot["user"]) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify({ version: VERSION, user }));
  } catch {}
}

export function clearSession() {
  try { window.sessionStorage.removeItem(KEY); } catch {}
}
