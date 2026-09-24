"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useUi } from "@/context/UiContext";
import { useLocale } from "@/context/LocaleContext";
import { formatPrice } from "@/lib/format";
import ProductImage from "@/components/ProductImage";
import Reveal from "@/components/Reveal";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";

export default function CartPage() {
  const router = useRouter();
  const { items, totals, loading, mutating, updateQuantity, removeFromCart, error, refresh } = useCart();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { notify } = useUi();
  const { t } = useLocale();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?next=/cart");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleRemove = async (cartItemId, title) => {
    try {
      await removeFromCart(cartItemId);
      notify(t("cart.removed", { t: title }));
    } catch (err) {
      notify(err?.message || t("cart.removeFail"));
    }
  };

  if (authLoading) {
    return (
      <div className="nav-spacer">
        <Loader label={t("cart.checkingBag")} />
      </div>
    );
  }

  const shipping = totals.subtotal > 0 && totals.subtotal < 100 ? 6.5 : 0;
  const grandTotal = totals.subtotal + shipping;

  return (
    <div className="nav-spacer">
      <div className="container page">
        <div className="breadcrumb">
          <Link href="/">{t("cart.breadcrumb")}</Link>
          <span className="sep">/</span>
          <span className="current">{t("cart.current")}</span>
        </div>

        <div className="page-head">
          <p className="section-label">{t("cart.label")}</p>
          <h1 className="section-title">{t("cart.title")}</h1>
        </div>

        {loading && items.length === 0 ? (
          <Loader label={t("cart.loadingBag")} />
        ) : items.length === 0 ? (
          <EmptyState
            icon="◎"
            title={t("cart.empty")}
            body={t("cart.emptyBody")}
            action={
              <Link href="/shop" className="btn btn--primary btn--sm">{t("cart.shop")}</Link>
            }
          />
        ) : (
          <div className="cart-layout">
            <div>
              {error && totals.subtotal === 0 && (
                <div className="field__error" style={{ marginBottom: 16 }}>{error}</div>
              )}
              <Reveal>
                {items.map((item) => (
                  <div className="cart-line" key={item.cart_item_id}>
                    <Link href={`/product/${encodeURIComponent(item.title)}`}>
                      <ProductImage imageUrl={item.image} alt={item.title} className="cart-line__img" />
                    </Link>
                    <div style={{ minWidth: 0 }}>
                      <Link href={`/product/${encodeURIComponent(item.title)}`} className="cart-line__title">
                        {item.title}
                      </Link>
                      <div className="cart-line__meta">
                        <span>{item.size}</span>
                        <span>·</span>
                        <span>{item.color}</span>
                      </div>
                      <div className="cart-line__controls">
                        <div className="cart-line__qty">
                          <button onClick={() => updateQuantity(item.cart_item_id, -1)} disabled={mutating[item.cart_item_id] || item.quantity <= 1} aria-label="−">−</button>
                          <span style={{ minWidth: 22, textAlign: "center" }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.cart_item_id, 1)} disabled={mutating[item.cart_item_id]} aria-label="+">+</button>
                        </div>
                        <button className="cart-line__remove" onClick={() => handleRemove(item.cart_item_id, item.title)} disabled={mutating[item.cart_item_id]}>
                          {t("cart.remove")}
                        </button>
                      </div>
                    </div>
                    <div className="cart-line__price" style={{ textAlign: "right" }}>
                      {formatPrice((item.final_price || 0) * item.quantity)}
                    </div>
                  </div>
                ))}
              </Reveal>
              <button className="btn btn--outline btn--dark-text btn--sm" onClick={refresh} style={{ marginTop: 22 }}>
                {t("cart.refresh")}
              </button>
            </div>

            <aside className="summary">
              <h3 style={{ fontFamily: "var(--display)", fontSize: "1.05rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                {t("cart.summary")}
              </h3>
              <div className="summary__rows">
                <div className="summary__row">
                  <span>{t("cart.items")} ({totals.totalItems})</span>
                  <span>{t("cart.lines", { n: totals.itemLines })}</span>
                </div>
                <div className="summary__row">
                  <span>{t("cart.subtotal")}</span>
                  <span>{formatPrice(totals.subtotal)}</span>
                </div>
                <div className="summary__row">
                  <span>{t("cart.shipping")}</span>
                  <span>{shipping === 0 ? t("cart.free") : formatPrice(shipping)}</span>
                </div>
                <div className="summary__row summary__row--total">
                  <span>{t("cart.total")}</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>
              <Link href="/checkout" className="btn btn--primary btn--block">{t("cart.checkout")}</Link>
              <Link href="/shop" className="btn btn--outline btn--dark-text btn--block" style={{ marginTop: 10 }}>
                {t("cart.continue")}
              </Link>
              <p className="summary__note">
                {t("cart.note")}
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}