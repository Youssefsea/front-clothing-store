import type { Product } from "@/types";
export function splitCsv(value: unknown): string[] {
  if (typeof value !== "string") return [];
  return value.split(",").map(v=>v.trim()).filter(Boolean);
}
export function productImages(product: {image_url?:unknown}): string[] { return splitCsv(product.image_url); }
export function discountedPrice(product: Pick<Product,"price"|"discount">): number {
  const price = Number(product.price) || 0; const discount = Number(product.discount) || 0;
  return Math.max(0, price - (price * discount / 100));
}
export function formatPrice(value:number|string) {
  const n = Number(value);
  return Number.isFinite(n) ? new Intl.NumberFormat("en-EG",{style:"currency",currency:"EGP",maximumFractionDigits:2}).format(n) : "—";
}
export function joinPath(base:string,path:string){ return base.replace(/\/$/,"") + path; }
