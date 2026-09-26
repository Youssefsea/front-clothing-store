"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMyOrders } from "@/lib/api/orders";
import { formatPrice, formatDate, statusTone } from "@/lib/format";
import { statusLabelKey } from "@/lib/i18n";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/Reveal";
import ProductImage from "@/components/ProductImage";

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { t } = useLocale();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?next=/orders");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    let mounted = true;
    (async () => {
      try {
        const list = await getMyOrders();
        if (mounted) setOrders(list);
      } catch (err) {
        if (mounted) setError(err?.message || t("orders.loadFail"));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated]);

  if (authLoading) {
    return <div className="nav-spacer"><Loader label={t("account.checking")} /></div>;
  }

  if (!isAuthenticated) return null;

  return (
    <div className="nav-spacer">
      <div className="container page">
        <div className="page-head">
          <div>
            <p className="section-label">{t("orders.history")}</p>
            <h1 className="section-title">{t("orders.title")}</h1>
          </div>
          <div className="page-actions">
            <Link href="/account" className="btn btn--outline btn--dark-text btn--sm">{t("orders.account")}</Link>
            <Link href="/shop" className="btn btn--primary btn--sm">{t("orders.shopAgain")}</Link>
          </div>
        </div>

        {loading ? (
          <Loader label={t("orders.loading")} />
        ) : error ? (
          <EmptyState
            icon="!"
            title={t("orders.unavailable")}
            body={error}
            action={
              <button className="btn btn--primary btn--sm" onClick={() => window.location.reload()}>
                {t("home.retry")}
              </button>
            }
          />
        ) : orders.length === 0 ? (
          <EmptyState
            icon="◎"
            title={t("orders.none")}
            body={t("orders.noneBody")}
            action={
              <Link href="/shop" className="btn btn--primary btn--sm">{t("orders.startShopping")}</Link>
            }
          />
        ) : (
          <div>
            {orders.map((order) => (
              <Reveal key={order.id}>
                <article className="order-card">
                  <div className="order-card__head">
                    <div>
                      <div className="order-card__id">{t("orders.cardId", { id: order.id })}</div>
                      <div className="order-card__date">{formatDate(order.created_at)}</div>
                    </div>
                    <span className={`badge badge--${statusTone(order.status)}`}>
                      {t(statusLabelKey(order.status))}
                    </span>
                  </div>

                  <div className="order-card__items">
                    {order.items.map((it, i) => (
                      <div className="order-line" key={i}>
                        <ProductImage imageUrl={it.image_url} alt={it.title} className="order-line__img" style={{ width: 52, height: 62 }} />
                        <div style={{ minWidth: 0 }}>
                          <div className="order-line__title">{it.title}</div>
                          <div className="order-line__meta">
                            {it.size && <span>{it.size}</span>}
                            {it.size && <span> · </span>}
                            {it.color && <span>{it.color}</span>}
                            {it.size && <span> · </span>}
                            <span>×{it.quantity}</span>
                          </div>
                        </div>
                        <span className="order-line__price">{formatPrice(it.price)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-card__foot">
                    <span style={{ color: "var(--muted)" }}>
                      {order.address ? order.address.slice(0, 48) + (order.address.length > 48 ? "…" : "") : ""}
                    </span>
                    <span style={{ fontFamily: "var(--display)", fontWeight: 600 }}>
                      {t("orders.total")} {formatPrice(order.total)}
                    </span>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}