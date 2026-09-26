"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useUi } from "@/context/UiContext";
import { useLocale } from "@/context/LocaleContext";
import { confirmOrder } from "@/lib/api/orders";
import { formatPrice } from "@/lib/format";
import { ApiError } from "@/lib/api/client";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/Reveal";
import ProductImage from "@/components/ProductImage";

const METHODS = [
  { value: "vodafone_cash" },
  { value: "instapay" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totals, loading } = useCart();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { notify } = useUi();
  const { t } = useLocale();

  const [address, setAddress] = useState("");
  const [method, setMethod] = useState("vodafone_cash");
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
    return <div className="nav-spacer"><Loader label={t("checkout.preparing")} /></div>;
  }
  if (!isAuthenticated) return null;

  const methodLabel = (m) =>
    m.value === "vodafone_cash" ? t("checkout.mVodafone") : t("checkout.mInstapay");
  const methodHint = (m) =>
    m.value === "vodafone_cash" ? t("checkout.hVodafone") : t("checkout.hInstapay");

  const handleFile = (file) => {
    setFileError("");
    if (!file) return;
    const okType = file.type.startsWith("image/");
    const okSize = file.size <= 8 * 1024 * 1024;
    if (!okType) {
      setFileError(t("checkout.fileType"));
      return;
    }
    if (!okSize) {
      setFileError(t("checkout.fileSize"));
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
    if (!address.trim() || address.trim().length < 10) {
      setAddressError(t("checkout.addressTooShort"));
      bad = true;
    } else {
      setAddressError("");
    }
    if (!screenshot) {
      setFileError(t("checkout.fileRequired"));
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
      notify(data?.message || t("checkout.orderPlaced"));
      const orderId = data?.order_id || data?.orderId || "";
      router.push(`/orderComplet?order=${encodeURIComponent(orderId)}`);
    } catch (err) {
      if (err instanceof ApiError) {
        notify(err.status === 401 ? t("checkout.sessionExpired") : err.message);
      } else {
        notify(t("checkout.placeFail"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  // The current backend order total is the product subtotal only.
  // Do not invent a shipping charge that is absent from the order contract.
  const shipping = 0;
  const grandTotal = totals.subtotal;

  return (
    <div className="nav-spacer">
      <div className="container page">
        <div className="page-head">
          <div>
            <p className="section-label">{t("checkout.finalStep")}</p>
            <h1 className="section-title">{t("checkout.title")}</h1>
          </div>
        </div>

        {loading && items.length === 0 ? (
          <Loader label={t("checkout.checkingOrder")} />
        ) : items.length === 0 ? (
          <EmptyState
            icon="◎"
            title={t("cart.empty")}
            body={t("checkout.emptyBody")}
            action={
              <Link href="/shop" className="btn btn--primary btn--sm">{t("home.shop")}</Link>
            }
          />
        ) : (
          <form className="checkout-layout" onSubmit={submit} noValidate>
            <div>
              <Reveal>
                <div className="checkout-panel">
                  <h3><span className="n">1</span> {t("checkout.addressPanel")}</h3>
                  <div className="field">
                    <label htmlFor="address">{t("checkout.address")}</label>
                    <textarea
                      id="address"
                      placeholder={t("checkout.addressPlaceholder")}
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
                  <h3><span className="n">2</span> {t("checkout.paymentPanel")}</h3>
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
                          <div className="method__label">{methodLabel(m)}</div>
                          <div className="method__hint">{methodHint(m)}</div>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={160}>
                <div className="checkout-panel">
                  <h3><span className="n">3</span> {t("checkout.screenshotPanel")}</h3>
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
                      {screenshot ? t("checkout.dropReady") : t("checkout.dropUpload")}
                    </div>
                    <div className="file-drop__sub">
                      {t("checkout.dropSub")}
                    </div>
                  </div>
                  {fileError && <span className="field__error">{fileError}</span>}

                  {preview && (
                    <div className="drop-zone--preview">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview} alt={t("ordered.screenshotAlt")} />
                      <button
                        type="button"
                        className="cart-line__remove"
                        onClick={() => { setScreenshot(null); setPreview(""); }}
                      >
                        {t("cart.remove")}
                      </button>
                    </div>
                  )}
                </div>
              </Reveal>
            </div>

            <aside className="summary">
              <h3 style={{ fontFamily: "var(--display)", fontSize: "1.05rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>
                {t("checkout.yourOrder")}
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
                  <p className="order-line__meta" style={{ padding: "6px 0" }}>
                    + {items.length - 4 === 1 ? t("checkout.moreOne", { n: items.length - 4 }) : t("checkout.moreMany", { n: items.length - 4 })}
                  </p>
                )}
              </div>

              <div className="summary__rows">
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

              <button className="btn btn--primary btn--block" disabled={submitting || loading}>
                {submitting ? t("checkout.placing") : t("checkout.placeBtn", { price: formatPrice(grandTotal) })}
              </button>
              <Link href="/cart" className="btn btn--outline btn--dark-text btn--block" style={{ marginTop: 10 }}>
                {t("checkout.backBag")}
              </Link>
              <p className="summary__note">
                {t("checkout.note")}
              </p>
            </aside>
          </form>
        )}
      </div>
    </div>
  );
}