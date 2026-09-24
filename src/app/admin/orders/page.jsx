"use client";

import React, { useEffect, useState } from "react";
import {
  getAdminOrders,
  getAdminOrdersByUserId,
  getAdminOrdersByEmail,
  updateOrderStatus,
  ORDER_STATUSES,
} from "@/lib/api/admin";
import { formatPrice, formatDate, statusLabel, statusTone } from "@/lib/format";
import { ApiError } from "@/lib/api/client";
import { useUi } from "@/context/UiContext";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";

export default function AdminOrders() {
  const { notify } = useUi();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("all");
  const [updating, setUpdating] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      setOrders(await getAdminOrders());
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Could not load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runSearch = async (e) => {
    e?.preventDefault();
    if (mode === "all") return loadAll();
    const term = query.trim();
    if (!term) return loadAll();
    setLoading(true);
    try {
      let list = [];
      if (mode === "email") list = await getAdminOrdersByEmail(term);
      else if (mode === "userId") list = await getAdminOrdersByUserId(term);
      setOrders(list);
    } catch (err) {
      setOrders([]);
      notify(err instanceof ApiError ? err.message : "No orders match that search.");
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (orderId, status) => {
    setUpdating(String(orderId));
    try {
      await updateOrderStatus(orderId, status);
      setOrders((list) =>
        list.map((o) => (String(o.id) === String(orderId) ? { ...o, status } : o))
      );
      notify(`Order #${orderId} → ${status}`);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Could not update status");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <div className="admin-bar">
        <div>
          <p className="section-label">Management</p>
          <h1 className="section-title" style={{ fontSize: "1.9rem" }}>Orders</h1>
        </div>
      </div>

      <form onSubmit={runSearch} className="admin-search">
        <select
          value={mode}
          onChange={(e) => { setMode(e.target.value); setQuery(""); }}
          aria-label="Search mode"
        >
          <option value="all">All orders</option>
          <option value="email">By email</option>
          <option value="userId">By user id</option>
        </select>
        {mode !== "all" && (
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === "email" ? "customer@email.com" : "e.g. 3"}
            aria-label={mode === "email" ? "Search orders by email" : "Search orders by user id"}
          />
        )}
        <button className="btn btn--primary btn--sm" type="submit" disabled={loading}>
          {loading ? "Loading…" : mode === "all" ? "Refresh" : "Search"}
        </button>
      </form>

      {loading ? (
        <Loader label="Loading orders" />
      ) : orders.length === 0 ? (
        <EmptyState icon="◎" title="No orders found" body="Try a different search or load all orders." />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontFamily: "var(--display)", fontWeight: 600 }}>#{o.id}</td>
                  <td>
                    <div style={{ fontSize: "0.92rem" }}>{o.customer.name || "—"}</div>
                    <div style={{ fontSize: "0.76rem", color: "var(--muted)" }}>{o.customer.email}</div>
                  </td>
                  <td>{formatDate(o.created_at)}</td>
                  <td style={{ fontFamily: "var(--display)", fontWeight: 600 }}>{formatPrice(o.total)}</td>
                  <td>
                    <div style={{ fontSize: "0.8rem" }}>{o.payment_method || "—"}</div>
                    {o.payment_screenshot && (
                      <a
                        href={o.payment_screenshot}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: "0.72rem", color: "var(--info)" }}
                      >
                        View receipt
                      </a>
                    )}
                  </td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => changeStatus(o.id, e.target.value)}
                      disabled={updating === String(o.id)}
                      className={`badge badge--${statusTone(o.status)}`}
                      aria-label={`Status for order ${o.id}`}
                      style={{ border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--display)" }}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s} style={{ backgroundColor: "var(--surface)", color: "var(--ink)" }}>
                          {statusLabel(s)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{updating === String(o.id) && <span className="spin" aria-hidden="true" style={{ display: "inline-block", width: 14, height: 14, border: "2px solid var(--line)", borderTopColor: "var(--ink)", borderRadius: "50%" }} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}