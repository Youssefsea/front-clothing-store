"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { fetchProductByTitle, fetchProducts } from "@/lib/api/products";
import { splitImages, formatPrice } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useUi } from "@/context/UiContext";
import { useLocale } from "@/context/LocaleContext";
import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/Reveal";

function decodeTitle(param) {
  try {
    return decodeURIComponent(param || "");
  } catch {
    return param || "";
  }
}

function PdpSkeleton() {
  return (
    <div className="pdp" aria-busy="true" aria-label="Loading product">
      <div className="pdp__gallery">
        <div className="pdp__main skeleton" />
      </div>
      <div className="pdp__info">
        <div className="skeleton" style={{ height: 14, width: "30%", marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 36, width: "78%", marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 28, width: "40%", marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 80, width: "100%", marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 48, width: "100%" }} />
      </div>
    </div>
  );
}

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { notify } = useUi();
  const { t } = useLocale();

  const title = decodeTitle(params?.title);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [images, setImages] = useState([]);
  const [active, setActive] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!title) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    let mounted = true;
    setLoading(true);
    setNotFound(false);
    setError("");
    setProduct(null);

    (async () => {
      try {
        const found = await fetchProductByTitle(title);
        if (!mounted) return;
        if (!found.length) {
          setNotFound(true);
          return;
        }
        const p = found[0];
        setProduct(p);
        const imgs = splitImages(p.image_url);
        setImages(imgs);
        setActive(0);
        setSize(p.sizes?.[0] || "");
        setColor(p.colors?.[0] || "");
        setQty(1);

        // Related: same category, excluding current — best-effort.
        try {
          const all = await fetchProducts();
          if (!mounted) return;
          const others = all
            .filter((x) => x.is_active && x.id !== p.id)
            .filter((x) =>
              p.category_name
                ? x.category_name === p.category_name
                : true
            )
            .slice(0, 4);
          setRelated(
            others.length
              ? others
              : all.filter((x) => x.is_active && x.id !== p.id).slice(0, 4)
          );
        } catch {
          // related is optional
        }
      } catch {
        if (mounted) setError(t("pdp.loadFail"));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [title, t]);

  const out = product ? product.stock <= 0 : false;
  const discounted = product ? product.discount > 0 : false;
  const maxQty = product ? Math.max(1, product.stock) : 1;

  const stickyLabel = useMemo(() => {
    if (!product) return "";
    if (out) return t("pdp.out");
    if (!isAuthenticated) return t("pdp.signInAdd");
    if (adding) return t("pdp.adding");
    return `${t("pdp.add")} · ${formatPrice(product.finalPrice)}`;
  }, [product, out, isAuthenticated, adding, t]);

  const handleAdd = async () => {
    if (!product || out) return;
    if (!isAuthenticated) {
      router.push(`/login?next=/product/${encodeURIComponent(title)}`);
      return;
    }
    setAdding(true);
    try {
      await addToCart(product.id, qty, size, color);
      notify(t("pdp.added"));
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) {
        router.push(`/login?next=/product/${encodeURIComponent(title)}`);
      } else {
        notify(err?.message || t("pdp.addFail"));
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="container page pdp-page">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">{t("nav.home")}</Link>
        <span className="sep" aria-hidden="true">/</span>
        <Link href="/shop">{t("nav.shop")}</Link>
        <span className="sep" aria-hidden="true">/</span>
        <span className="current">
          {notFound ? t("pdp.notFound") : loading ? t("pdp.loading") : product?.title || title}
        </span>
      </nav>

      {loading ? (
        <PdpSkeleton />
      ) : error ? (
        <EmptyState
          icon="!"
          title={t("pdp.missing")}
          body={error}
          action={
            <button type="button" className="btn btn--primary btn--sm" onClick={() => window.location.reload()}>
              {t("common.retry")}
            </button>
          }
        />
      ) : notFound || !product ? (
        <EmptyState
          icon="?"
          title={t("pdp.missing")}
          body={t("pdp.missingBody")}
          action={
            <Link href="/shop" className="btn btn--primary btn--sm">{t("pdp.backShop")}</Link>
          }
        />
      ) : (
        <>
          <div className="pdp">
            <div className={`pdp__gallery ${images.length > 1 ? "" : "pdp__gallery--solo"}`}>
              {images.length > 1 && (
                <div className="pdp__thumbs" role="tablist" aria-label="Product images">
                  {images.map((src, i) => (
                    <button
                      key={src + i}
                      type="button"
                      role="tab"
                      aria-selected={i === active}
                      className={`pdp__thumb ${i === active ? "active" : ""}`}
                      onClick={() => setActive(i)}
                      aria-label={t("pdp.thumb", { n: i + 1 })}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" />
                    </button>
                  ))}
                </div>
              )}
              <div className="pdp__main">
                {images[active] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={images[active]} src={images[active]} alt={product.title} />
                ) : (
                  <div className="pdp__main-fallback">
                    {product.title.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {discounted && !out && (
                  <span className="pdp__badge">-{Math.round(product.discount)}%</span>
                )}
              </div>
            </div>

            <div className="pdp__info">
              <Reveal eager>
                <p className="p-card__cat" style={{ marginBottom: 10 }}>{product.category_name}</p>
                <h1 className="pdp__title">{product.title}</h1>

                <div className="pdp__price">
                  <span className="now">{formatPrice(product.finalPrice)}</span>
                  {discounted && <span className="was">{formatPrice(product.price)}</span>}
                  {discounted && <span className="off">-{Math.round(product.discount)}%</span>}
                </div>

                {out ? (
                  <p className="p-card__stock p-card__stock--out">{t("pdp.out")}</p>
                ) : product.stock <= 5 ? (
                  <p className="p-card__stock p-card__stock--low">{t("pdp.low", { n: product.stock })}</p>
                ) : null}

                {product.description ? (
                  <p className="pdp__desc">{product.description}</p>
                ) : null}

                {product.colors.length > 0 && (
                  <div>
                    <div className="pdp__swatch-label">
                      {t("pdp.color")} — <span style={{ color: "var(--ink)" }}>{color}</span>
                    </div>
                    <div className="pdp__swatches" role="listbox" aria-label={t("pdp.color")}>
                      {product.colors.map((c) => (
                        <button
                          key={c}
                          type="button"
                          role="option"
                          aria-selected={color === c}
                          className={`swatch ${color === c ? "swatch--active" : ""}`}
                          onClick={() => setColor(c)}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.sizes.length > 0 && (
                  <div>
                    <div className="pdp__swatch-label">
                      {t("pdp.size")} — <span style={{ color: "var(--ink)" }}>{size || t("pdp.pick")}</span>
                    </div>
                    <div className="pdp__swatches" role="listbox" aria-label={t("pdp.size")}>
                      {product.sizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          role="option"
                          aria-selected={size === s}
                          className={`swatch ${size === s ? "swatch--active" : ""}`}
                          onClick={() => setSize(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pdp__swatch-label">{t("pdp.qty")}</div>
                <div className="pdp__qty">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label={t("pdp.qtyDown")}
                    disabled={qty <= 1}
                  >
                    −
                  </button>
                  <span aria-live="polite">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                    aria-label={t("pdp.qtyUp")}
                    disabled={qty >= maxQty || out}
                  >
                    +
                  </button>
                </div>

                <div className="pdp__cta">
                  <button
                    type="button"
                    className="btn btn--primary btn--block"
                    disabled={adding || out}
                    onClick={handleAdd}
                  >
                    {stickyLabel}
                  </button>
                  <Link href="/cart" className="btn btn--outline btn--dark-text btn--block">
                    {t("pdp.viewBag")}
                  </Link>
                </div>

                <div className="pdp__meta">
                  <div>
                    <b>{t("pdp.sku")}</b> — <span>#{product.id}</span>
                  </div>
                  {product.sizes.length > 0 && (
                    <div>
                      <b>{t("pdp.sizes")}</b> —{" "}
                      <span className="pdp__sizes">
                        {product.sizes.map((s) => (
                          <span key={s} style={{ marginInlineEnd: 8 }}>{s}</span>
                        ))}
                      </span>
                    </div>
                  )}
                  {product.colors.length > 0 && (
                    <div>
                      <b>{t("pdp.colors")}</b> — <span>{product.colors.join(", ")}</span>
                    </div>
                  )}
                  <div>
                    <b>{t("pdp.stock")}</b> —{" "}
                    <span style={{ color: out ? "var(--err)" : "var(--ok)" }}>
                      {out ? t("pdp.soldOut") : t("pdp.inStock", { n: product.stock })}
                    </span>
                  </div>
                  <div>
                    <b>{t("pdp.shipping")}</b> — <span>{t("pdp.shippingBody")}</span>
                  </div>
                  <p className="pdp__note">{t("pdp.note")}</p>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Mobile sticky purchase bar */}
          <div className="pdp-sticky" aria-hidden={false}>
            <div className="pdp-sticky__price">
              <span className="now">{formatPrice(product.finalPrice)}</span>
              {discounted && <span className="was">{formatPrice(product.price)}</span>}
            </div>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              disabled={adding || out}
              onClick={handleAdd}
            >
              {out ? t("pdp.out") : isAuthenticated ? t("pdp.add") : t("pdp.signInAdd")}
            </button>
          </div>

          {related.length > 0 && (
            <section className="pdp-related">
              <div className="section-head section-head--stacked">
                <h2 className="section-title">{t("pdp.related")}</h2>
              </div>
              <div className="p-grid">
                {related.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
