export function formatPrice(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return "$0.00";
  if (Number.isInteger(num)) return `$${num.toFixed(2)}`;
  return `$${num.toFixed(2)}`;
}

export function splitImages(imageUrl) {
  return (imageUrl || "")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
}

export function uniqueBy(items, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = keyFn(item);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}

export function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function resolveLocale(locale) {
  if (locale === "ar") return "ar";
  return "en-US";
}

export function formatDate(value, locale = "en") {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(resolveLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value, locale = "en") {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(resolveLocale(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const STATUS_META = {
  pending: { label: "Pending", tone: "warn" },
  paid: { label: "Paid", tone: "ok" },
  shipped: { label: "Shipped", tone: "info" },
  delivered: { label: "Delivered", tone: "ok" },
  cancelled: { label: "Cancelled", tone: "err" },
};

export function statusLabel(status) {
  return STATUS_META[status]?.label || status || "Unavailable";
}

export function statusTone(status) {
  return STATUS_META[status]?.tone || "muted";
}