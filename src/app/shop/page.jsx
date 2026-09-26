"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  fetchProducts,
  fetchProductByTitle,
  fetchProductsByCategory,
  fetchProductsByColor,
  fetchProductsInRange,
  extractCategories,
  extractColors,
  extractSizes,
} from "@/lib/api/products";
import { ApiError } from "@/lib/api/client";
import ProductCard from "@/components/ProductCard";
import ProductGridSkeleton from "@/components/ProductGridSkeleton";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/Reveal";
import { useLocale } from "@/context/LocaleContext";

const SORTS = ["default", "priceAsc", "priceDesc", "title"];

function readParams(params) {
  return {
    category: params.get("category") || "",
    q: params.get("q") || "",
    color: params.get("color") || "",
    min: params.get("min") ? Number(params.get("min")) : null,
    max: params.get("max") ? Number(params.get("max")) : null,
    sizes: params.get("sizes") ? params.get("sizes").split(",").filter(Boolean) : [],
    sort: params.get("sort") || "default",
  };
}

function ShopPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();

  const initial = useMemo(
    () => readParams(new URLSearchParams(searchParams.toString())),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [products, setProducts] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const requestSeq = useRef(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState(initial.q);
  const [category, setCategory] = useState(initial.category);
  const [colors, setColors] = useState(initial.color ? [initial.color] : []);
  const [price, setPrice] = useState(() => [initial.min ?? 0, initial.max ?? 10000]);
  const [sizes, setSizes] = useState(initial.sizes);
  const [sort, setSort] = useState(SORTS.includes(initial.sort) ? initial.sort : "default");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // ---- URL sync
  const syncUrl = useCallback(
    (next) => {
      const sp = new URLSearchParams(searchParams.toString());
      const patch = {
        category: next.category ?? category,
        q: next.q ?? q,
        color: next.color ?? (colors.length === 1 ? colors[0] : ""),
        min: next.min ?? price[0],
        max: next.max ?? price[1],
        sizes: next.sizes ?? sizes,
        sort: next.sort ?? sort,
      };
      Object.entries(patch).forEach(([k, v]) => {
        if (v === "" || v === null || v === undefined) sp.delete(k);
        else sp.set(k, Array.isArray(v) ? v.join(",") : String(v));
      });
      const str = sp.toString();
      router.replace(str ? `/shop?${str}` : "/shop", { scroll: false });
    },
    [router, searchParams, category, q, colors, price, sizes, sort]
  );

  // ---- Data fetch using real backend filter endpoints
  const fetchData = useCallback(
    async (opts = {}) => {
      const current = {
        q: opts.q !== undefined ? opts.q : q,
        category: opts.category !== undefined ? opts.category : category,
        colors: opts.colors !== undefined ? opts.colors : colors,
        price: opts.price !== undefined ? opts.price : price,
        sizes: opts.sizes !== undefined ? opts.sizes : sizes,
      };

      const requestId = ++requestSeq.current;
      setLoading(true);
      setError("");
      try {
        let base;
        const hasCategory = !!current.category;
        const hasColor = current.colors.length > 0;
        const hasRange =
          current.price[0] > 0 || current.price[1] < 10000;

        // The most specific active filter drives a real backend query.
        if (current.q) {
          base = await fetchProductByTitle(current.q);
        } else if (hasCategory) {
          base = await fetchProductsByCategory(current.category);
        } else if (hasColor && current.colors.length === 1) {
          base = await fetchProductsByColor(current.colors[0]);
        } else if (hasRange) {
          base = await fetchProductsInRange(current.price[0], current.price[1]);
        } else {
          base = await fetchProducts();
        }

        // Remaining dimensions are intersected client-side from the anchor result.
        let list = base.filter((p) => p.is_active !== false);

        if (current.q) {
          const needle = current.q.toLowerCase();
          list = list.filter((p) => p.title.toLowerCase().includes(needle));
        }
        if (hasCategory) {
          list = list.filter((p) => p.category_name === current.category);
        }
        if (current.colors.length > 0) {
          list = list.filter((p) =>
            current.colors.some((c) =>
              p.colors.some((pc) => pc.toLowerCase() === c.toLowerCase())
            )
          );
        }
        if (sizes.length > 0) {
          list = list.filter((p) =>
            sizes.some((s) => p.sizes.includes(s))
          );
        }
        if (hasRange) {
          list = list.filter(
            (p) => p.price >= current.price[0] && p.price <= current.price[1]
          );
        }

        if (requestId !== requestSeq.current) return;
        setProducts(list);
        syncUrl(current);
      } catch (err) {
        if (requestId !== requestSeq.current) return;
        setError(err instanceof ApiError ? err.message : "Could not load products.");
        setProducts([]);
      } finally {
        if (requestId === requestSeq.current) setLoading(false);
      }
    },
    [q, category, colors, price, sizes, syncUrl]
  );

  useEffect(() => {
    const t = setTimeout(() => {
      fetchData();
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, colors, sizes, price[0], price[1]]);

  // Keep filter choices based on the full active catalog, not the currently filtered result.
  useEffect(() => {
    let cancelled = false;
    fetchProducts().then((all) => {
      if (!cancelled) setCatalog(all.filter((p) => p.is_active !== false));
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const allCategories = useMemo(() => extractCategories(catalog), [catalog]);
  const allColors = useMemo(() => extractColors(catalog), [catalog]);
  const allSizes = useMemo(() => extractSizes(catalog), [catalog]);

  const sorted = useMemo(() => {
    const list = [...products];
    if (sort === "priceAsc") list.sort((a, b) => a.finalPrice - b.finalPrice);
    else if (sort === "priceDesc") list.sort((a, b) => b.finalPrice - a.finalPrice);
    else if (sort === "title") list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [products, sort]);

  const toggleColor = (c) => {
    setColors((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };
  const toggleSize = (s) => {
    setSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const resetAll = () => {
    setQ("");
    setCategory("");
    setColors([]);
    setSizes([]);
    setSort("default");
    setPrice([0, 10000]);
  };

  const activeFilterCount =
    (category ? 1 : 0) +
    colors.length +
    sizes.length +
    (price[0] > 0 || price[1] < 10000 ? 1 : 0) +
    (q ? 1 : 0);

  const sortLabel = (s) =>
    s === "priceAsc" ? t("shop.sortLow") : s === "priceDesc" ? t("shop.sortHigh") : s === "title" ? t("shop.sortName") : t("shop.sort");

  const FilterPanel = ({ onAfterChange, idPrefix = "filter" }) => (
    <div className="filters">
      <div className="field">
        <label htmlFor={`${idPrefix}-search`}>{t("shop.search")}</label>
        <input
          id={`${idPrefix}-search`}
          type="search"
          placeholder={t("shop.find")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor={`${idPrefix}-cat`}>{t("shop.category")}</label>
        <select
          id={`${idPrefix}-cat`}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">{t("shop.allCategories")}</option>
          {allCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>{t("shop.priceRange")}</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="number"
            placeholder={t("shop.min")}
            min={0}
            value={price[0] === 0 ? "" : price[0]}
            onChange={(e) => setPrice((p) => [Number(e.target.value) || 0, p[1]])}
            style={{ flex: 1 }}
          />
          <input
            type="number"
            placeholder={t("shop.max")}
            min={0}
            value={price[1] >= 10000 ? "" : price[1]}
            onChange={(e) => setPrice((p) => [p[0], Number(e.target.value) || 10000])}
            style={{ flex: 1 }}
          />
        </div>
      </div>

      {allColors.length > 0 && (
        <div className="field">
          <label>{t("shop.color")}</label>
          <div className="chips" role="group" aria-label={t("shop.colorsAria")}>
            {allColors.map((c) => (
              <button
                key={c}
                type="button"
                className={`chip ${colors.includes(c) ? "chip--active" : ""}`}
                onClick={() => toggleColor(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="field">
        <label>{t("shop.size")}</label>
        <div className="chips" role="group" aria-label={t("shop.sizesAria")}>
          {allSizes.map((s) => (
            <button
              key={s}
              type="button"
              className={`chip ${sizes.includes(s) ? "chip--active" : ""}`}
              onClick={() => toggleSize(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <button type="button" className="btn btn--outline btn--dark-text btn--sm btn--block" onClick={() => { resetAll(); onAfterChange?.(); }}>
        {t("shop.resetFilters")}
      </button>
    </div>
  );

  return (
    <div className="shop-page">
      <div className="nav-spacer" />
      <div className="container page">
        <Reveal>
          <div className="shop-page__head">
            <div>
              <p className="section-label">{t("shop.head")}</p>
              <h1 className="section-title">
                {t("shop.title")}
              </h1>
            </div>
            <button
              className="btn btn--outline btn--dark-text btn--sm shop-filter-toggle"
              onClick={() => setFiltersOpen(true)}
            >
              {t("shop.filter")} {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>
        </Reveal>

        <hr className="divider" style={{ margin: "0 0 var(--space-9)" }} />

        <div className="shop-layout">
          <aside className="shop-filters" aria-label={t("shop.filtersAria")}>
            <FilterPanel idPrefix="desktop" />
          </aside>

          <div className="shop-main">
            <div className="meta-row" style={{ marginBottom: "var(--space-6)" }}>
              <span style={{ color: "var(--muted)", fontSize: "0.86rem" }}>
                {loading ? t("shop.updating") : sorted.length === 1 ? t("shop.countOne", { n: sorted.length }) : t("shop.countMany", { n: sorted.length })}
              </span>
              <select
                value={sort}
                onChange={(e) => { const nextSort = e.target.value; setSort(nextSort); syncUrl({ sort: nextSort }); }}
                aria-label={t("shop.sortAria")}
                style={{
                  border: "1px solid var(--line)",
                  background: "var(--surface)",
                  borderRadius: "var(--radius)",
                  padding: "10px 12px",
                  fontSize: "0.82rem",
                  fontFamily: "var(--display)",
                }}
              >
                {SORTS.map((s) => (
                  <option key={s} value={s}>{sortLabel(s)}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <ProductGridSkeleton count={6} />
            ) : error ? (
              <EmptyState
                icon="!"
                title={t("shop.loadTitle")}
                body={error}
                action={
                  <button className="btn btn--primary btn--sm" onClick={() => fetchData()}>
                    {t("home.retry")}
                  </button>
                }
              />
            ) : sorted.length === 0 ? (
              <EmptyState
                icon="⌕"
                title={t("shop.noMatch")}
                body={t("shop.noMatchBody")}
                action={
                  <button className="btn btn--primary btn--sm" onClick={resetAll}>
                    {t("shop.clearAll")}
                  </button>
                }
              />
            ) : (
              <div className="p-grid">
                {sorted.map((p, i) => (
                  <Reveal key={p.id} delay={(i % 4) * 60}>
                    <ProductCard product={p} index={i} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`overlay ${filtersOpen ? "open" : ""}`} onClick={() => setFiltersOpen(false)} aria-hidden="true" />
      <aside className={`drawer drawer--left ${filtersOpen ? "open" : ""}`} aria-hidden={!filtersOpen} inert={!filtersOpen ? "" : undefined} role="dialog" aria-modal="true" aria-label={t("shop.filter")}>
        <div className="drawer__head">
          <h3>{t("shop.filter")}</h3>
          <button type="button" className="icon-btn" onClick={() => setFiltersOpen(false)} aria-label={t("common.close")}>✕</button>
        </div>
        <div className="drawer__body drawer__body--filters">
          <FilterPanel idPrefix="mobile" onAfterChange={() => setFiltersOpen(false)} />
        </div>
      </aside>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="container page">
          <ProductGridSkeleton count={8} />
        </div>
      }
    >
      <ShopPageInner />
    </Suspense>
  );
}