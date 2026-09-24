"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";

export default function Footer() {
  const { isAdmin } = useAuth();
  const { t } = useLocale();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div>
          <span className="footer__brand">VANTA</span>
          <p className="footer__about">{t("footer.about")}</p>
        </div>

        <div>
          <h4 className="footer__heading">{t("footer.shopHead")}</h4>
          <div className="footer__links">
            <Link href="/shop">{t("footer.shopAll")}</Link>
            <Link href="/cart">{t("footer.bag")}</Link>
            <Link href="/checkout">{t("footer.checkout")}</Link>
          </div>
        </div>

        <div>
          <h4 className="footer__heading">{t("footer.accountHead")}</h4>
          <div className="footer__links">
            <Link href="/orders">{t("footer.orders")}</Link>
            <Link href="/account">{t("footer.account")}</Link>
            <Link href="/signup">{t("footer.createAccount")}</Link>
            <Link href="/login">{t("footer.signin")}</Link>
          </div>
        </div>

        <div>
          <h4 className="footer__heading">{t("footer.storeHead")}</h4>
          <div className="footer__links">
            {isAdmin && <Link href="/admin">{t("footer.admin")}</Link>}
            <span>Support@vanta.store</span>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <span>© {new Date().getFullYear()} VANTA. {t("footer.rights")}</span>
        <span>{t("footer.tag")}</span>
      </div>
    </footer>
  );
}