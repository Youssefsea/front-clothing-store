"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useUi } from "@/context/UiContext";
import { initials } from "@/lib/format";
import Reveal from "@/components/Reveal";
import Loader from "@/components/Loader";

export default function AccountPage() {
  const router = useRouter();
  const { user, isAdmin, isAuthenticated, loading, logout } = useAuth();
  const { notify } = useUi();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login?next=/account");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return <div className="nav-spacer"><Loader label="Loading account" /></div>;
  }

  const handleLogout = async () => {
    await logout();
    notify("Signed out");
    router.push("/");
  };

  return (
    <div className="nav-spacer">
      <div className="container" style={{ padding: "48px 24px 90px" }}>
        <div className="section-head" style={{ marginBottom: 24 }}>
          <div>
            <p className="section-label">You</p>
            <h1 className="section-title">Account</h1>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/orders" className="btn btn--outline btn--dark-text btn--sm">My orders</Link>
            {isAdmin && <Link href="/admin" className="btn btn--primary btn--sm">Admin area</Link>}
          </div>
        </div>

        <nav className="account-nav" aria-label="Account sections">
          <Link href="/account" className="active">Profile</Link>
          <Link href="/orders">Orders</Link>
          <Link href="/cart">Bag</Link>
          <Link href="/shop">Shop</Link>
        </nav>

        <Reveal>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 26 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "var(--ink)",
                color: "var(--bg)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--display)",
                fontWeight: 600,
                fontSize: "1.1rem",
              }}
              aria-hidden="true"
            >
              {initials(user?.name || user?.email)}
            </div>
            <div>
              <div style={{ fontFamily: "var(--display)", fontSize: "1.4rem", fontWeight: 600 }}>
                {user?.name || user?.email}
              </div>
              <div style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                {user?.email}
                {isAdmin && (
                  <span
                    className="badge badge--info"
                    style={{ marginLeft: 10 }}
                  >
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="info-grid">
            <div className="info-cell">
              <div className="k">Name</div>
              <div className="v">{user?.name || "—"}</div>
            </div>
            <div className="info-cell">
              <div className="k">Email</div>
              <div className="v">{user?.email || "—"}</div>
            </div>
            <div className="info-cell">
              <div className="k">Phone</div>
              <div className="v">{user?.phone || "—"}</div>
            </div>
            <div className="info-cell">
              <div className="k">Role</div>
              <div className="v">{isAdmin ? "Administrator" : "Member"}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap" }}>
            <Link href="/orders" className="btn btn--primary">View my orders</Link>
            <button className="btn btn--outline btn--dark-text" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}