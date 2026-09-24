"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchProducts, extractCategories } from "@/lib/api/products";
import { splitImages } from "@/lib/format";
import ProductCard from "@/components/ProductCard";
import ProductGridSkeleton from "@/components/ProductGridSkeleton";
import Reveal from "@/components/Reveal";
import { ApiError } from "@/lib/api/client";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const all = await fetchProducts();
        if (!mounted) return;
        setProducts(all.filter((p) => p.is_active));
      } catch (err) {
        if (mounted) {
          setError(err instanceof ApiError ? err.message : "Could not load the collection.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const heroProduct = products[0];
  const heroImage = heroProduct ? splitImages(heroProduct.image_url)[0] : null;

  const categories = useMemo(() => extractCategories(products), [products]);

  const categoryTile = (cat) => {
    const p = products.find((x) => x.category_name === cat);
    return p;
  };

  const featured = products.slice(0, 8);

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="hero__img">
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={heroImage} alt="Latest collection" />
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
          <p className="hero__eyebrow hero__stagger hero__stagger--1">New season</p>
          <h1 className="hero__title hero__stagger hero__stagger--2">
            Reinvent the <em>everyday.</em>
          </h1>
          <p className="hero__sub hero__stagger hero__stagger--3">
            A focused collection of modern essentials — sharp cuts, honest
            materials and pieces built to live in your rotation.
          </p>
          <div className="hero__cta hero__stagger hero__stagger--4">
            <Link href="/shop" className="btn btn--light">
              Shop collection <span aria-hidden="true">→</span>
            </Link>
            <Link href="/signup" className="btn btn--outline btn--light-text">
              Create account
            </Link>
          </div>
        </div>
      </section>

      {/* ============ MARQUEE ============ */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {[0, 1].map((copy) => (
            <span key={copy} style={{ display: "inline-flex", gap: 48 }}>
              <span>New season</span>
              <span>Free shipping over $100</span>
              <span>Fresh drops</span>
              <span>Modern essentials</span>
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
                <p className="section-label">The drop</p>
                <h2 className="section-title">Featured pieces</h2>
              </div>
              <Link href="/shop" className="u-link" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                View all products →
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
              <h3>Collection unavailable</h3>
              <p>{error}</p>
              <button className="btn btn--primary btn--sm" onClick={() => window.location.reload()}>
                Try again
              </button>
            </div>
          ) : featured.length === 0 ? (
            <div className="empty-state">
              <div className="mark" aria-hidden="true">◎</div>
              <h3>The collection is empty</h3>
              <p>Products will appear here as soon as they are added.</p>
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
                    Discover
                  </p>
                  <h2 className="section-title">Shop by category</h2>
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
                        <img src={img} alt={cat} />
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
      {products.length >= 3 && (
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
                  <img
                    src={splitImages(products[1].image_url)[0]}
                    alt={products[1].title}
                    style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", borderRadius: "var(--radius)" }}
                  />
                </div>
              </Reveal>
              <Reveal delay={120}>
                <div>
                  <p className="section-label">The idea</p>
                  <h2 className="section-title" style={{ marginBottom: 20 }}>
                    Clothes that carry a point of view.
                  </h2>
                  <p style={{ color: "var(--muted)", lineHeight: 1.8, maxWidth: "48ch", marginBottom: 24 }}>
                    Every piece in the collection is treated like a canvas — a
                    silhouette to build around, a color to commit to, a fabric
                    that holds its shape. Less clutter. More intention.
                  </p>
                  <Link href="/shop" className="btn btn--primary">
                    Explore the range <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ============ FULL WIDTH SPOTLIGHT ============ */}
      {products[3] && (
        <section className="section section--tight" style={{ paddingTop: 0 }}>
          <div className="container">
            <Reveal>
              <Link
                href={`/product/${encodeURIComponent(products[3].title)}`}
                style={{ position: "relative", display: "block", overflow: "hidden", borderRadius: "var(--radius)" }}
                className="spotlight"
              >
                <img
                  src={splitImages(products[3].image_url)[0]}
                  alt={products[3].title}
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
                    padding: 44,
                  }}
                >
                  <div>
                    <p className="section-label" style={{ color: "var(--accent)" }}>Spotlight</p>
                    <h2 style={{ color: "var(--bg)", fontSize: "clamp(1.6rem, 4vw, 2.6rem)", maxWidth: "18ch" }}>
                      {products[3].title}
                    </h2>
                    <span className="btn btn--light btn--sm" style={{ marginTop: 18 }}>
                      View product →
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
              Ready to refresh your rotation?
            </h2>
            <p style={{ color: "rgba(245,243,239,0.7)", marginTop: 18, maxWidth: "44ch", lineHeight: 1.7 }}>
              New pieces drop throughout the season. Be first in line.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 32, flexWrap: "wrap" }}>
              <Link href="/shop" className="btn btn--accent">
                Shop the collection
              </Link>
              <Link href="/signup" className="btn btn--outline btn--light-text">
                Join VANTA
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}