"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useUi } from "@/context/UiContext";
import { confirmOrder } from "@/lib/api/orders";
import { formatPrice } from "@/lib/format";
import { ApiError } from "@/lib/api/client";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/Reveal";
import ProductImage from "@/components/ProductImage";

const METHODS = [
  { value: "cod", label: "Cash on delivery", hint: "Pay when your order arrives." },
  { value: "bank_transfer", label: "Bank transfer", hint: "We confirm your order once the transfer is verified." },
  { value: "card", label: "Card payment", hint: "A secure card payment is processed on our end." },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totals, loading } = useCart();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { notify } = useUi();

  const [address, setAddress] = useState("");
  const [method, setMethod] = useState("bank_transfer");
  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState("");
  const [addressError, setAddressError] = useState("");
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?next=/checkout");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  if (authLoading) {
    return <div className="nav-spacer"><Loader label="Preparing checkout" /></div>;
  }

  const handleFile = (file) => {
    setFileError("");
    if (!file) return;
    const okType = file.type.startsWith("image/");
    const okSize = file.size <= 8 * 1024 * 1024;
    if (!okType) {
      setFileError("Please upload an image file (PNG or JPG).");
      return;
    }
    if (!okSize) {
      setFileError("That file is over 8 MB — please use a smaller screenshot.");
      return;
    }
    setScreenshot(file);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(file);
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    let bad = false;
    if (!address.trim() || address.trim().length < 8) {
      setAddressError("Enter a full delivery address (at least 8 characters).");
      bad = true;
    } else {
      setAddressError("");
    }
    if (!screenshot) {
      setFileError("Upload a payment screenshot so we can confirm the order.");
      bad = true;
    } else {
      setFileError("");
    }
    if (bad) return;

    setSubmitting(true);
    try {
      const data = await confirmOrder({
        paymentMethod: method,
        address: address.trim(),
        screenshot,
      });
      notify(data?.message || "Order placed");
      const orderId = data?.order_id || data?.orderId || "";
      const total = data?.total ?? totals.subtotal;
      router.push(`/orderComplet?order=${encodeURIComponent(orderId)}&total=${total}`);
    } catch (err) {
      if (err instanceof ApiError) {
        notify(err.status === 401 ? "Your session expired — sign in again." : err.message);
      } else {
        notify("We couldn't place the order. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const shipping = totals.subtotal > 0 && totals.subtotal < 100 ? 6.5 : 0;
  const grandTotal = totals.subtotal + shipping;

  return (
    <div className="nav-spacer">
      <div className="container" style={{ padding: "48px 24px 90px" }}>
        <div className="section-head" style={{ marginBottom: 20 }}>
          <div>
            <p className="section-label">Final step</p>
            <h1 className="section-title">Checkout</h1>
          </div>
        </div>

        {loading && items.length === 0 ? (
          <Loader label="Checking your order" />
        ) : items.length === 0 ? (
          <EmptyState
            icon="◎"
            title="Your bag is empty"
            body="Add a few pieces first, then come back to check out."
            action={
              <Link href="/shop" className="btn btn--primary btn--sm">Shop the collection</Link>
            }
          />
        ) : (
          <form className="checkout-layout" onSubmit={submit} noValidate>
            <div>
              <Reveal>
                <div className="checkout-panel">
                  <h3><span className="n">1</span> Delivery address</h3>
                  <div className="field">
                    <label htmlFor="address">Address</label>
                    <textarea
                      id="address"
                      placeholder="Street, city, postal code, country"
                      value={address}
                      onChange={(e) => { setAddress(e.target.value); setAddressError(""); }}
                      className={addressError ? "has-error" : ""}
                    />
                    {addressError && <span className="field__error">{addressError}</span>}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={80}>
                <div className="checkout-panel">
                  <h3><span className="n">2</span> Payment method</h3>
                  <div className="methods">
                    {METHODS.map((m) => (
                      <label
                        key={m.value}
                        className={`method ${method === m.value ? "method--active" : ""}`}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value={m.value}
                          checked={method === m.value}
                          onChange={() => setMethod(m.value)}
                        />
                        <span style={{ flex: 1 }}>
                          <div className="method__label">{m.label}</div>
                          <div className="method__hint">{m.hint}</div>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={160}>
                <div className="checkout-panel">
                  <h3><span className="n">3</span> Payment screenshot</h3>
                  <div
                    className={`file-drop ${screenshot ? "has-file" : ""}`}
                    onClick={() => fileRef.current?.click()}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFile(e.target.files?.[0])}
                    />
                    <div className="file-drop__title">
                      {screenshot ? "Screenshot ready" : "Upload your payment screenshot"}
                    </div>
                    <div className="file-drop__sub">
                      PNG or JPG, up to 8 MB — attach the proof of payment for your order.
                    </div>
                  </div>
                  {fileError && <span className="field__error">{fileError}</span>}

                  {preview && (
                    <div className="drop-zone--preview">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview} alt="Payment screenshot preview" />
                      <button
                        type="button"
                        className="cart-line__remove"
                        onClick={() => { setScreenshot(null); setPreview(""); }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </Reveal>
            </div>

            <aside className="summary">
              <h3 style={{ fontFamily: "var(--display)", fontSize: "1.05rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                Your order
              </h3>

              <div style={{ margin: "14px 0" }}>
                {items.slice(0, 4).map((item) => (
                  <div key={item.cart_item_id} className="order-line">
                    <ProductImage imageUrl={item.image} alt={item.title} className="order-line__img" style={{ width: 52, height: 62 }} />
                    <div style={{ minWidth: 0 }}>
                      <div className="order-line__title">{item.title}</div>
                      <div className="order-line__meta">{item.size} · {item.color} · ×{item.quantity}</div>
                    </div>
                    <div className="order-line__price" style={{ fontFamily: "var(--display)", fontSize: "0.9rem" }}>
                      {formatPrice((item.final_price || 0) * item.quantity)}
                    </div>
                  </div>
                ))}
                {items.length > 4 && (
                  <p className="order-line__meta" style={{ padding: "6px 0" }}>+ {items.length - 4} more item{items.length - 4 === 1 ? "" : "s"}</p>
                )}
              </div>

              <div className="summary__rows">
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

              <button className="btn btn--primary btn--block" disabled={submitting || loading}>
                {submitting ? "Placing order…" : `Place order · ${formatPrice(grandTotal)}`}
              </button>
              <Link href="/cart" className="btn btn--outline btn--dark-text btn--block" style={{ marginTop: 10 }}>
                Back to bag
              </Link>
              <p className="summary__note">
                By placing an order you confirm that your payment screenshot is
                genuine. Our team reviews it before shipping.
              </p>
            </aside>
          </form>
        )}
      </div>
    </div>
  );
}