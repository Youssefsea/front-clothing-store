"use client";

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchProductByTitle } from "@/lib/api/products";
import { splitImages, formatPrice } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useUi } from "@/context/UiContext";
import ProductGridSkeleton from "@/components/ProductGridSkeleton";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/Reveal";

function decodeTitle(param) {
  try {
    return decodeURIComponent(param || "");
  } catch {
    return param || "";
  }
}

export default function ProductPage({ params }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { notify } = useUi();

  const [title, setTitle] = useState("");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [images, setImages] = useState([]);
  const [active, setActive] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let mounted = true;
    // Next may hand pages either a resolved object or a promise.
    Promise.resolve(params).then((p) => {
      if (mounted) setTitle(decodeTitle(p?.title));
    });
    return () => {
      mounted = false;
    };
  }, [params]);

  useEffect(() => {
    if (!title) return;
    let mounted = true;
    setLoading(true);
    setNotFound(false);
    (async () => {
      try {
        const found = await fetchProductByTitle(title);
        if (!mounted) return;
        if (found.length === 0) {
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
      } catch {
        if (mounted) setNotFound(true);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [title]);

  const out = product ? product.stock <= 0 : false;
  const discounted = product ? product.discount > 0 : false;

  if (!title) {
    return (
      <div className="nav-spacer">
        <div className="container" style={{ paddingTop: 40 }}><ProductGridSkeleton count={1} /></div>
      </div>
    );
  }

  return (
    <div className="nav-spacer">
      <div className="container" style={{ padding: "36px 24px 90px" }}>
        <div className="breadcrumb" style={{ marginBottom: 30 }}>
          <Link href="/">Home</Link>
          <span className="sep">/</span>
          <Link href="/shop">Shop</Link>
          <span className="sep">/</span>
          <span className="current">{notFound ? "Not found" : loading ? "Loading…" : product?.title}</span>
        </div>

        {loading ? (
          <ProductGridSkeleton count={1} />
        ) : notFound || !product ? (
          <EmptyState
            icon="?"
            title="Product not found"
            body="This piece may have sold out or been removed."
            action={
              <Link href="/shop" className="btn btn--primary btn--sm">Back to shop</Link>
            }
          />
        ) : (
          <div className="pdp">
            {/* Gallery */}
            <div className="pdp__gallery">
              {images.length > 1 && (
                <div className="pdp__thumbs">
                  {images.map((src, i) => (
                    <button
                      key={src + i}
                      className={`pdp__thumb ${i === active ? "active" : ""}`}
                      onClick={() => setActive(i)}
                      aria-label={`View image ${i + 1}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "var(--radius)" }} />
                    </button>
                  ))}
                </div>
              )}
              <div className="pdp__main">
                {images[active] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={images[active]} src={images[active]} alt={product.title} />
                ) : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontFamily: "var(--display)", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                    {product.title.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div>
              <Reveal>
                <p className="p-card__cat" style={{ marginBottom: 10 }}>{product.category_name}</p>
                <h1 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", maxWidth: "20ch" }}>
                  {product.title}
                </h1>

                <div className="pdp__price">
                  <span className="now">{formatPrice(product.finalPrice)}</span>
                  {discounted && <span className="was">{formatPrice(product.price)}</span>}
                  {discounted && <span className="off">-{Math.round(product.discount)}%</span>}
                </div>

                {out ? (
                  <p className="pdp__stock p-card__stock--out" style={{ fontSize: "0.9rem", marginTop: 6 }}>Out of stock</p>
                ) : product.stock <= 5 ? (
                  <p className="pdp__stock p-card__stock--low" style={{ fontSize: "0.9rem", marginTop: 6 }}>Only {product.stock} left</p>
                ) : null}

                <p className="pdp__desc">{product.description}</p>

                {product.colors.length > 0 && (
                  <div>
                    <div className="pdp__swatch-label">Color — <span style={{ color: "var(--ink)" }}>{color}</span></div>
                    <div className="pdp__swatches">
                      {product.colors.map((c) => (
                        <button
                          key={c}
                          type="button"
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
                    <div className="pdp__swatch-label">Size — <span style={{ color: "var(--ink)" }}>{size || "Pick"}</span></div>
                    <div className="pdp__swatches">
                      {product.sizes.map((s) => (
                        <button
                          key={s}
                          type="button"
                          className={`swatch ${size === s ? "swatch--active" : ""}`}
                          onClick={() => setSize(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pdp__qty">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" disabled={qty <= 1}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} aria-label="Increase quantity" disabled={qty >= product.stock}>+</button>
                </div>

                <div className="pdp__cta">
                  <button
                    className="btn btn--primary btn--block"
                    disabled={adding || out || !isAuthenticated}
                    onClick={async () => {
                      setAdding(true);
                      try {
                        await addToCart(product.id, qty, size, color);
                        notify("Added to your bag");
                      } catch (err) {
                        if (err?.status === 401 || err?.status === 403) {
                          router.push(`/login?next=/product/${encodeURIComponent(title)}`);
                        } else {
                          notify(err?.message || "Could not add to bag");
                        }
                      } finally {
                        setAdding(false);
                      }
                    }}
                  >
                    {adding ? "Adding…" : isAuthenticated ? "Add to bag" : "Sign in to add to bag"}
                  </button>
                  <Link href="/cart" className="btn btn--outline btn--dark-text btn--block">View your bag</Link>
                </div>

                <div className="pdp__meta">
                  <div><b>SKU</b> — <span>#{product.id}</span></div>
                  <div><b>Available sizes</b> — <span className="pdp__sizes">{product.sizes.map((s) => <span key={s} style={{ marginRight: 8 }}>{s}</span>)}</span></div>
                  <div><b>Colors</b> — <span>{product.colors.join(", ") || "—"}</span></div>
                  <div><b>Stock</b> — <span style={{ color: out ? "var(--err)" : "var(--ok)" }}>{out ? "Sold out" : `${product.stock} in stock`}</span></div>
                  <p className="pdp__note">Free shipping over $100. This piece is part of the current collection drop.</p>
                </div>
              </Reveal>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}