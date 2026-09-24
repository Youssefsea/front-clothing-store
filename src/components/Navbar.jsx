"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useUi } from "@/context/UiContext";
import { initials } from "@/lib/format";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, loading: authLoading, logout } = useAuth();
  const { count } = useCart();
  const { openCart, openSearch, notify } = useUi();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const transparent = pathname === "/" && !scrolled;

  const links = [
    { href: "/shop", label: "Shop" },
    ...(isAuthenticated ? [{ href: "/orders", label: "Orders" }] : []),
  ];

  const handleLogout = async () => {
    await logout();
    notify("Signed out");
    router.push("/");
  };

  return (
    <>
      <header className={`navbar ${transparent ? "navbar--transparent" : "navbar--solid"}`}>
        <div className="navbar__inner">
          <Link href="/" className="navbar__brand" aria-label="VANTA home">
            VANTA
          </Link>

          <nav className="navbar__links" aria-label="Primary">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link ${
                  pathname === l.href || pathname.startsWith(l.href + "/") ? "active" : ""
                }`}
              >
                {l.label}
              </Link>
            ))}
            <button className="nav-link nav-link--btn" onClick={openSearch}>
              Search
            </button>
          </nav>

          <div className="navbar__actions">
            <button className="icon-btn navbar__search" onClick={openSearch} aria-label="Search">
              ⌕
            </button>

            <button className="navbar__cart" onClick={openCart} aria-label={`Open bag, ${count} items`}>
              <span className="navbar__cart-icon">◎</span>
              <span className={`navbar__cart-count ${count > 0 ? "cart-badge-pulse" : ""}`}>
                {count}
              </span>
            </button>

            {authLoading ? null : isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="nav-link">
                    Admin
                  </Link>
                )}
                <Link
                  href="/account"
                  className="navbar__avatar"
                  aria-label="Account"
                  title={user?.name || user?.email || "Account"}
                >
                  {initials(user?.name || user?.email)}
                </Link>
              </>
            ) : (
              <Link href="/login" className="btn btn--outline btn--dark-text btn--sm navbar__signin">
                Sign in
              </Link>
            )}

            <button
              className="icon-btn navbar__burger"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>

      <div className={`nav-menu ${mobileOpen ? "open" : ""}`} role="dialog" aria-modal="true">
        <div className="nav-menu__links">
          <Link href="/" className="nav-menu__link">Home</Link>
          <Link href="/shop" className="nav-menu__link">Shop</Link>
          <button
            className="nav-menu__link nav-menu__link--btn"
            onClick={() => { setMobileOpen(false); openSearch(); }}
          >
            Search
          </button>
          {isAuthenticated && (
            <Link href="/orders" className="nav-menu__link">My Orders</Link>
          )}
          {isAuthenticated && (
            <Link href="/account" className="nav-menu__link">Account</Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="nav-menu__link">Admin</Link>
          )}
        </div>
        <div className="nav-menu__foot">
          {isAuthenticated ? (
            <>
              <span className="nav-menu__user">{user?.name || user?.email}</span>
              <button className="btn btn--outline btn--dark-text btn--block" onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn--primary btn--block" onClick={() => setMobileOpen(false)}>
                Sign in
              </Link>
              <Link href="/signup" className="btn btn--outline btn--dark-text btn--block" onClick={() => setMobileOpen(false)}>
                Create account
              </Link>
            </>
          )}
          <button
            className="btn btn--accent btn--block"
            onClick={() => { setMobileOpen(false); openCart(); }}
          >
            Bag ({count})
          </button>
        </div>
      </div>
    </>
  );
}