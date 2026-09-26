"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductImage from "./ProductImage";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useUi } from "@/context/UiContext";
import { useLocale } from "@/context/LocaleContext";

export default function ProductCard({ product, index = 0 }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { notify } = useUi();
  const { t } = useLocale();
  const [adding, setAdding] = useState(false);

  const out = product.stock <= 0;
  const discounted = product.discount > 0;
  const href = `/product/${encodeURIComponent(product.title)}`;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (out) return;
    if (!product.sizes?.length || !product.colors?.length) {
      router.push(href);
      return;
    }
    if (!isAuthenticated) {
      router.push(`/login?next=${encodeURIComponent(href)}`);
      return;
    }
    setAdding(true);
    try {
      await addToCart(product.id, 1, product.sizes?.[0] || "", product.colors?.[0] || "");
      notify(t("card.added"));
      const badge = document.querySelector(".navbar__cart-count");
      if (badge) {
        badge.classList.remove("cart-badge-pulse");
        void badge.offsetWidth;
        badge.classList.add("cart-badge-pulse");
      }
    } catch (err) {
      if (err?.status === 401 || err?.status === 403) {
        router.push(`/login?next=${encodeURIComponent(href)}`);
      } else {
        notify(err?.message || t("card.addFail"));
      }
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="p-card" style={{ animationDelay: `${index * 60}ms` }}>
      <div className="p-card__media">
        <Link href={href} className="p-card__media-link" aria-label={product.title}>
          <ProductImage imageUrl={product.image_url} alt={product.title} />
          {discounted && !out && (
            <span className="p-card__badge">-{Math.round(product.discount)}%</span>
          )}
          {out && <span className="p-card__badge p-card__badge--soldout">{t("common.soldOut")}</span>}
        </Link>
        <span className="p-card__quick">
          <button
            type="button"
            className="btn"
            disabled={adding || out}
            onClick={handleQuickAdd}
          >
            {adding
              ? t("card.adding")
              : isAuthenticated
                ? t("card.quickAdd")
                : t("card.signInShop")}
          </button>
        </span>
      </div>
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
          <span className="p-card__stock p-card__stock--out">{t("common.outOfStock")}</span>
        ) : product.stock <= 5 ? (
          <span className="p-card__stock p-card__stock--low">
            {t("common.onlyLeft", { n: product.stock })}
          </span>
        ) : null}
      </div>
    </article>
  );
}
