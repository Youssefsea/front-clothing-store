"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminOrders, normalizeAdminOrderStats } from "@/lib/api/admin";
import { api } from "@/lib/api/client";
import { formatPrice, formatDate, statusTone } from "@/lib/format";
import { statusLabelKey } from "@/lib/i18n";
import { useLocale } from "@/context/LocaleContext";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";

export default function AdminDashboard() {
  const { t } = useLocale();
  const [orders, setOrders] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [adminOrders, productsData] = await Promise.all([
          getAdminOrders(),
          api.get("/products").catch(() => null),
        ]);
        if (!mounted) return;
        setOrders(adminOrders);
        setProductCount(productsData?.allProducts?.length ?? 0);
      } catch {
        if (mounted) setOrders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [reloadKey]);

  if (loading) {
    return <Loader label={t("admin.loadingDashboard")} />;
  }

  const stats = normalizeAdminOrderStats(orders);
  const recent = [...orders].sort((a, b) => (a.created_at > b.created_at ? -1 : 1)).slice(0, 6);

  return (
    <div>
      <div className="admin-bar">
        <div>
          <p className="section-label">{t("admin.dashboard")}</p>
          <h1 className="section-title" style={{ fontSize: "1.9rem" }}>{t("admin.overview")}</h1>
        </div>
        <Link href="/admin/orders" className="btn btn--outline btn--dark-text btn--sm">{t("admin.viewAllOrders")}</Link>
      </div>

      <div className="admin-grid">
        <div className="stat-card">
          <div className="k">{t("admin.statPending")}</div>
          <div className="v">{stats.pending}</div>
        </div>
        <div className="stat-card">
          <div className="k">{t("admin.statPaid")}</div>
          <div className="v">{stats.paid}</div>
        </div>
        <div className="stat-card">
          <div className="k">{t("admin.statShipped")}</div>
          <div className="v">{stats.shipped}</div>
        </div>
        <div className="stat-card">
          <div className="k">{t("admin.statDelivered")}</div>
          <div className="v">{stats.delivered}</div>
        </div>
        <div className="stat-card">
          <div className="k">{t("admin.statRevenue")}</div>
          <div className="v" style={{ fontSize: "1.5rem" }}>{formatPrice(stats.totalRevenue)}</div>
        </div>
        <div className="stat-card">
          <div className="k">{t("admin.statProductsLive")}</div>
          <div className="v">{productCount}</div>
        </div>
      </div>

      <h2 className="form-section__title" style={{ marginBottom: "var(--space-6)" }}>
        {t("admin.recentOrders")}
      </h2>

      {recent.length === 0 ? (
        <EmptyState icon="◎" title={t("admin.noneOrders")} body={t("admin.noneOrdersBody")} />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("admin.colOrder")}</th>
                <th>{t("admin.colPlaced")}</th>
                <th>{t("admin.colPrice")}</th>
                <th>{t("admin.colStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontFamily: "var(--display)", fontWeight: 600 }}>#{o.id}</td>
                  <td>{formatDate(o.created_at)}</td>
                  <td>{formatPrice(o.total)}</td>
                  <td>
                    <span className={`badge badge--${statusTone(o.status)}`}>{t(statusLabelKey(o.status))}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}