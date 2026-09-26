"use client";

import React, { useEffect, useState } from "react";
import {
  getAdminOrders,
  getAdminOrdersByUserId,
  getAdminOrdersByEmail,
  updateOrderStatus,
  ORDER_STATUSES,
} from "@/lib/api/admin";
import { formatPrice, formatDate, statusTone } from "@/lib/format";
import { statusLabelKey } from "@/lib/i18n";
import { ApiError } from "@/lib/api/client";
import { useUi } from "@/context/UiContext";
import { useLocale } from "@/context/LocaleContext";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";

export default function AdminOrders() {
  const { notify } = useUi();
  const { t } = useLocale();
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
      notify(err instanceof ApiError ? err.message : t("admin.loadFailOrders"));
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
      notify(err instanceof ApiError ? err.message : t("admin.noMatchOrders"));
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
      notify(t("admin.statusUpdated", { id: orderId, status }));
    } catch (err) {
      notify(err instanceof ApiError ? err.message : t("admin.updateStatusFail"));
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <div className="admin-bar">
        <div>
          <p className="section-label">{t("admin.management")}</p>
          <h1 className="section-title" style={{ fontSize: "1.9rem" }}>{t("admin.orders")}</h1>
        </div>
      </div>

      <form onSubmit={runSearch} className="admin-search">
        <select
          value={mode}
          onChange={(e) => { setMode(e.target.value); setQuery(""); }}
          aria-label={t("admin.searchMode")}
        >
          <option value="all">{t("admin.allOrders")}</option>
          <option value="email">{t("admin.byEmail")}</option>
          <option value="userId">{t("admin.byUserId")}</option>
        </select>
        {mode !== "all" && (
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mode === "email" ? t("admin.emailPlaceholder") : t("admin.userIdPlaceholder")}
            aria-label={mode === "email" ? t("admin.searchByEmail") : t("admin.searchByUserId")}
          />
        )}
        <button className="btn btn--primary btn--sm" type="submit" disabled={loading}>
          {loading ? t("admin.searching") : mode === "all" ? t("admin.refresh") : t("admin.search")}
        </button>
      </form>

      {loading ? (
        <Loader label={t("admin.loadingOrders")} />
      ) : orders.length === 0 ? (
        <EmptyState icon="◎" title={t("admin.noOrdersFound")} body={t("admin.noOrdersBody")} />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("admin.colOrder")}</th>
                <th>{t("admin.colCustomer")}</th>
                <th>{t("admin.colDate")}</th>
                <th>{t("admin.colPrice")}</th>
                <th>{t("admin.colPayment")}</th>
                <th>{t("admin.colStatus")}</th>
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
                        {t("admin.viewReceipt")}
                      </a>
                    )}
                  </td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => changeStatus(o.id, e.target.value)}
                      disabled={updating === String(o.id)}
                      className={`badge badge--${statusTone(o.status)}`}
                      aria-label={t("admin.statusForOrder", { id: o.id })}
                      style={{ border: "none", background: "transparent", cursor: "pointer", fontFamily: "var(--display)" }}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s} style={{ backgroundColor: "var(--surface)", color: "var(--ink)" }}>
                          {t(statusLabelKey(s))}
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