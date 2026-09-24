"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminOrders, normalizeAdminOrderStats } from "@/lib/api/admin";
import { api } from "@/lib/api/client";
import { formatPrice, formatDate, statusLabel, statusTone } from "@/lib/format";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";

export default function AdminDashboard() {
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
    return <Loader label="Loading dashboard" />;
  }

  const stats = normalizeAdminOrderStats(orders);
  const recent = [...orders].sort((a, b) => (a.created_at > b.created_at ? -1 : 1)).slice(0, 6);

  return (
    <div>
      <div className="admin-bar">
        <div>
          <p className="section-label">Dashboard</p>
          <h1 className="section-title" style={{ fontSize: "1.9rem" }}>Overview</h1>
        </div>
        <Link href="/admin/orders" className="btn btn--outline btn--dark-text btn--sm">View all orders</Link>
      </div>

      <div className="admin-grid">
        <div className="stat-card">
          <div className="k">Pending</div>
          <div className="v">{stats.pending}</div>
        </div>
        <div className="stat-card">
          <div className="k">Paid</div>
          <div className="v">{stats.paid}</div>
        </div>
        <div className="stat-card">
          <div className="k">Shipped</div>
          <div className="v">{stats.shipped}</div>
        </div>
        <div className="stat-card">
          <div className="k">Delivered</div>
          <div className="v">{stats.delivered}</div>
        </div>
        <div className="stat-card">
          <div className="k">Revenue</div>
          <div className="v" style={{ fontSize: "1.5rem" }}>{formatPrice(stats.totalRevenue)}</div>
        </div>
        <div className="stat-card">
          <div className="k">Products live</div>
          <div className="v">{productCount}</div>
        </div>
      </div>

      <h2 className="form-section__title" style={{ marginBottom: "var(--space-6)" }}>
        Recent orders
      </h2>

      {recent.length === 0 ? (
        <EmptyState icon="◎" title="No orders yet" body="Orders placed by customers will appear here." />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Placed</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontFamily: "var(--display)", fontWeight: 600 }}>#{o.id}</td>
                  <td>{formatDate(o.created_at)}</td>
                  <td>{formatPrice(o.total)}</td>
                  <td>
                    <span className={`badge badge--${statusTone(o.status)}`}>{statusLabel(o.status)}</span>
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