"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  addProduct,
  updateProduct,
  toggleProduct,
  extractCategories,
  extractColors,
  extractSizes,
  extractTitles,
} from "@/lib/api/products";
import { ApiError } from "@/lib/api/client";

const MAX_IMAGES = 5;

// Safe mapping for common color names. Unknown names get a neutral swatch —
// we never invent hex values for arbitrary labels.
const KNOWN_COLORS = {
  black: "#141414",
  white: "#f5f5f5",
  "off-white": "#eeeae1",
  ecru: "#e6dfd0",
  cream: "#eee9dd",
  ivory: "#f3efe7",
  gray: "#8a8a86",
  grey: "#8a8a86",
  "light gray": "#c9c9c4",
  "dark gray": "#4b4b4b",
  charcoal: "#3a3a38",
  navy: "#1f2d3d",
  "navy blue": "#1f2d3d",
  indigo: "#414c86",
  denim: "#4c648a",
  blue: "#31518f",
  "royal blue": "#284ea6",
  "light blue": "#9cc3e5",
  sky: "#a8c9e0",
  green: "#3f6b43",
  "forest green": "#2c4a33",
  olive: "#6b7536",
  "olive green": "#6b7536",
  mint: "#b8d6c0",
  red: "#b32424",
  burgundy: "#5e1f2f",
  maroon: "#651b2a",
  pink: "#d9a9b8",
  "hot pink": "#d8487a",
  blush: "#e9c6c4",
  "dusty pink": "#c79a9a",
  purple: "#6b4b8f",
  lavender: "#b7a6cf",
  yellow: "#e4c13c",
  "mustard yellow": "#d9a327",
  orange: "#e57a32",
  brown: "#6f4e37",
  beige: "#d6c8b0",
  tan: "#c9a16b",
  khaki: "#b5a06b",
  camel: "#b9894f",
  cognac: "#9a4d2d",
  gold: "#c8a34e",
  silver: "#c6c8cc",
};

function hexForColor(name) {
  const key = String(name || "").trim().toLowerCase();
  return KNOWN_COLORS[key] || null;
}

function normalizeColor(v) {
  return String(v || "").trim();
}

function normalizeSize(v) {
  return String(v || "").trim().toUpperCase();
}

function titleCase(name) {
  return String(name || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

export default function AdminProductForm({
  catalog = [],
  mode, // "add" | "edit"
  product = null,
  onClose,
  onSaved,
  onError,
}) {
  const suggestions = useMemo(
    () => ({
      categories: extractCategories(catalog).slice().sort((a, b) => a.localeCompare(b)),
      colors: extractColors(catalog).slice().sort((a, b) => a.localeCompare(b)),
      sizes: extractSizes(catalog).slice().sort((a, b) => a.localeCompare(b)),
      titles: extractTitles(catalog),
    }),
    [catalog]
  );

  const existingImages = useMemo(() => {
    if (mode !== "edit" || !product) return [];
    return (product.image_url || "")
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean);
  }, [mode, product]);

  const [form, setForm] = useState({
    title: product?.title || "",
    description: product?.description || "",
    category_name: product?.category_name || "",
    price: product ? String(product.price) : "",
    discount: product ? String(product.discount || 0) : "0",
    stock: product ? String(product.stock || 0) : "0",
  });

  const [sizes, setSizes] = useState(() => (product?.sizes || []).slice());
  const [colors, setColors] = useState(() => (product?.colors || []).slice());

  const [sizeDraft, setSizeDraft] = useState("");
  const [colorDraft, setColorDraft] = useState("");

  const [isActive, setIsActive] = useState(() => product?.is_active !== false);

  // New uploaded files only. For edit mode these REPLACE the whole image set
  // — that is what the existing /products/update contract accepts.
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);

  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [togglingLive, setTogglingLive] = useState(false);

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: null }));
    setFormError("");
  };

  const totalImages = files.length;

  const addFiles = (list, source = "click") => {
    const allowed =
      (files.length + (Array.from(list || []).length) > MAX_IMAGES
        ? MAX_IMAGES - files.length
        : Array.from(list || []).length);
    if (allowed <= 0) {
      setFormError(`You can upload up to ${MAX_IMAGES} images.`);
      return;
    }
    const next = Array.from(list || []).slice(0, allowed);
    setFiles((prev) => [...prev, ...next]);
    setFilePreviews((prev) => [
      ...prev,
      ...next.map((f) => URL.createObjectURL(f)),
    ]);
    if (source === "drop") setDragging(false);
    setFormError("");
  };

  const removeFile = (i) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setFilePreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const moveFile = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= files.length) return;
    setFiles((prev) => {
      const next = prev.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    setFilePreviews((prev) => {
      const next = prev.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const toggleSize = (s) => {
    setSizes((prev) =>
      prev.some((x) => x.toLowerCase() === s.toLowerCase())
        ? prev.filter((x) => x.toLowerCase() !== s.toLowerCase())
        : [...prev, s]
    );
    setFormError("");
  };

  const addCustomSize = () => {
    const v = normalizeSize(sizeDraft);
    if (!v) return;
    if (sizes.some((x) => x.toLowerCase() === v.toLowerCase())) {
      setSizeDraft("");
      return;
    }
    setSizes((prev) => [...prev, v]);
    setSizeDraft("");
    setFormError("");
  };

  const toggleColor = (c) => {
    setColors((prev) =>
      prev.some((x) => x.toLowerCase() === c.toLowerCase())
        ? prev.filter((x) => x.toLowerCase() !== c.toLowerCase())
        : [...prev, c]
    );
    setFormError("");
  };

  const addCustomColor = () => {
    const v = normalizeColor(colorDraft);
    if (!v) return;
    if (colors.some((x) => x.toLowerCase() === v.toLowerCase())) {
      setColorDraft("");
      return;
    }
    setColors((prev) => [...prev, titleCase(v)]);
    setColorDraft("");
    setFormError("");
  };

  const toggleLive = async () => {
    if (mode !== "edit" || !product) return;
    setTogglingLive(true);
    try {
      await toggleProduct(product.id);
      setIsActive((v) => !v);
      if (onError) onError(`${product.title} is now ${!isActive ? "live" : "hidden"}`);
    } catch (err) {
      if (onError) onError(err instanceof ApiError ? err.message : "Could not update visibility");
    } finally {
      setTogglingLive(false);
    }
  };

  const validate = () => {
    const next = {};
    const title = form.title.trim();
    const category = form.category_name.trim();
    const price = Number(form.price);
    const discount = Number(form.discount) || 0;
    const stock = Number(form.stock) || 0;

    if (!title) next.title = "Title is required.";
    else if (title.length < 2) next.title = "Title is too short.";

    if (!category) next.category_name = "Category is required.";
    if (!Number.isFinite(price) || price < 0) next.price = "Enter a valid price.";
    if (!Number.isFinite(discount) || discount < 0 || discount > 100)
      next.discount = "Discount must be between 0 and 100.";
    if (!Number.isInteger(stock) || stock < 0)
      next.stock = "Stock must be a whole number of 0 or more.";

    if (mode === "add" && totalImages === 0)
      next.images = "Add at least one product image.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setFormError("");

    const base = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      discount: Number(form.discount) || 0,
      stock: Number(form.stock) || 0,
      category_name: form.category_name.trim(),
      sizes: sizes.join(","),
      colors: colors.join(","),
    };

    setSaving(true);
    try {
      if (mode === "add") {
        await addProduct({ ...base, images: files });
        onSaved && onSaved({ mode, message: "Product created" });
      } else {
        await updateProduct({
          ...base,
          product_id: product.id,
          images: files,
        });
        onSaved && onSaved({ mode, message: "Product updated" });
      }
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not save product");
      setSaving(false);
    }
  };

  const categoryQuickPicks = suggestions.categories.filter(
    (c) => c.toLowerCase() !== form.category_name.trim().toLowerCase()
  );

  return (
    <form onSubmit={submit} noValidate>
      {formError && (
        <div role="alert" className="field__error" style={{ background: "rgba(192,57,43,0.07)", border: "1px solid rgba(192,57,43,0.25)", padding: "14px 16px", borderRadius: "var(--radius-md)", marginBottom: "var(--space-5)" }}>
          {formError}
        </div>
      )}

      {/* ---------- Product information ---------- */}
      <div className="form-section">
        <div className="form-section__head">
          <h3 className="form-section__title">Product information</h3>
          <p className="form-section__desc">Core details that define the piece in the catalog.</p>
        </div>

        <div className="field">
          <label htmlFor="pf-title">Title *</label>
          <input
            id="pf-title"
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="e.g. Heritage Oversized Overcoat"
            list="pf-title-hints"
            autoComplete="off"
          />
          <datalist id="pf-title-hints">
            {suggestions.titles.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
          <span className="field__hint">
            Suggestions autocomplete wording from existing titles — the field stays fully editable and never overwrites your input.
          </span>
          {errors.title && <span className="field__error">{errors.title}</span>}
        </div>

        <div className="field">
          <label htmlFor="pf-category">Category *</label>
          <input
            id="pf-category"
            value={form.category_name}
            onChange={(e) => setField("category_name", e.target.value)}
            placeholder="Type a new category or pick one below"
            list="pf-cat-suggestions"
            autoComplete="off"
          />
          <datalist id="pf-cat-suggestions">
            {suggestions.categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          {errors.category_name && <span className="field__error">{errors.category_name}</span>}
          {categoryQuickPicks.length > 0 && (
            <div className="field__hint" style={{ marginTop: 2 }}>
              Existing categories:
            </div>
          )}
          {categoryQuickPicks.length > 0 && (
            <div className="attr-suggestions" style={{ marginTop: "var(--space-2)" }}>
              {categoryQuickPicks.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="attr-suggestion"
                  onClick={() => {
                    setField("category_name", c);
                    setFormError("");
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="field">
          <label htmlFor="pf-description">Description</label>
          <textarea
            id="pf-description"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="Materials, fit, care notes…"
            rows={5}
          />
          <span className="field__hint">Shown on the product page underneath the price.</span>
        </div>
      </div>

      {/* ---------- Pricing ---------- */}
      <div className="form-section">
        <div className="form-section__head">
          <h3 className="form-section__title">Pricing</h3>
          <p className="form-section__desc">Discount is applied as a percentage off the price.</p>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="pf-price">Price (USD) *</label>
            <input
              id="pf-price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setField("price", e.target.value)}
              placeholder="120.00"
            />
            {errors.price && <span className="field__error">{errors.price}</span>}
          </div>
          <div className="field">
            <label htmlFor="pf-discount">Discount %</label>
            <input
              id="pf-discount"
              type="number"
              min="0"
              max="100"
              value={form.discount}
              onChange={(e) => setField("discount", e.target.value)}
            />
            {errors.discount && <span className="field__error">{errors.discount}</span>}
          </div>
        </div>
      </div>

      {/* ---------- Inventory ---------- */}
      <div className="form-section">
        <div className="form-section__head">
          <h3 className="form-section__title">Inventory</h3>
          <p className="form-section__desc">Stock level plus the sizes and colors this piece is available in.</p>
        </div>

        <div className="field">
          <label htmlFor="pf-stock">Stock *</label>
          <input
            id="pf-stock"
            type="number"
            min="0"
            step="1"
            value={form.stock}
            onChange={(e) => setField("stock", e.target.value)}
          />
          {errors.stock && <span className="field__error">{errors.stock}</span>}
        </div>

        <div className="smart-cols">
          <div className="field">
            <span className="field__label attr-label" style={{ marginBottom: 4 }}>
              Sizes
            </span>
            <div className="attr-wrap">
              {suggestions.sizes.length > 0 ? (
                <>
                  <span className="attr-label" style={{ fontSize: "0.62rem", opacity: 0.8 }}>
                    From the catalog
                  </span>
                  <div className="attr-suggestions">
                    {suggestions.sizes.map((s) => {
                      const selected = sizes.some((x) => x.toLowerCase() === s.toLowerCase());
                      return (
                        <button
                          key={s}
                          type="button"
                          className={`attr-suggestion ${selected ? "selected" : ""}`}
                          aria-pressed={selected}
                          onClick={() => toggleSize(s)}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <span className="field__hint">No sizes in the catalog yet — add them below and they will appear for future products.</span>
              )}

              <div className="selected-sizes" aria-label="Selected sizes">
                {sizes.map((s) => (
                  <span key={s} className="selected-value">
                    {s}
                    <button type="button" onClick={() => toggleSize(s)} aria-label={`Remove size ${s}`}>
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="attr-add">
                <input
                  value={sizeDraft}
                  onChange={(e) => setSizeDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomSize();
                    }
                  }}
                  placeholder="Add custom size, e.g. One Size"
                  aria-label="Add custom size"
                />
                <button type="button" className="btn btn--primary btn--sm" onClick={addCustomSize} disabled={!sizeDraft.trim()}>
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="field">
            <span className="attr-label" style={{ marginBottom: 4 }}>
              Colors
            </span>
            <div className="attr-wrap">
              {suggestions.colors.length > 0 ? (
                <>
                  <span className="attr-label" style={{ fontSize: "0.62rem", opacity: 0.8 }}>
                    From the catalog
                  </span>
                  <div className="attr-suggestions">
                    {suggestions.colors.map((c) => {
                      const selected = colors.some((x) => x.toLowerCase() === c.toLowerCase());
                      const hex = hexForColor(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          className={`attr-suggestion ${selected ? "selected" : ""} ${!hex ? "no-color" : ""}`}
                          aria-pressed={selected}
                          onClick={() => toggleColor(c)}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <span className="field__hint">No colors in the catalog yet — add them below and they will appear for future products.</span>
              )}

              <div className="selected-colors" aria-label="Selected colors">
                {colors.map((c) => {
                  const hex = hexForColor(c);
                  return (
                    <span key={c} className={`selected-value ${!hex ? "swatch-no-color" : ""}`}>
                      <span
                        className={`sw ${!hex ? "no-color" : ""}`}
                        style={hex ? { backgroundColor: hex } : undefined}
                        aria-hidden="true"
                      />
                      {c}
                      <button type="button" onClick={() => toggleColor(c)} aria-label={`Remove color ${c}`}>
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>

              <div className="attr-add">
                <input
                  value={colorDraft}
                  onChange={(e) => setColorDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomColor();
                    }
                  }}
                  placeholder="Add custom color, e.g. Rust"
                  aria-label="Add custom color"
                />
                <button type="button" className="btn btn--primary btn--sm" onClick={addCustomColor} disabled={!colorDraft.trim()}>
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Media ---------- */}
      <div className="form-section">
        <div className="form-section__head">
          <h3 className="form-section__title">Media</h3>
          <p className="form-section__desc">
            {mode === "add"
              ? `Upload the product photos. Up to ${MAX_IMAGES} images, first one is the cover.`
              : "Existing images are shown for reference. Newly uploaded files replace the current set."}
          </p>
        </div>

        <div className="field">
          <div
            className={`file-drop ${dragging ? "file-drop--dragging" : ""} ${totalImages > 0 ? "has-file" : ""}`}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              addFiles(e.dataTransfer.files, "drop");
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current && fileInputRef.current.click();
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => addFiles(e.target.files)}
            />
            <div className="file-drop__title">
              {dragging ? "Drop images here" : totalImages > 0 ? `${totalImages} image${totalImages === 1 ? "" : "s"} ready` : mode === "add" ? "Drop images or click to upload" : "Drop new images or click to upload"}
            </div>
            <div className="file-drop__sub">PNG or JPG · {MAX_IMAGES - totalImages} slot{MAX_IMAGES - totalImages === 1 ? "" : "s"} remaining</div>
          </div>

          <span className="media-count">
            Coverage <b>{totalImages}</b> / {MAX_IMAGES}
          </span>
          {errors.images && <span className="field__error">{errors.images}</span>}

          {mode === "edit" && existingImages.length > 0 && (
            <div style={{ marginTop: "var(--space-4)" }}>
              <span className="attr-label" style={{ fontSize: "0.62rem", opacity: 0.8 }}>
                Current images (kept unless replaced)
              </span>
              <div className="media-preview">
                {existingImages.map((src, i) => (
                  <div key={`src-${i}`} className="media-tile media-tile--current">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`Current image ${i + 1}`} />
                    <span className="media-tile__n" title="Current">✓</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filePreviews.length > 0 && (
            <div style={{ marginTop: "var(--space-4)" }}>
              <span className="attr-label" style={{ fontSize: "0.62rem", opacity: 0.8 }}>
                {mode === "edit" ? "New images (this set replaces the current ones)" : "New images — drag previews to reorder"}
              </span>
              <div className="media-preview">
                {filePreviews.map((src, i) => (
                  <div key={`new-${i}`} className="media-tile">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`Upload preview ${i + 1}`} />
                    <span className="media-tile__n">{i + 1}</span>
                    <div className="media-tile__actions">
                      <button type="button" onClick={() => moveFile(i, -1)} disabled={i === 0} aria-label="Move earlier">
                        ←
                      </button>
                      <button type="button" onClick={() => removeFile(i)} aria-label="Remove image">
                        ✕
                      </button>
                      <button type="button" onClick={() => moveFile(i, 1)} disabled={i === files.length - 1} aria-label="Move later">
                        →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---------- Visibility ---------- */}
      <div className="form-section">
        <div className="form-section__head">
          <h3 className="form-section__title">Visibility</h3>
          <p className="form-section__desc">
            {mode === "add"
              ? "New products are published to the store immediately after creation."
              : "Control whether this product is shown in the store."}
          </p>
        </div>

        <div className="attr-wrap" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "var(--space-5) var(--space-6)" }}>
          <div>
            <div style={{ fontWeight: 500 }}>{mode === "add" ? "Live on publish" : `Currently ${isActive ? "live" : "hidden"}`}</div>
            <span className="field__hint" style={{ display: "block", marginTop: 2 }}>
              {mode === "add"
                ? "You can hide it from the products table anytime."
                : "Toggling uses the existing visibility endpoint — no extra fields sent."}
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={mode === "add" ? true : isActive}
            aria-label="Product visibility"
            className={`switch ${mode === "add" || isActive ? "switch--on" : ""} ${togglingLive ? "switch--busy" : ""}`}
            onClick={toggleLive}
            disabled={mode === "add" || togglingLive}
          >
            <span className="switch__knob" />
          </button>
        </div>
      </div>

      {/* ---------- Actions ---------- */}
      <div className="form-actions">
        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? "Saving…" : mode === "add" ? "Create product" : "Save changes"}
        </button>
        <button type="button" className="btn btn--outline btn--dark-text" onClick={onClose} disabled={saving}>
          Cancel
        </button>
      </div>
    </form>
  );
}