import { api } from "./client";

/** Coerce sizes/colors whether the API returns a CSV string or an array. */
function toAttrList(value) {
  if (Array.isArray(value)) {
    return value
      .map((v) => String(v ?? "").trim())
      .filter(Boolean);
  }
  if (value == null || value === "") return [];
  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Backend product shape (normalized at the edge of the API layer).
export function normalizeProducts(input) {
  if (!Array.isArray(input)) return [];
  return input
    .filter(Boolean)
    .map((p) => ({
      id: p.id,
      title: p.title || "",
      description: p.description || "",
      price: Number(p.price) || 0,
      discount: Number(p.discount) || 0,
      stock: Number(p.stock) || 0,
      image_url: p.image_url || "",
      is_active: p.is_active !== false,
      created_at: p.created_at || null,
      category_name: p.category_name || "",
      sizes: toAttrList(p.sizes),
      colors: toAttrList(p.colors),
      finalPrice:
        Number(p.price) -
        (Number(p.price) * (Number(p.discount) || 0)) / 100,
    }));
}

export function getProductImageArray(product) {
  return (product?.image_url || "")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
}

export function getFinalPrice(price, discount) {
  const p = Number(price) || 0;
  const d = Number(discount) || 0;
  return p - (p * d) / 100;
}

export async function fetchProducts() {
  const data = await api.get("/products");
  return normalizeProducts(data?.allProducts);
}

export async function fetchProductByTitle(title) {
  const data = await api.post("/products/byName", { title });
  const product = data?.product;
  return normalizeProducts(
    Array.isArray(product) ? product : product ? [product] : []
  );
}

export async function fetchProductsByCategory(categoryName) {
  const data = await api.post("/products/byCategory", { category_name: categoryName });
  return normalizeProducts(data?.products);
}

export async function fetchProductsInRange(minPrice, maxPrice) {
  const data = await api.post("/products/inRange", {
    minPrice: Number(minPrice),
    maxPrice: Number(maxPrice),
  });
  return normalizeProducts(data?.products);
}

export async function fetchProductsByColor(color) {
  const data = await api.post("/products/byColor", { color });
  return normalizeProducts(data?.products);
}

// Unique, real categories derived from product data (never invented).
export function extractCategories(products) {
  const seen = new Set();
  const categories = [];
  for (const p of products) {
    const name = (p.category_name || "").trim();
    if (name && !seen.has(name)) {
      seen.add(name);
      categories.push(name);
    }
  }
  return categories;
}

export function extractColors(products) {
  const seen = new Set();
  const colors = [];
  for (const p of products) {
    for (const c of p.colors || []) {
      const key = c.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        colors.push(c);
      }
    }
  }
  return colors;
}

export function extractSizes(products) {
  const seen = new Set();
  const sizes = [];
  for (const p of products) {
    for (const s of p.sizes || []) {
      const key = s.toUpperCase();
      if (!seen.has(key)) {
        seen.add(key);
        sizes.push(s);
      }
    }
  }
  return sizes;
}

export function extractTitles(products) {
  const seen = new Set();
  const titles = [];
  for (const p of products) {
    const t = (p.title || "").trim();
    if (t && !seen.has(t)) {
      seen.add(t);
      titles.push(t);
    }
  }
  return titles;
}

// Admin product management ------------------------------------------------

export async function addProduct(payload) {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description || "");
  formData.append("price", String(payload.price));
  formData.append("discount", String(payload.discount ?? 0));
  formData.append("stock", String(payload.stock ?? 0));
  formData.append("category_name", payload.category_name);
  formData.append("sizes", payload.sizes || "");
  formData.append("colors", payload.colors || "");
  (payload.images || []).forEach((file) => formData.append("images", file));
  return api.fetch("/products/add", { method: "POST", formData });
}

export async function updateProduct(payload) {
  const formData = new FormData();
  formData.append("product_id", String(payload.product_id));
  formData.append("title", payload.title);
  formData.append("description", payload.description || "");
  formData.append("price", String(payload.price));
  formData.append("discount", String(payload.discount ?? 0));
  formData.append("stock", String(payload.stock ?? 0));
  formData.append("category_name", payload.category_name);
  formData.append("sizes", payload.sizes || "");
  formData.append("colors", payload.colors || "");
  (payload.images || []).forEach((file) => formData.append("images", file));
  return api.fetch("/products/update", { method: "PUT", formData });
}

export async function toggleProduct(productId) {
  return api.put("/products/toggle", {
    product_id: String(productId),
    id: String(productId),
  });
}