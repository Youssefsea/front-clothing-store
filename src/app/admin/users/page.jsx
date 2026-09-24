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
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";

export default function AdminUsers() {
  const { notify } = useUi();
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
      notify(err instanceof ApiError ? err.message : "Could not load users");
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
      notify(err instanceof ApiError ? err.message : "No users match that search.");
    } finally {
      setLoading(false);
    }
  };

  const removeUser = async (u) => {
    if (!u.id) {
      notify("This user can't be removed.");
      return;
    }
    setRemoving(String(u.id));
    try {
      await deleteAdminUser(u.id);
      setUsers((list) => list.filter((x) => String(x.id) !== String(u.id)));
      notify(`${u.name || u.email} removed`);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Could not remove user");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div>
      <div className="admin-bar">
        <div>
          <p className="section-label">Management</p>
          <h1 className="section-title" style={{ fontSize: "1.9rem" }}>Users</h1>
        </div>
      </div>

      <form onSubmit={runSearch} className="admin-search">
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          aria-label="Search mode"
        >
          <option value="email">By email</option>
          <option value="phone">By phone</option>
        </select>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={mode === "email" ? "customer@email.com" : "phone number"}
          aria-label="Search users"
        />
        <button className="btn btn--primary btn--sm" type="submit" disabled={loading}>
          {loading ? "Loading…" : "Search"}
        </button>
        <button className="btn btn--outline btn--dark-text btn--sm" type="button" onClick={loadAll} disabled={loading}>
          All users
        </button>
      </form>

      {loading ? (
        <Loader label="Loading users" />
      ) : users.length === 0 ? (
        <EmptyState icon="◎" title="No users found" body="Try a different search term or load all users." />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
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
                      {u.role || "customer"}
                    </span>
                  </td>
                  <td>{formatDate(u.created_at)}</td>
                  <td>
                    <button
                      className="cart-line__remove"
                      onClick={() => removeUser(u)}
                      disabled={removing === String(u.id)}
                      aria-label={`Remove ${u.name || u.email}`}
                    >
                      {removing === String(u.id) ? "Removing…" : "Remove"}
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