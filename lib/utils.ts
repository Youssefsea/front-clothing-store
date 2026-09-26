export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatPrice(value: number | string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(amount);
}

export function parseList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((v) => v.trim()).filter(Boolean);
  if (typeof value !== "string") return [];
  return value.split(",").map((v) => v.trim()).filter(Boolean);
}

export function productImages(value: unknown): string[] {
  return parseList(value).filter((url) => /^https?:\/\//i.test(url));
}

export function discountPrice(price: number, discount: number) {
  return Math.max(0, price - (price * discount) / 100);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function safeNumber(value: unknown, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
