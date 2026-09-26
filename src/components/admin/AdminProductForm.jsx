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
import { useLocale } from "@/context/LocaleContext";

const MAX_IMAGES = 5;

// Fashion size presets, expressed in canonical store order. The backend
// sizes pattern is /^[A-Za-z0-9, ]*$/, so every value here is safe.
const FASHION_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

// 14 standard color presets. Swatch hexes only for known names — we never
// invent hex values for arbitrary labels.
const COLOR_PRESETS = [
  { name: "Black", hex: "#141414" },
  { name: "White", hex: "#f5f5f5" },
  { name: "Gray", hex: "#8a8a86" },
  { name: "Navy", hex: "#1f2d3d" },
  { name: "Blue", hex: "#31518f" },
  { name: "Red", hex: "#b32424" },
  { name: "Green", hex: "#3f6b43" },
  { name: "Yellow", hex: "#e4c13c" },
  { name: "Orange", hex: "#e57a32" },
  { name: "Pink", hex: "#d9a9b8" },
  { name: "Purple", hex: "#6b4b8f" },
  { name: "Brown", hex: "#6f4e37" },
  { name: "Beige", hex: "#d6c8b0" },
  { name: "Cream", hex: "#eee9dd" },
];

// Safe mapping for common color names beyond the presets (catalog values).
const KNOWN_COLORS = {
  ...Object.fromEntries(COLOR_PRESETS.map((p) => [p.name.toLowerCase(), p.hex])),
  "off-white": "#eeeae1",
  ecru: "#e6dfd0",
  ivory: "#f3efe7",
  grey: "#8a8a86",
  "light gray": "#c9c9c4",
  "dark gray": "#4b4b4b",
  charcoal: "#3a3a38",
  indigo: "#414c86",
  denim: "#4c648a",
  "royal blue": "#284ea6",
  "light blue": "#9cc3e5",
  sky: "#a8c9e0",
  "forest green": "#2c4a33",
  olive: "#6b7536",
  "olive green": "#6b7536",
  mint: "#b8d6c0",
  burgundy: "#5e1f2f",
  maroon: "#651b2a",
  "hot pink": "#d8487a",
  blush: "#e9c6c4",
  "dusty pink": "#c79a9a",
  lavender: "#b7a6cf",
  "mustard yellow": "#d9a327",
  tan: "#c9a16b",
  khaki: "#b5a06b",
  camel: "#b9894f",
  cognac: "#9a4d2d",
  gold: "#c8a34e",
  silver: "#c6c8cc",
};

// Backend Joi patterns — mirrored exactly so the UI rejects what the API
// would reject.
const SIZES_PATTERN = /^[A-Za-z0-9, ]*$/;
const COLORS_PATTERN = /^[A-Za-z\u0600-\u06FF, ]*$/;

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

// Canonical ordering: fashion letters first (XXS→XXXL), then numbers and
// anything else via natural sort, with free-form sizes like "One Size" at
// the end. Used both for display and input serialization.
const LETTER_ORDER = Object.fromEntries(
  FASHION_SIZES.map((s, i) => [s.toLowerCase(), i])
);
const NATURAL = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

function sortSizes(list) {
  const items = (list || []).filter(Boolean).map(String);
  const rank = (v) => {
    const key = v.trim().toLowerCase().replace(/\s+/g, "");
    if (LETTER_ORDER[key] != null) return [0, LETTER_ORDER[key]];
    if (/^(one ?size|os)$/i.test(key)) return [3, 0];
    return [1, 0];
  };
  return [...items].sort((a, b) => {
    const [ra, ia] = rank(a);
    const [rb, ib] = rank(b);
    if (ra !== rb) return ra - rb;
    return ra === 0 ? ia - ib : NATURAL.compare(a, b);
  });
}

// Canonical ordering: presets first (in preset order), then the rest
// alphabetically.
const PRESET_ORDER = Object.fromEntries(
  COLOR_PRESETS.map((p, i) => [p.name.toLowerCase(), i])
);

function sortColors(list) {
  return [...(list || []).filter(Boolean).map(String)].sort((a, b) => {
    const ia = PRESET_ORDER[a.trim().toLowerCase()];
    const ib = PRESET_ORDER[b.trim().toLowerCase()];
    if (ia != null && ib != null) return ia - ib;
    if (ia != null) return -1;
    if (ib != null) return 1;
    return NATURAL.compare(a, b);
  });
}

export default function AdminProductForm({
  catalog = [],
  mode, // "add" | "edit"
  product = null,
  onClose,
  onSaved,
  onError,
}) {
  const { t } = useLocale();

  const presetSizeNames = useMemo(
    () => FASHION_SIZES.map((s) => s.toUpperCase()),
    []
  );
  const presetColorNames = useMemo(
    () => COLOR_PRESETS.map((c) => c.name.toLowerCase()),
    []
  );

  const suggestions = useMemo(
    () => ({
      categories: extractCategories(catalog).slice().sort((a, b) => a.localeCompare(b)),
      colors: extractColors(catalog)
        .slice()
        .filter((c) => !presetColorNames.includes(c.toLowerCase()))
        .sort((a, b) => a.localeCompare(b)),
      sizes: extractSizes(catalog)
        .slice()
        .filter((s) => !presetSizeNames.includes(s.toUpperCase()))
        .sort((a, b) => a.localeCompare(b)),
      titles: extractTitles(catalog),
    }),
    [catalog, presetColorNames, presetSizeNames]
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

  const [sizes, setSizes] = useState(() => sortSizes(product?.sizes || []));
  const [colors, setColors] = useState(() => sortColors(product?.colors || []));

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

  const imageLimit = mode === "edit" ? 1 : MAX_IMAGES;
  const totalImages = files.length;
  const slotsRemaining = imageLimit - totalImages;

  const addFiles = (list, source = "click") => {
    const incoming = Array.from(list || []);
    const allowed =
      totalImages + incoming.length > imageLimit ? slotsRemaining : incoming.length;
    if (allowed <= 0) {
      setFormError(t("v.maxImages", { n: imageLimit }));
      return;
    }
    const next = incoming.slice(0, allowed);
    setFiles((prev) => [...prev, ...next]);
    setFilePreviews((prev) => [
      ...prev,
      ...next.map((f) => URL.createObjectURL(f)),
    ]);
    if (source === "drop") setDragging(false);
    setFormError("");
  };

  const removeFile = (i) => {
    setFilePreviews((prev) => {
      const url = prev[i];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, idx) => idx !== i);
    });
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  };

  useEffect(() => () => {
    filePreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [filePreviews]);

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
      sortSizes(
        prev.some((x) => x.toLowerCase() === s.toLowerCase())
          ? prev.filter((x) => x.toLowerCase() !== s.toLowerCase())
          : [...prev, s]
      )
    );
    setFormError("");
  };

  const addCustomSize = () => {
    const v = normalizeSize(sizeDraft);
    if (!v) return;
    if (!SIZES_PATTERN.test(sizeDraft)) {
      setErrors((e) => ({ ...e, sizes: t("v.sizeBadChars") }));
      return;
    }
    setErrors((e) => ({ ...e, sizes: null }));
    if (sizes.some((x) => x.toLowerCase() === v.toLowerCase())) {
      setSizeDraft("");
      return;
    }
    setSizes((prev) => sortSizes([...prev, v]));
    setSizeDraft("");
    setFormError("");
  };

  const toggleColor = (c) => {
    setColors((prev) =>
      sortColors(
        prev.some((x) => x.toLowerCase() === c.toLowerCase())
          ? prev.filter((x) => x.toLowerCase() !== c.toLowerCase())
          : [...prev, c]
      )
    );
    setFormError("");
  };

  const addCustomColor = () => {
    const raw = colorDraft;
    const v = normalizeColor(raw);
    if (!v) return;
    if (!COLORS_PATTERN.test(raw)) {
      setErrors((e) => ({ ...e, colors: t("v.colorBadChars") }));
      return;
    }
    setErrors((e) => ({ ...e, colors: null }));
    if (colors.some((x) => x.toLowerCase() === v.toLowerCase())) {
      setColorDraft("");
      return;
    }
    setColors((prev) => sortColors([...prev, titleCase(v)]));
    setColorDraft("");
    setFormError("");
  };

  const toggleLive = async () => {
    if (mode !== "edit" || !product) return;
    setTogglingLive(true);
    try {
      await toggleProduct(product.id);
      setIsActive((v) => !v);
      if (onError) onError(`${product.title}: ${!isActive ? t("admin.live") : t("admin.hidden")}`);
    } catch (err) {
      if (onError) onError(err instanceof ApiError ? err.message : t("v.generic"));
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

    if (!title) next.title = t("v.titleRequired");
    else if (title.length < 3) next.title = t("v.titleMin");
    else if (title.length > 150) next.title = t("v.titleMax");

    if (!category) next.category_name = t("v.categoryRequired");
    else if (category.length < 2) next.category_name = t("v.categoryShort");
    else if (category.length > 100) next.category_name = t("v.categoryLong");

    if (!String(form.price).trim() || !Number.isFinite(price) || price <= 0)
      next.price = price > 0 ? t("v.priceRequired") : t("v.pricePositive");
    if (!Number.isFinite(discount) || discount < 0 || discount > 100)
      next.discount = t("v.discount");
    if (!Number.isInteger(stock) || stock < 0) next.stock = t("v.stock");

    if (mode === "add" && totalImages === 0) next.images = t("v.images");

    if (sizes.some((s) => !SIZES_PATTERN.test(s))) next.sizes = t("v.sizeBadChars");
    if (colors.some((c) => !COLORS_PATTERN.test(c))) next.colors = t("v.colorBadChars");

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
      sizes: sortSizes(sizes).join(","),
      colors: sortColors(colors).join(","),
    };

    setSaving(true);
    try {
      if (mode === "add") {
        await addProduct({ ...base, images: files });
        onSaved && onSaved({ mode, message: t("admin.createProduct") });
      } else {
        await updateProduct({
          ...base,
          id: product.id,
          images: files,
        });
        onSaved && onSaved({ mode, message: t("admin.editProduct") });
      }
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : t("v.generic"));
      setSaving(false);
    }
  };

  const categoryQuickPicks = suggestions.categories.filter(
    (c) => c.toLowerCase() !== form.category_name.trim().toLowerCase()
  );

  const readyLabel =
    totalImages === 1
      ? t("pf.imagesReadyOne")
      : t("pf.imagesReadyMany", { n: totalImages });
  const slotsLabel =
    slotsRemaining === 1
      ? t("pf.slotsRemainingOne", { n: slotsRemaining })
      : t("pf.slotsRemainingMany", { n: slotsRemaining });

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
          <h3 className="form-section__title">{t("pf.sections.info")}</h3>
          <p className="form-section__desc">{t("pf.sections.infoDesc")}</p>
        </div>

        <div className="field">
          <label htmlFor="pf-title">* {t("pf.title")}</label>
          <input
            id="pf-title"
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            list="pf-title-hints"
            autoComplete="off"
          />
          <datalist id="pf-title-hints">
            {suggestions.titles.map((tp) => (
              <option key={tp} value={tp} />
            ))}
          </datalist>
          <span className="field__hint">{t("pf.titleHint")}</span>
          {errors.title && <span className="field__error">{errors.title}</span>}
        </div>

        <div className="field">
          <label htmlFor="pf-category">* {t("pf.category")}</label>
          <input
            id="pf-category"
            value={form.category_name}
            onChange={(e) => setField("category_name", e.target.value)}
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
              {t("pf.categoryQuick")}
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
          <label htmlFor="pf-description">{t("pf.description")}</label>
          <textarea
            id="pf-description"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            rows={5}
          />
          <span className="field__hint">{t("pf.descHint")}</span>
        </div>
      </div>

      {/* ---------- Pricing ---------- */}
      <div className="form-section">
        <div className="form-section__head">
          <h3 className="form-section__title">{t("pf.sections.pricing")}</h3>
          <p className="form-section__desc">{t("pf.sections.pricingDesc")}</p>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="pf-price">* {t("pf.price")}</label>
            <input
              id="pf-price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setField("price", e.target.value)}
            />
            {errors.price && <span className="field__error">{errors.price}</span>}
          </div>
          <div className="field">
            <label htmlFor="pf-discount">{t("pf.discount")}</label>
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
          <h3 className="form-section__title">{t("pf.sections.inventory")}</h3>
          <p className="form-section__desc">{t("pf.sections.inventoryDesc")}</p>
        </div>

        <div className="field">
          <label htmlFor="pf-stock">* {t("pf.stock")}</label>
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
              {t("pf.sizes")}
            </span>
            <div className="attr-wrap">
              <span className="attr-label" style={{ fontSize: "0.62rem", opacity: 0.8 }}>
                {t("pf.sizesStandard")}
              </span>
              <div className="attr-suggestions">
                {FASHION_SIZES.map((s) => {
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

              {suggestions.sizes.length > 0 && (
                <>
                  <span className="attr-label" style={{ fontSize: "0.62rem", opacity: 0.8, marginTop: 2 }}>
                    {t("pf.sizesCatalog")}
                  </span>
                  <div className="attr-suggestions">
                    {suggestions.sizes.map((s) => {
                      const selected = sizes.some((x) => x.toLowerCase() === s.toLowerCase());
                      return (
                        <button
                          key={`c-${s}`}
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
              )}

              {errors.sizes && <span className="field__error">{errors.sizes}</span>}

              <div className="selected-sizes" aria-label={t("pf.sizes")}>
                {sizes.map((s) => (
                  <span key={s} className="selected-value">
                    {s}
                    <button type="button" onClick={() => toggleSize(s)} aria-label={t("pf.removeSize", { s })}>
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="attr-add">
                <input
                  value={sizeDraft}
                  onChange={(e) => {
                    setSizeDraft(e.target.value);
                    setErrors((er) => ({ ...er, sizes: null }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomSize();
                    }
                  }}
                  placeholder={t("pf.sizePlaceholderFull")}
                  aria-label={t("pf.customSize")}
                />
                <button type="button" className="btn btn--primary btn--sm" onClick={addCustomSize} disabled={!sizeDraft.trim()}>
                  {t("pf.add")}
                </button>
              </div>
            </div>
          </div>

          <div className="field">
            <span className="attr-label" style={{ marginBottom: 4 }}>
              {t("pf.colors")}
            </span>
            <div className="attr-wrap">
              <span className="attr-label" style={{ fontSize: "0.62rem", opacity: 0.8 }}>
                {t("pf.colorsStandard")}
              </span>
              <div className="attr-suggestions">
                {COLOR_PRESETS.map(({ name, hex }) => {
                  const selected = colors.some((x) => x.toLowerCase() === name.toLowerCase());
                  return (
                    <button
                      key={name}
                      type="button"
                      className={`attr-suggestion ${selected ? "selected" : ""}`}
                      aria-pressed={selected}
                      onClick={() => toggleColor(name)}
                    >
                      <span className="preset-swatch" style={{ backgroundColor: hex }} aria-hidden="true" />
                      {name}
                    </button>
                  );
                })}
              </div>

              {suggestions.colors.length > 0 && (
                <>
                  <span className="attr-label" style={{ fontSize: "0.62rem", opacity: 0.8, marginTop: 2 }}>
                    {t("pf.colorsCatalog")}
                  </span>
                  <div className="attr-suggestions">
                    {suggestions.colors.map((c) => {
                      const selected = colors.some((x) => x.toLowerCase() === c.toLowerCase());
                      const hex = hexForColor(c);
                      return (
                        <button
                          key={`c-${c}`}
                          type="button"
                          className={`attr-suggestion ${selected ? "selected" : ""} ${!hex ? "no-color" : ""}`}
                          aria-pressed={selected}
                          onClick={() => toggleColor(c)}
                        >
                          {hex && <span className="preset-swatch" style={{ backgroundColor: hex }} aria-hidden="true" />}
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {errors.colors && <span className="field__error">{errors.colors}</span>}

              <div className="selected-colors" aria-label={t("pf.colors")}>
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
                      <button type="button" onClick={() => toggleColor(c)} aria-label={t("pf.removeColor", { c })}>
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>

              <div className="attr-add">
                <input
                  value={colorDraft}
                  onChange={(e) => {
                    setColorDraft(e.target.value);
                    setErrors((er) => ({ ...er, colors: null }));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomColor();
                    }
                  }}
                  placeholder={t("pf.colorPlaceholderFull")}
                  aria-label={t("pf.customColor")}
                />
                <button type="button" className="btn btn--primary btn--sm" onClick={addCustomColor} disabled={!colorDraft.trim()}>
                  {t("pf.add")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Media ---------- */}
      <div className="form-section">
        <div className="form-section__head">
          <h3 className="form-section__title">{t("pf.sections.media")}</h3>
          <p className="form-section__desc">
            {mode === "add"
              ? t("pf.sections.mediaAdd", { n: MAX_IMAGES })
              : t("pf.sections.mediaEdit")}
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
              {dragging
                ? t("pf.dropHere")
                : totalImages > 0
                  ? readyLabel
                  : t(mode === "add" ? "pf.uploadAdd" : "pf.uploadEdit")}
            </div>
            <div className="file-drop__sub">PNG or JPG · {slotsLabel}</div>
          </div>

          <span className="media-count">
            {t("pf.mediaCoverage")} <b>{totalImages}</b> / {MAX_IMAGES}
          </span>
          {errors.images && <span className="field__error">{errors.images}</span>}

          {mode === "edit" && existingImages.length > 0 && (
            <div style={{ marginTop: "var(--space-4)" }}>
              <span className="attr-label" style={{ fontSize: "0.62rem", opacity: 0.8 }}>
                {t("pf.currentLabel")}
              </span>
              <div className="media-preview">
                {existingImages.map((src, i) => (
                  <div key={`src-${i}`} className="media-tile media-tile--current">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={t("pf.imageAltCurrent", { i: i + 1 })} />
                    <span className="media-tile__n" title={t("pf.currentLabel")}>✓</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filePreviews.length > 0 && (
            <div style={{ marginTop: "var(--space-4)" }}>
              <span className="attr-label" style={{ fontSize: "0.62rem", opacity: 0.8 }}>
                {mode === "edit" ? t("pf.newLabelEdit") : t("pf.newLabelAdd")}
              </span>
              <div className="media-preview">
                {filePreviews.map((src, i) => (
                  <div key={`new-${i}`} className="media-tile">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={t("pf.imageAltNew", { i: i + 1 })} />
                    <span className="media-tile__n">{i + 1}</span>
                    <div className="media-tile__actions">
                      <button type="button" onClick={() => moveFile(i, -1)} disabled={i === 0} aria-label={t("pf.moveEarlier")}>
                        ←
                      </button>
                      <button type="button" onClick={() => removeFile(i)} aria-label={t("pf.removeImage")}>
                        ✕
                      </button>
                      <button type="button" onClick={() => moveFile(i, 1)} disabled={i === files.length - 1} aria-label={t("pf.moveLater")}>
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
          <h3 className="form-section__title">{t("pf.sections.visibility")}</h3>
          <p className="form-section__desc">
            {mode === "add"
              ? t("pf.sections.visibilityAdd")
              : t("pf.sections.visibilityEdit")}
          </p>
        </div>

        <div className="attr-wrap" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: "var(--space-5) var(--space-6)" }}>
          <div>
            <div style={{ fontWeight: 500 }}>
              {mode === "add" ? t("pf.liveOnPublish") : isActive ? t("pf.currentlyLive") : t("pf.currentlyHidden")}
            </div>
            <span className="field__hint" style={{ display: "block", marginTop: 2 }}>
              {mode === "add" ? t("pf.hideAnytime") : t("pf.toggleHint")}
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={mode === "add" ? true : isActive}
            aria-label={t("pf.visibilityLabel")}
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
          {saving
            ? mode === "add"
              ? t("pf.creating")
              : t("pf.saving")
            : mode === "add"
              ? t("pf.createProduct")
              : t("pf.saveChanges")}
        </button>
        <button type="button" className="btn btn--outline btn--dark-text" onClick={onClose} disabled={saving}>
          {t("pf.cancel")}
        </button>
      </div>
    </form>
  );
}