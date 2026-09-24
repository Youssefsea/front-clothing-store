"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useUi } from "@/context/UiContext";
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

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?next=/cart");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleRemove = async (cartItemId, title) => {
    try {
      await removeFromCart(cartItemId);
      notify(`${title} removed from your bag`);
    } catch (err) {
      notify(err?.message || "Could not remove item");
    }
  };

  if (authLoading) {
    return (
      <div className="nav-spacer">
        <Loader label="Checking your bag" />
      </div>
    );
  }

  const shipping = totals.subtotal > 0 && totals.subtotal < 100 ? 6.5 : 0;
  const grandTotal = totals.subtotal + shipping;

  return (
    <div className="nav-spacer">
      <div className="container" style={{ padding: "48px 24px 90px" }}>
        <div className="breadcrumb" style={{ marginBottom: 26 }}>
          <Link href="/">Home</Link>
          <span className="sep">/</span>
          <span className="current">Your bag</span>
        </div>

        <div className="section-head" style={{ marginBottom: 20 }}>
          <div>
            <p className="section-label">Almost there</p>
            <h1 className="section-title">Your bag</h1>
          </div>
        </div>

        {loading && items.length === 0 ? (
          <Loader label="Loading your bag" />
        ) : items.length === 0 ? (
          <EmptyState
            icon="◎"
            title="Your bag is empty"
            body="Nothing here yet — find pieces you love and they will show up in your bag."
            action={
              <Link href="/shop" className="btn btn--primary btn--sm">Shop the collection</Link>
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
                          <button onClick={() => updateQuantity(item.cart_item_id, -1)} disabled={mutating[item.cart_item_id] || item.quantity <= 1} aria-label="Decrease quantity">−</button>
                          <span style={{ minWidth: 22, textAlign: "center" }}>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.cart_item_id, 1)} disabled={mutating[item.cart_item_id]} aria-label="Increase quantity">+</button>
                        </div>
                        <button className="cart-line__remove" onClick={() => handleRemove(item.cart_item_id, item.title)} disabled={mutating[item.cart_item_id]}>
                          Remove
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
                Refresh bag
              </button>
            </div>

            <aside className="summary">
              <h3 style={{ fontFamily: "var(--display)", fontSize: "1.05rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Summary
              </h3>
              <div className="summary__rows">
                <div className="summary__row">
                  <span>Items ({totals.totalItems})</span>
                  <span>{totals.itemLines} line{totals.itemLines === 1 ? "" : "s"}</span>
                </div>
                <div className="summary__row">
                  <span>Subtotal</span>
                  <span>{formatPrice(totals.subtotal)}</span>
                </div>
                <div className="summary__row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                <div className="summary__row summary__row--total">
                  <span>Total</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>
              <Link href="/checkout" className="btn btn--primary btn--block">Proceed to checkout</Link>
              <Link href="/shop" className="btn btn--outline btn--dark-text btn--block" style={{ marginTop: 10 }}>
                Continue shopping
              </Link>
              <p className="summary__note">
                Free standard shipping on orders over $100. Payment is confirmed
                after you upload your payment screenshot at checkout.
              </p>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}