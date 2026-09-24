"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchProducts, extractCategories } from "@/lib/api/products";
import { splitImages } from "@/lib/format";
import ProductCard from "@/components/ProductCard";
import ProductGridSkeleton from "@/components/ProductGridSkeleton";
import Reveal from "@/components/Reveal";
import { ApiError } from "@/lib/api/client";
import { useLocale } from "@/context/LocaleContext";

// Editorial media — curated, embedding-friendly sources.
//   - Stills: Unsplash CDN (images.unsplash.com)
//   - Loop: Mixkit (assets.mixkit.co) — muted, poster fallback
// Real products always take precedence in the hero; editorial assets are
// used only as a graceful fallback when the catalog is empty.
const EDITORIAL = {
  // Photo: "fashion model in studio" — https://unsplash.com/photos/FbRxpkNc8sA
  hero: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80",
  // Photo: "woman in street style" — https://unsplash.com/photos/yFihlPZDgiE
  editorial: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=80",
  // Photo: "minimal fashion look" — https://unsplash.com/photos/BqoKdLrMoBw
  spotlight: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=80",
  // Video poster uses the editorial still; after that a muted Mixkit loop.
  // Loop source: https://mixkit.co/free-stock-video/dramatic-fashion-model-poses-in-dark-photography-studio/
  videoPoster: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=80",
  video: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-posing-in-dramatic-light-49970-large.mp4",
};

export default function HomePage() {
  const { t } = useLocale();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const all = await fetchProducts();
        if (!mounted) return;
        setProducts(all.filter((p) => p.is_active));
      } catch (err) {
        if (mounted) {
          setError(err instanceof ApiError ? err.message : t("shop.loadFailed"));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const heroProduct = products[0];
  const heroImage = heroProduct ? splitImages(heroProduct.image_url)[0] : EDITORIAL.hero;

  const categories = useMemo(() => extractCategories(products), [products]);

  const categoryTile = (cat) => products.find((x) => x.category_name === cat);

  const featured = products.slice(0, 8);

  const spotlight =
    products.length > 3 ? products[3] : products[1] ?? products[0];
  const editorialProduct =
    products.length > 2 ? products[2] : products[1] ?? products[0];
  const editorialImage = editorialProduct
    ? splitImages(editorialProduct.image_url)[0]
    : EDITORIAL.editorial;

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="hero__img">
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImage} alt={t("home.heroEyebrow")} />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                background:
                  "radial-gradient(120% 90% at 75% 10%, #2c2a26 0%, #0b0b0b 55%)",
              }}
            />
          )}
        </div>
        <div className="hero__veil" />
        <div className="hero__inner">
          <p className="hero__eyebrow hero__stagger hero__stagger--1">{t("home.heroEyebrow")}</p>
          <h1 className="hero__title hero__stagger hero__stagger--2">
            {t("home.heroTitleStart")} <em>{t("home.heroTitleEnd")}</em>
          </h1>
          <p className="hero__sub hero__stagger hero__stagger--3">
            {t("home.heroSub")}
          </p>
          <div className="hero__cta hero__stagger hero__stagger--4">
            <Link href="/shop" className="btn btn--light">
              {t("home.heroCta")} <span aria-hidden="true">→</span>
            </Link>
            <Link href="/signup" className="btn btn--outline btn--light-text">
              {t("home.heroCta2")}
            </Link>
          </div>
        </div>
      </section>

      {/* ============ MARQUEE ============ */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {[0, 1].map((copy) => (
            <span key={copy} style={{ display: "inline-flex", gap: 48 }}>
              <span>{t("marquee.season")}</span>
              <span>{t("marquee.shipping")}</span>
              <span>{t("marquee.drops")}</span>
              <span>{t("marquee.essentials")}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ============ FEATURED ============ */}
      <section className="section" id="featured">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <div>
                <p className="section-label">{t("home.drop")}</p>
                <h2 className="section-title">{t("home.featured")}</h2>
              </div>
              <Link href="/shop" className="u-link" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                {t("home.viewAll")} →
              </Link>
            </div>
          </Reveal>

          {loading ? (
            <div className="container">
              <ProductGridSkeleton count={4} />
            </div>
          ) : error ? (
            <div className="empty-state">
              <div className="mark" aria-hidden="true">!</div>
              <h3>{t("home.unavailable")}</h3>
              <p>{error}</p>
              <button className="btn btn--primary btn--sm" onClick={() => window.location.reload()}>
                {t("home.retry")}
              </button>
            </div>
          ) : featured.length === 0 ? (
            <div className="empty-state">
              <div className="mark" aria-hidden="true">◎</div>
              <h3>{t("home.catEmpty")}</h3>
              <p>{t("home.catEmptyBody")}</p>
            </div>
          ) : (
            <div className="p-grid">
              {featured.slice(0, 4).map((p, i) => (
                <Reveal key={p.id} delay={i * 70}>
                  <ProductCard product={p} index={i} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ CATEGORIES ============ */}
      {categories.length > 0 && (
        <section className="section section--alt">
          <div className="container">
            <Reveal>
              <div className="section-head">
                <div>
                  <p className="section-label" style={{ color: "var(--accent)" }}>
                    {t("home.discover")}
                  </p>
                  <h2 className="section-title">{t("home.shopByCat")}</h2>
                </div>
              </div>
            </Reveal>
            <div className="cat-grid">
              {categories.slice(0, 4).map((cat, i) => {
                const p = categoryTile(cat);
                const img = p ? splitImages(p.image_url)[0] : null;
                return (
                  <Reveal key={cat} delay={i * 70}>
                    <Link href={`/shop?category=${encodeURIComponent(cat)}`} className="cat-tile">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt={cat} loading="lazy" />
                      ) : (
                        <div style={{ position: "absolute", inset: 0 }} />
                      )}
                      <span className="cat-tile__label">
                        <span className="name" style={{ fontFamily: "var(--display)" }}>
                          {cat}
                        </span>
                        <span className="arrow" aria-hidden="true">→</span>
                      </span>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============ EDITORIAL ============ */}
      <section className="section">
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 60,
              alignItems: "center",
            }}
            className="editorial"
          >
            <Reveal>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                {!videoFailed ? (
                  <video
                    className="editorial__video"
                    src={EDITORIAL.video}
                    poster={EDITORIAL.videoPoster}
                    muted
                    autoPlay
                    loop
                    playsInline
                    aria-hidden="true"
                    onError={() => setVideoFailed(true)}
                    style={{
                      width: "100%",
                      aspectRatio: "4/5",
                      objectFit: "cover",
                      borderRadius: "var(--radius)",
                      background: "var(--bg-alt)",
                    }}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={editorialImage}
                    alt={editorialProduct?.title || t("home.ideaTitle")}
                    loading="lazy"
                    style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", borderRadius: "var(--radius)" }}
                  />
                )}
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div>
                <p className="section-label">{t("home.idea")}</p>
                <h2 className="section-title">{t("home.ideaTitle")}</h2>
                <p className="section-sub" style={{ marginTop: "var(--space-5)", marginBottom: "var(--space-7)" }}>
                  {t("home.ideaBody")}
                </p>
                <Link href="/shop" className="btn btn--primary">
                  {t("home.explore")} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ FULL WIDTH SPOTLIGHT ============ */}
      {spotlight && (
        <section className="section section--tight" style={{ paddingTop: 0 }}>
          <div className="container">
            <Reveal>
              <Link
                href={`/product/${encodeURIComponent(spotlight.title)}`}
                style={{ position: "relative", display: "block", overflow: "hidden", borderRadius: "var(--radius)" }}
                className="spotlight"
              >
                <img
                  src={splitImages(spotlight.image_url)[0] || EDITORIAL.spotlight}
                  alt={spotlight.title}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "min(72vh, 620px)",
                    objectFit: "cover",
                    objectPosition: "center 30%",
                  }}
                />
                <div
                  className="spotlight__veil"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(0deg, rgba(6,6,6,0.72), transparent 55%)",
                    display: "flex",
                    alignItems: "flex-end",
                    padding: "var(--space-8)",
                  }}
                >
                  <div>
                    <p className="section-label" style={{ color: "var(--accent)" }}>{t("home.spotlight")}</p>
                    <h2 style={{ color: "var(--bg)", fontSize: "clamp(1.6rem, 4vw, 2.6rem)", maxWidth: "18ch", marginTop: "var(--space-2)" }}>
                      {spotlight.title}
                    </h2>
                    <span className="btn btn--light btn--sm" style={{ marginTop: "var(--space-6)" }}>
                      {t("home.viewProduct")} →
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* ============ FINAL CTA ============ */}
      <section className="section section--alt">
        <div className="container" style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Reveal>
            <h2 className="section-title" style={{ maxWidth: "20ch", margin: "0 auto" }}>
              {t("home.ctaTitle")}
            </h2>
            <p style={{ color: "rgba(245,243,239,0.7)", marginTop: "var(--space-4)", maxWidth: "44ch", lineHeight: 1.75 }}>
              {t("home.ctaBody")}
            </p>
            <div style={{ display: "flex", gap: "var(--space-4)", justifyContent: "center", marginTop: "var(--space-7)", flexWrap: "wrap" }}>
              <Link href="/shop" className="btn btn--accent">
                {t("home.ctaPrimary")}
              </Link>
              <Link href="/signup" className="btn btn--outline btn--light-text">
                {t("home.ctaJoin")}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}