"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  fetchProducts,
  addProduct,
  updateProduct,
  toggleProduct,
  extractCategories,
} from "@/lib/api/products";
import { formatPrice, splitImages } from "@/lib/format";
import { ApiError } from "@/lib/api/client";
import { useUi } from "@/context/UiContext";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import ProductImage from "@/components/ProductImage";

const EMPTY = {
  title: "",
  description: "",
  price: "",
  discount: "0",
  stock: "0",
  category_name: "",
  sizes: "",
  colors: "",
};

export default function AdminProducts() {
  const { notify } = useUi();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { product } | "new" | null
  const [form, setForm] = useState(EMPTY);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(null);

  const categories = useMemo(() => extractCategories(products), [products]);

  const load = async () => {
    setLoading(true);
    try {
      setProducts(await fetchProducts());
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Could not load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNew = () => {
    setForm(EMPTY);
    setFiles([]);
    setPreviews([]);
    setFormError("");
    setModal("new");
  };

  const openEdit = (p) => {
    setForm({
      title: p.title || "",
      description: p.description || "",
      price: String(p.price || ""),
      discount: String(p.discount || 0),
      stock: String(p.stock || 0),
      category_name: p.category_name || "",
      sizes: (p.sizes || []).join(", "),
      colors: (p.colors || []).join(", "),
    });
    setFiles([]);
    setPreviews(splitImages(p.image_url));
    setFormError("");
    setModal(p);
  };

  const closeModal = () => {
    setModal(null);
    setPreviews((pv) => pv.filter((x) => x.startsWith("blob:")));
    setFiles([]);
  };

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setFormError("");
  };

  const handleFiles = (fileList) => {
    const arr = Array.from(fileList || []).slice(0, 5);
    if (files.length + arr.length > 5) {
      arr.length = 5 - files.length;
    }
    setFiles((prev) => [...prev, ...arr]);
    setPreviews((prev) => [
      ...prev,
      ...arr.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const save = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      discount: Number(form.discount) || 0,
      stock: Number(form.stock) || 0,
      category_name: form.category_name.trim(),
      sizes: form.sizes
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
        .join(","),
      colors: form.colors
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
        .join(","),
    };

    if (!payload.title) return setFormError("Title is required.");
    if (!(payload.price >= 0)) return setFormError("Enter a valid price.");
    if (!payload.category_name) return setFormError("Category is required.");

    const isNew = modal === "new";
    if (isNew && files.length === 0) {
      return setFormError("Add at least one product image.");
    }

    setSaving(true);
    try {
      if (isNew) {
        await addProduct({ ...payload, images: files });
        notify("Product created");
      } else {
        await updateProduct({
          ...payload,
          product_id: modal.id,
          images: files,
        });
        notify("Product updated");
      }
      setModal(null);
      setPreviews((pv) => pv.filter((x) => x.startsWith("blob:")));
      setFiles([]);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not save product");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (p) => {
    setToggling(String(p.id));
    try {
      await toggleProduct(p.id);
      setProducts((list) =>
        list.map((x) => (x.id === p.id ? { ...x, is_active: !x.is_active } : x))
      );
      notify(`${p.title} ${p.is_active ? "hidden" : "live"}`);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Could not toggle product");
    } finally {
      setToggling(null);
    }
  };

  const activeCount = products.filter((p) => p.is_active !== false).length;

  return (
    <div>
      <div className="admin-bar">
        <div>
          <p className="section-label">Catalog</p>
          <h1 className="section-title" style={{ fontSize: "1.9rem" }}>Products</h1>
          <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            {products.length} total · {activeCount} live
          </span>
        </div>
        <button className="btn btn--accent btn--sm" onClick={openNew}>+ Add product</button>
      </div>

      {loading ? (
        <Loader label="Loading products" />
      ) : products.length === 0 ? (
        <EmptyState
          icon="◎"
          title="No products yet"
          body="Create your first product to bring life to the store."
          action={<button className="btn btn--primary btn--sm" onClick={openNew}>Add product</button>}
        />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Sizes</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 220 }}>
                      <ProductImage imageUrl={p.image_url} alt={p.title} className="order-line__img" style={{ width: 44, height: 54 }} />
                      <span style={{ fontWeight: 500 }}>{p.title}</span>
                    </div>
                  </td>
                  <td>{p.category_name}</td>
                  <td style={{ fontFamily: "var(--display)", fontWeight: 600 }}>
                    {formatPrice(p.finalPrice)}
                    {p.discount > 0 && (
                      <span className="p-card__badge" style={{ position: "static", marginLeft: 8 }}>-{Math.round(p.discount)}%</span>
                    )}
                  </td>
                  <td>{p.stock}</td>
                  <td>{p.sizes.join(", ") || "—"}</td>
                  <td>
                    <button
                      className={`badge ${p.is_active !== false ? "badge--ok" : "badge--err"}`}
                      onClick={() => toggle(p)}
                      disabled={toggling === String(p.id)}
                      style={{ cursor: "pointer" }}
                      aria-label={`Toggle visibility of ${p.title}`}
                    >
                      {p.is_active !== false ? "Live" : "Hidden"}
                    </button>
                  </td>
                  <td>
                    <button className="cart-line__remove" onClick={() => openEdit(p)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal__panel">
            <div className="drawer__head">
              <h3>{modal === "new" ? "New product" : `Edit — ${modal.title}`}</h3>
              <button className="icon-btn" onClick={closeModal} aria-label="Close">✕</button>
            </div>

            <form onSubmit={save} className="modal__body">
              {formError && (
                <div role="alert" style={{ color: "var(--err)", background: "rgba(192,57,43,0.07)", border: "1px solid rgba(192,57,43,0.2)", padding: "12px 14px", borderRadius: "var(--radius)", fontSize: "0.88rem", marginBottom: 16 }}>
                  {formError}
                </div>
              )}

              <div className="field">
                <label htmlFor="p-title">Title *</label>
                <input id="p-title" value={form.title} onChange={(e) => setField("title", e.target.value)} placeholder="Overcoat Black" />
              </div>

              <div className="field">
                <label htmlFor="p-cat">Category *</label>
                <input
                  id="p-cat"
                  list="admin-categories"
                  value={form.category_name}
                  onChange={(e) => setField("category_name", e.target.value)}
                  placeholder="e.g. Outerwear"
                />
                <datalist id="admin-categories">
                  {categories.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>

              <div className="field">
                <label htmlFor="p-desc">Description</label>
                <textarea id="p-desc" value={form.description} onChange={(e) => setField("description", e.target.value)} placeholder="Materials, fit, care notes…" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                <div className="field">
                  <label htmlFor="p-price">Price (USD) *</label>
                  <input id="p-price" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setField("price", e.target.value)} placeholder="120" />
                </div>
                <div className="field">
                  <label htmlFor="p-disc">Discount %</label>
                  <input id="p-disc" type="number" min="0" max="100" value={form.discount} onChange={(e) => setField("discount", e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="p-stock">Stock *</label>
                  <input id="p-stock" type="number" min="0" value={form.stock} onChange={(e) => setField("stock", e.target.value)} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="field">
                  <label htmlFor="p-sizes">Sizes (comma separated)</label>
                  <input id="p-sizes" value={form.sizes} onChange={(e) => setField("sizes", e.target.value)} placeholder="S, M, L, XL" />
                </div>
                <div className="field">
                  <label htmlFor="p-colors">Colors (comma separated)</label>
                  <input id="p-colors" value={form.colors} onChange={(e) => setField("colors", e.target.value)} placeholder="Black, Charcoal" />
                </div>
              </div>

              <div className="field">
                <label>Images (up to 5) {modal !== "new" && <span className="field__hint">— existing images are kept; add files to replace/append</span>}</label>
                <div className={`file-drop ${previews.length > 0 ? "has-file" : ""}`}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                  <div className="file-drop__title">Click to choose images</div>
                  <div className="file-drop__sub">PNG or JPG, up to 8 MB each</div>
                </div>
                {previews.length > 0 && (
                  <div className="drop-zone--preview">
                    {previews.map((src, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`Preview ${i + 1}`} style={{ width: 84, height: 100, objectFit: "cover", borderRadius: "var(--radius)", border: "1px solid var(--line)" }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn--outline btn--dark-text btn--sm" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
                  {saving ? "Saving…" : modal === "new" ? "Create product" : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}