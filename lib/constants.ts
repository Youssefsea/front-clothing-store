export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
export const HERO_IMAGE_FALLBACK = process.env.NEXT_PUBLIC_HERO_IMAGE_URL || "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=2200&q=85";
export const HERO_VIDEO_URL = process.env.NEXT_PUBLIC_HERO_VIDEO_URL || "";
export const SUPPORTED_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;
export const PAYMENT_METHODS = ["vodafone_cash", "instapay"] as const;
export const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;
