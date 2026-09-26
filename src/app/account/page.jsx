"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useUi } from "@/context/UiContext";
import { useLocale } from "@/context/LocaleContext";
import { initials } from "@/lib/format";
import Reveal from "@/components/Reveal";
import Loader from "@/components/Loader";

export default function AccountPage() {
  const router = useRouter();
  const { user, isAdmin, isAuthenticated, loading, logout } = useAuth();
  const { notify } = useUi();
  const { t } = useLocale();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login?next=/account");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return <div className="nav-spacer"><Loader label={t("account.loading")} /></div>;
  }
  if (!isAuthenticated || !user) return null;

  const handleLogout = async () => {
    await logout();
    notify(t("account.signedOut"));
    router.push("/");
  };

  return (
    <div className="nav-spacer">
      <div className="container page">
        <div className="page-head">
          <div>
            <p className="section-label">{t("account.you")}</p>
            <h1 className="section-title">{t("account.title")}</h1>
          </div>
          <div className="page-actions">
            <Link href="/orders" className="btn btn--outline btn--dark-text btn--sm">{t("nav.myOrders")}</Link>
            {isAdmin && <Link href="/admin" className="btn btn--primary btn--sm">{t("footer.admin")}</Link>}
          </div>
        </div>

        <nav className="account-nav" aria-label={t("account.profile")}>
          <Link href="/account" className="active">{t("account.profile")}</Link>
          <Link href="/orders">{t("nav.orders")}</Link>
          <Link href="/cart">{t("nav.bag")}</Link>
          <Link href="/shop">{t("nav.shop")}</Link>
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
                    style={{ marginInlineStart: 10 }}
                  >
                    {t("nav.admin")}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="info-grid">
            <div className="info-cell">
              <div className="k">{t("account.name")}</div>
              <div className="v">{user?.name || "—"}</div>
            </div>
            <div className="info-cell">
              <div className="k">{t("auth.email")}</div>
              <div className="v">{user?.email || "—"}</div>
            </div>
            <div className="info-cell">
              <div className="k">{t("account.phone")}</div>
              <div className="v">{user?.phone || "—"}</div>
            </div>
            <div className="info-cell">
              <div className="k">{t("account.role")}</div>
              <div className="v">{isAdmin ? t("account.roleAdmin") : t("account.roleMember")}</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap" }}>
            <Link href="/orders" className="btn btn--primary">{t("account.viewOrders")}</Link>
            <button className="btn btn--outline btn--dark-text" onClick={handleLogout}>
              {t("nav.signout")}
            </button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}