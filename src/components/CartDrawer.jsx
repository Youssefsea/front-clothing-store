"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useUi } from "@/context/UiContext";
import { useLocale } from "@/context/LocaleContext";
import { formatPrice } from "@/lib/format";
import ProductImage from "./ProductImage";

export default function CartDrawer() {
  const { cartOpen, closeCart, notify } = useUi();
  const { items, totals, updateQuantity, removeFromCart, mutating } = useCart();
  const { t } = useLocale();

  const handleRemove = async (id, title) => {
    try {
      await removeFromCart(id);
      notify(t("cart.removed", { t: title }));
    } catch (err) {
      notify(err?.message || t("cart.removeFail"));
    }
  };

  return (
    <>
      <div
        className={`overlay ${cartOpen ? "open" : ""}`}
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside className={`drawer ${cartOpen ? "open" : ""}`} aria-hidden={!cartOpen} inert={!cartOpen ? "" : undefined} role="dialog" aria-modal="true" aria-label={t("cart.title")}>
        <div className="drawer__head">
          <h3>
            {t("cart.title")} <span className="drawer__count">({totals.totalItems})</span>
          </h3>
          <button type="button" className="icon-btn" onClick={closeCart} aria-label={t("common.close")}>
            ✕
          </button>
        </div>

        <div className="drawer__body">
          {items.length === 0 ? (
            <div className="empty-state" style={{ padding: "60px 24px" }}>
              <div className="mark" aria-hidden="true">◎</div>
              <h3>{t("cart.empty")}</h3>
              <p>{t("cart.emptyBody")}</p>
              <Link href="/shop" className="btn btn--primary btn--sm" onClick={closeCart}>
                {t("cart.shop")}
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.cart_item_id}
                className="mcart-item"
                style={{ gridTemplateColumns: "74px 1fr auto" }}
              >
                <ProductImage
                  imageUrl={item.image}
                  alt={item.title}
                  className="mcart-item__img"
                />
                <div style={{ minWidth: 0 }}>
                  <div className="mcart-item__title">{item.title}</div>
                  <div className="mcart-item__meta">
                    <span>{item.size}</span>
                    <span>·</span>
                    <span>{item.color}</span>
                    <span>·</span>
                    <span>{formatPrice(item.final_price)}</span>
                  </div>
                  <div className="mcart-item__qty">
                    <button
                      onClick={() => updateQuantity(item.cart_item_id, -1)}
                      disabled={mutating[item.cart_item_id] || item.quantity <= 1}
                      aria-label="−"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.cart_item_id, 1)}
                      disabled={mutating[item.cart_item_id]}
                      aria-label="+"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                  <button
                    className="mcart-item__remove"
                    onClick={() => handleRemove(item.cart_item_id, item.title)}
                    disabled={mutating[item.cart_item_id]}
                  >
                    {t("cart.remove")}
                  </button>
                  <div style={{ fontFamily: "var(--display)", fontWeight: 600 }}>
                    {formatPrice((item.final_price || 0) * item.quantity)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="drawer__foot">
          <div className="drawer__totals">
            <span className="label">{t("cart.subtotal")}</span>
            <span className="value">{formatPrice(totals.subtotal)}</span>
          </div>
          <Link href="/checkout" className="btn btn--primary btn--block" onClick={closeCart}>
            {t("cart.checkout")}
          </Link>
          <Link
            href="/cart"
            className="btn btn--outline btn--dark-text btn--block"
            onClick={closeCart}
          >
            {t("cart.viewBag")}
          </Link>
        </div>
      </aside>
    </>
  );
}