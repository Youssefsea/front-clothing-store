"use client";

import React, {
  useEffect,
  useMemo,
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
} from "@/lib/api/products";
import { ApiError } from "@/lib/api/client";
import ProductCard from "@/components/ProductCard";
import ProductGridSkeleton from "@/components/ProductGridSkeleton";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/Reveal";

const SORTS = [
  { value: "default", label: "Sort" },
  { value: "priceAsc", label: "Price: Low to High" },
  { value: "priceDesc", label: "Price: High to Low" },
  { value: "title", label: "Name: A → Z" },
];

function readParams(params) {
  return {
    category: params.get("category") || "",
    q: params.get("q") || "",
    color: params.get("color") || "",
    min: params.get("min") ? Number(params.get("min")) : null,
    max: params.get("max") ? Number(params.get("max")) : null,
  };
}

function ShopPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initial = useMemo(
    () => readParams(new URLSearchParams(searchParams.toString())),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState(initial.q);
  const [category, setCategory] = useState(initial.category);
  const [colors, setColors] = useState(initial.color ? [initial.color] : []);
  const [price, setPrice] = useState(() => [initial.min ?? 0, initial.max ?? 10000]);
  const [sizes, setSizes] = useState([]);
  const [sort, setSort] = useState("default");
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
      };
      Object.entries(patch).forEach(([k, v]) => {
        if (v === "" || v === null || v === undefined) sp.delete(k);
        else sp.set(k, String(v));
      });
      const str = sp.toString();
      router.replace(str ? `/shop?${str}` : "/shop", { scroll: false });
    },
    [router, searchParams, category, q, colors, price]
  );

  // ---- Data fetch using real backend filter endpoints
  const fetchData = useCallback(
    async (opts = {}) => {
      const current = {
        q: opts.q !== undefined ? opts.q : q,
        category: opts.category !== undefined ? opts.category : category,
        colors: opts.colors !== undefined ? opts.colors : colors,
        price: opts.price !== undefined ? opts.price : price,
      };

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

        setProducts(list);
        syncUrl(current);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Could not load products.");
        setProducts([]);
      } finally {
        setLoading(false);
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

  // ---- All-options category/color lists come from real data
  const allCategories = useMemo(
    () => extractCategories(products),
    [products]
  );
  const allColors = useMemo(() => extractColors(products), [products]);

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

  const FilterPanel = ({ onAfterChange }) => (
    <div className="filters">
      <div className="field">
        <label htmlFor="shop-search">Search</label>
        <input
          id="shop-search"
          type="search"
          placeholder="Find a piece…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="shop-cat">Category</label>
        <select
          id="shop-cat"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {allCategories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Price range</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="number"
            placeholder="Min"
            min={0}
            value={price[0] === 0 ? "" : price[0]}
            onChange={(e) => setPrice((p) => [Number(e.target.value) || 0, p[1]])}
            style={{ flex: 1 }}
          />
          <input
            type="number"
            placeholder="Max"
            min={0}
            value={price[1] >= 10000 ? "" : price[1]}
            onChange={(e) => setPrice((p) => [p[0], Number(e.target.value) || 10000])}
            style={{ flex: 1 }}
          />
        </div>
      </div>

      {allColors.length > 0 && (
        <div className="field">
          <label>Color</label>
          <div className="chips" role="group" aria-label="Filter by color">
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
        <label>Size</label>
        <div className="chips" role="group" aria-label="Filter by size">
          {["XS", "S", "M", "L", "XL", "XXL", "XXXL"].map((s) => (
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
        Reset filters
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
              <p className="section-label">Catalog</p>
              <h1 className="section-title">
                Shop
              </h1>
            </div>
            <button
              className="btn btn--outline btn--dark-text btn--sm shop-filter-toggle"
              onClick={() => setFiltersOpen(true)}
            >
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>
        </Reveal>

        <hr className="divider" style={{ margin: "0 0 var(--space-9)" }} />

        <div className="shop-layout">
          <aside className="shop-filters" aria-label="Product filters">
            <FilterPanel />
          </aside>

          <div className="shop-main">
            <div className="meta-row" style={{ marginBottom: "var(--space-6)" }}>
              <span style={{ color: "var(--muted)", fontSize: "0.86rem" }}>
                {loading ? "Updating…" : `${sorted.length} product${sorted.length === 1 ? "" : "s"}`}
              </span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Sort products"
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
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <ProductGridSkeleton count={6} />
            ) : error ? (
              <EmptyState
                icon="!"
                title="Could not load products"
                body={error}
                action={
                  <button className="btn btn--primary btn--sm" onClick={() => fetchData()}>
                    Try again
                  </button>
                }
              />
            ) : sorted.length === 0 ? (
              <EmptyState
                icon="⌕"
                title="No pieces match"
                body="Try clearing a filter or two, or search for something else."
                action={
                  <button className="btn btn--primary btn--sm" onClick={resetAll}>
                    Clear all filters
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
      <aside className={`drawer drawer--left ${filtersOpen ? "open" : ""}`} aria-hidden={!filtersOpen}>
        <div className="drawer__head">
          <h3>Filters</h3>
          <button className="icon-btn" onClick={() => setFiltersOpen(false)} aria-label="Close filters">✕</button>
        </div>
        <div className="drawer__body drawer__body--filters">
          <FilterPanel onAfterChange={() => setFiltersOpen(false)} />
        </div>
      </aside>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense>
      <ShopPageInner />
    </Suspense>
  );
}