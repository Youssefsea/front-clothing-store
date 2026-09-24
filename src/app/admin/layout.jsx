"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import Loader from "@/components/Loader";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const { t } = useLocale();

  const NAV = [
    { href: "/admin", label: t("admin.dashboard") },
    { href: "/admin/orders", label: t("admin.orders") },
    { href: "/admin/users", label: t("admin.users") },
    { href: "/admin/products", label: t("admin.products") },
  ];

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/admin")}`);
    } else if (!isAdmin) {
      router.replace("/unauthorized");
    }
  }, [loading, isAuthenticated, isAdmin, pathname, router]);

  if (loading) {
    return <div className="nav-spacer"><Loader label={t("admin.checking")} /></div>;
  }

  if (!isAuthenticated || !isAdmin) {
    return <div className="nav-spacer"><Loader label={t("admin.redirecting")} /></div>;
  }

  return (
    <div className="nav-spacer">
      <div className="admin-shell">
        <aside className="admin-side">
          <div className="admin-side__brand">VANTA <span>{t("nav.admin")}</span></div>
          <nav className="admin-side__nav" aria-label={t("nav.admin")}>
            {NAV.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`admin-side__link ${active ? "active" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="admin-side__foot">
            <Link href="/" className="admin-side__link">← {t("admin.back")}</Link>
          </div>
        </aside>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}