"use client";

import React, { useEffect, useState } from "react";
import {
  getAdminUsers,
  findAdminUserByEmail,
  findAdminUserByPhone,
  deleteAdminUser,
} from "@/lib/api/admin";
import { formatDate } from "@/lib/format";
import { ApiError } from "@/lib/api/client";
import { useUi } from "@/context/UiContext";
import { useLocale } from "@/context/LocaleContext";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";

export default function AdminUsers() {
  const { notify } = useUi();
  const { t } = useLocale();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("email");
  const [removing, setRemoving] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    try {
      setUsers(await getAdminUsers());
    } catch (err) {
      notify(err instanceof ApiError ? err.message : t("admin.loadFailUsers"));
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
    const term = query.trim();
    if (!term) return loadAll();
    setLoading(true);
    try {
      let list = [];
      if (mode === "email") list = await findAdminUserByEmail(term);
      else list = await findAdminUserByPhone(term);
      setUsers(list);
    } catch (err) {
      setUsers([]);
      notify(err instanceof ApiError ? err.message : t("admin.noMatchUsers"));
    } finally {
      setLoading(false);
    }
  };

  const removeUser = async (u) => {
    if (!u.id) {
      notify(t("admin.cannotRemove"));
      return;
    }
    setRemoving(String(u.id));
    try {
      await deleteAdminUser(u.id);
      setUsers((list) => list.filter((x) => String(x.id) !== String(u.id)));
      notify(t("admin.removedUser", { name: u.name || u.email }));
    } catch (err) {
      notify(err instanceof ApiError ? err.message : t("admin.removeFail"));
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div>
      <div className="admin-bar">
        <div>
          <p className="section-label">{t("admin.management")}</p>
          <h1 className="section-title" style={{ fontSize: "1.9rem" }}>{t("admin.users")}</h1>
        </div>
      </div>

      <form onSubmit={runSearch} className="admin-search">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          aria-label={t("admin.searchMode")}
        >
          <option value="email">{t("admin.byEmail")}</option>
          <option value="phone">{t("admin.byPhone")}</option>
        </select>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={mode === "email" ? t("admin.emailPlaceholder") : t("admin.phonePlaceholder")}
          aria-label={t("admin.searchUsers")}
        />
        <button className="btn btn--primary btn--sm" type="submit" disabled={loading}>
          {loading ? t("admin.searching") : t("admin.search")}
        </button>
        <button className="btn btn--outline btn--dark-text btn--sm" type="button" onClick={loadAll} disabled={loading}>
          {t("admin.allUsers")}
        </button>
      </form>

      {loading ? (
        <Loader label={t("admin.loadFailUsers")} />
      ) : users.length === 0 ? (
        <EmptyState icon="◎" title={t("admin.noUsersFound")} body={t("admin.noUsersBody")} />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("admin.colId")}</th>
                <th>{t("admin.colName")}</th>
                <th>{t("admin.colEmail")}</th>
                <th>{t("admin.colPhone")}</th>
                <th>{t("admin.colRole")}</th>
                <th>{t("admin.colJoined")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id ?? u.email}>
                  <td style={{ fontFamily: "var(--display)", fontWeight: 600 }}>{u.id ?? "—"}</td>
                  <td style={{ fontWeight: 500 }}>{u.name || "—"}</td>
                  <td>{u.email || "—"}</td>
                  <td>{u.phone || "—"}</td>
                  <td>
                    <span className={`badge ${u.role === "admin" ? "badge--info" : "badge--muted"}`}>
                      {u.role || t("admin.customerRole")}
                    </span>
                  </td>
                  <td>{formatDate(u.created_at)}</td>
                  <td>
                    <button
                      className="cart-line__remove"
                      onClick={() => removeUser(u)}
                      disabled={removing === String(u.id)}
                      aria-label={t("admin.removeLabel", { name: u.name || u.email })}
                    >
                      {removing === String(u.id) ? t("admin.removing") : t("admin.remove")}
                    </button>
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