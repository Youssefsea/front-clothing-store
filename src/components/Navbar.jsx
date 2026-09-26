"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useUi } from "@/context/UiContext";
import { useLocale, LANGS } from "@/context/LocaleContext";
import { useTheme } from "@/context/ThemeContext";
import { initials } from "@/lib/format";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, loading: authLoading, logout } = useAuth();
  const { count } = useCart();
  const { openCart, openSearch, notify } = useUi();
  const { lang, t, toggleLang } = useLocale();
  const { isDark, toggle: toggleTheme } = useTheme();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const onScroll = () => setScrolled(window.scrollY > 28);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    } catch {}
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    try {
      document.body.style.overflow = mobileOpen ? "hidden" : "";
      return () => {
        document.body.style.overflow = "";
      };
    } catch {}
  }, [mobileOpen]);

  const transparent = pathname === "/" && !scrolled;

  const links = [
    { href: "/shop", label: t("nav.shop") },
    ...(isAuthenticated ? [{ href: "/orders", label: t("nav.orders") }] : []),
  ];

  const handleLogout = async () => {
    await logout();
    notify(t("nav.signout"));
    router.push("/");
  };

  const nextLang = lang === "en" ? "ar" : "en";

  return (
    <>
      <header className={`navbar ${transparent ? "navbar--transparent" : "navbar--solid"}`}>
        <div className="navbar__inner">
          <Link href="/" className="navbar__brand" aria-label="VANTA home">
            VANTA
          </Link>

          <nav className="navbar__links" aria-label={t("nav.shop")}>
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
            <button type="button" className="nav-link nav-link--btn" onClick={openSearch}>
              {t("nav.search")}
            </button>
          </nav>

          <div className="navbar__actions">
            <button
              type="button"
              className={`navbar__theme ${isDark ? "is-dark" : "is-light"}`}
              onClick={toggleTheme}
              aria-label={isDark ? t("common.light") : t("common.dark")}
              title={isDark ? t("common.light") : t("common.dark")}
            >
              <span className="navbar__theme-icon" aria-hidden="true">
                {isDark ? "☀" : "☾"}
              </span>
            </button>

            <button
              type="button"
              className="navbar__lang"
              onClick={toggleLang}
              aria-label={LANGS[nextLang].label}
              title={LANGS[nextLang].label}
            >
              {LANGS[nextLang].short}
            </button>

            <button type="button" className="icon-btn navbar__search" onClick={openSearch} aria-label={t("nav.search")}>
              ⌕
            </button>

            <button type="button" className="navbar__cart" onClick={openCart} aria-label={t("nav.openBag", { count })}>
              <span className="navbar__cart-icon" aria-hidden="true">◎</span>
              <span className={`navbar__cart-count ${count > 0 ? "cart-badge-pulse" : ""}`}>
                {count}
              </span>
            </button>

            {authLoading ? null : isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="nav-link navbar__admin">
                    {t("nav.admin")}
                  </Link>
                )}
                <Link
                  href="/account"
                  className="navbar__avatar"
                  aria-label={t("nav.account")}
                  title={user?.name || user?.email || t("nav.account")}
                >
                  {initials(user?.name || user?.email)}
                </Link>
              </>
            ) : (
              <Link href="/login" className="btn btn--outline btn--dark-text btn--sm navbar__signin">
                {t("nav.signin")}
              </Link>
            )}

            <button
              type="button"
              className="icon-btn navbar__burger"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? t("common.closeMenu") : t("common.openMenu")}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>

      <div className={`nav-menu ${mobileOpen ? "open" : ""}`} role="dialog" aria-modal="true" aria-hidden={!mobileOpen} inert={!mobileOpen ? "" : undefined}>
        <div className="nav-menu__links">
          <Link href="/" className="nav-menu__link">{t("nav.home")}</Link>
          <Link href="/shop" className="nav-menu__link">{t("nav.shop")}</Link>
          <button
            type="button"
            className="nav-menu__link nav-menu__link--btn"
            onClick={() => { setMobileOpen(false); openSearch(); }}
          >
            {t("nav.search")}
          </button>
          {isAuthenticated && (
            <Link href="/orders" className="nav-menu__link">{t("nav.myOrders")}</Link>
          )}
          {isAuthenticated && (
            <Link href="/account" className="nav-menu__link">{t("nav.account")}</Link>
          )}
          {isAdmin && (
            <Link href="/admin" className="nav-menu__link">{t("nav.admin")}</Link>
          )}
        </div>
        <div className="nav-menu__foot">
          <div className="nav-menu__toggles">
            <button type="button" className="btn btn--outline btn--dark-text btn--block" onClick={toggleLang}>
              {LANGS[nextLang].short} — {LANGS[nextLang].label}
            </button>
            <button type="button" className="btn btn--outline btn--dark-text btn--block" onClick={toggleTheme}>
              {isDark ? "☀ " : "☾ "}
              {isDark ? t("theme.light") : t("theme.dark")}
            </button>
          </div>
          {isAuthenticated ? (
            <>
              <span className="nav-menu__user">{user?.name || user?.email}</span>
              <button type="button" className="btn btn--outline btn--dark-text btn--block" onClick={handleLogout}>
                {t("nav.signout")}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn--primary btn--block" onClick={() => setMobileOpen(false)}>
                {t("nav.signin")}
              </Link>
              <Link href="/signup" className="btn btn--outline btn--dark-text btn--block" onClick={() => setMobileOpen(false)}>
                {t("nav.createAccount")}
              </Link>
            </>
          )}
          <button
            type="button"
            className="btn btn--accent btn--block"
            onClick={() => { setMobileOpen(false); openCart(); }}
          >
            {t("nav.bag")} ({count})
          </button>
        </div>
      </div>
    </>
  );
}
