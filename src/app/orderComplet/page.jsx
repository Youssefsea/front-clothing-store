"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getMyOrders } from "@/lib/api/orders";
import { formatPrice, formatDate, statusLabel, statusTone } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import Loader from "@/components/Loader";
import ProductImage from "@/components/ProductImage";

function OrderCompletInner() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order") || "";
  const totalQuery = Number(searchParams.get("total")) || 0;
  const { refresh } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    refresh();
    (async () => {
      try {
        const orders = await getMyOrders();
        if (!mounted) return;
        const match = orderId
          ? orders.find((o) => String(o.id) === String(orderId) || String(o.id).endsWith(orderId))
          : null;
        setOrder(match || null);
      } catch {
        if (mounted) setOrder(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [orderId, refresh]);

  return (
    <div className="nav-spacer">
      <div className="container page">
        <div className="success-hero">
          <div className="mark" aria-hidden="true">✓</div>
          <h1>Thank you — your order is in.</h1>
          <p>
            {order
              ? `Order ${order.id} is ${statusLabel(order.status).toLowerCase()} and our team is
                already on it. A confirmation is on its way to your inbox.`
              : "Your order was received and is now pending confirmation. Our team will review your payment shortly."}
          </p>
        </div>

        {loading ? (
          <Loader label="Loading your order" />
        ) : (
          <div className="success-card">
            <div className="success-card__row">
              <span className="k">Order number</span>
              <span className="v">{order ? order.id : orderId || "—"}</span>
            </div>
            <div className="success-card__row">
              <span className="k">Placed on</span>
              <span className="v">{order ? formatDate(order.created_at) : "Just now"}</span>
            </div>
            {order && (
              <div className="success-card__row">
                <span className="k">Status</span>
                <span className={`badge badge--${order ? statusTone(order.status) : "muted"}`}>
                  {statusLabel(order ? order.status : "pending")}
                </span>
              </div>
            )}
            <div className="success-card__row">
              <span className="k">Total</span>
              <span className="v">{order ? formatPrice(order.total) : formatPrice(totalQuery)}</span>
            </div>

            {order && order.items.length > 0 && (
              <div style={{ marginTop: 16 }}>
                {order.items.map((it, i) => (
                  <div key={i} className="order-line">
                    <ProductImage imageUrl={it.image_url} alt={it.title} className="order-line__img" style={{ width: 52, height: 62 }} />
                    <span className="order-line__title">{it.title}</span>
                    <span className="order-line__meta">×{it.quantity}</span>
                    <span className="order-line__price">{formatPrice(it.price)}</span>
                  </div>
                ))}
              </div>
            )}

            {order?.payment_screenshot && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={order.payment_screenshot}
                alt="Your payment screenshot"
                style={{ marginTop: 8 }}
              />
            )}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 30, flexWrap: "wrap" }}>
          <Link href="/orders" className="btn btn--primary">Track my order</Link>
          <Link href="/shop" className="btn btn--outline btn--dark-text">Keep shopping</Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderCompletPage() {
  return (
    <Suspense fallback={<div className="nav-spacer"><Loader /></div>}>
      <OrderCompletInner />
    </Suspense>
  );
}