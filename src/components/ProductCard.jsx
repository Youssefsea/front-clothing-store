"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductImage from "./ProductImage";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useUi } from "@/context/UiContext";

export default function ProductCard({ product, index = 0, small = false }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { notify, openCart, openSearch } = useUi();
  const [adding, setAdding] = useState(false);

  const out = product.stock <= 0;
  const discounted = product.discount > 0;
  const href = `/product/${encodeURIComponent(product.title)}`;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (out) return;
    setAdding(true);
    try {
      await addToCart(product.id, 1, product.sizes?.[0] || "", product.colors?.[0] || "");
      notify("Added to your bag");
      const badge = document.querySelector(".navbar__cart-count");
      if (badge) {
        badge.classList.remove("cart-badge-pulse");
        void badge.offsetWidth;
        badge.classList.add("cart-badge-pulse");
      }
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) {
        router.push("/login");
      } else {
        notify(err?.message || "Could not add to bag");
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="p-card" style={{ animationDelay: `${index * 60}ms` }}>
      <Link href={href} className="p-card__media" aria-label={product.title}>
        <ProductImage imageUrl={product.image_url} alt={product.title} />
        {discounted && !out && (
          <span className="p-card__badge">-{Math.round(product.discount)}%</span>
        )}
        {out && <span className="p-card__badge p-card__badge--soldout">Sold out</span>}
        <span className="p-card__quick" onClick={handleQuickAdd}>
          <button className="btn" disabled={adding || out || !isAuthenticated}>
            {adding ? "Adding…" : isAuthenticated ? "Quick add" : "Sign in to shop"}
          </button>
        </span>
      </Link>
      <div className="p-card__body">
        <span className="p-card__cat">{product.category_name}</span>
        <Link href={href} className="p-card__title">
          {product.title}
        </Link>
        <div className="p-card__price">
          <span className="now">{formatPrice(product.finalPrice)}</span>
          {discounted && <span className="was">{formatPrice(product.price)}</span>}
        </div>
        {out ? (
          <span className="p-card__stock p-card__stock--out">Out of stock</span>
        ) : product.stock <= 5 ? (
          <span className="p-card__stock p-card__stock--low">
            Only {product.stock} left
          </span>
        ) : null}
      </div>
    </article>
  );
}