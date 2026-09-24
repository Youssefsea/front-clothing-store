"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/products", label: "Products" },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/admin")}`);
    } else if (!isAdmin) {
      router.replace("/unauthorized");
    }
  }, [loading, isAuthenticated, isAdmin, pathname, router]);

  if (loading) {
    return <div className="nav-spacer"><Loader label="Checking access" /></div>;
  }

  if (!isAuthenticated || !isAdmin) {
    return <div className="nav-spacer"><Loader label="Redirecting" /></div>;
  }

  return (
    <div className="nav-spacer">
      <div className="admin-shell">
        <aside className="admin-side">
          <div className="admin-side__brand">VANTA <span>Admin</span></div>
          <nav className="admin-side__nav" aria-label="Admin">
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
            <Link href="/" className="admin-side__link">← Back to store</Link>
          </div>
        </aside>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}