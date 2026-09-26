"use client";

import React from "react";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";

export default function NotFoundPage() {
  const { t } = useLocale();

  return (
    <div
      className="container page"
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "60vh",
      }}
    >
      <div className="empty-state" style={{ padding: "80px 24px", textAlign: "center" }}>
        <div className="mark" aria-hidden="true">
          404
        </div>
        <h1>{t("common.notFound")}</h1>
        <p>{t("common.notFoundBody")}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="btn btn--primary btn--sm">
            {t("common.notFoundCta")}
          </Link>
          <Link href="/shop" className="btn btn--outline btn--dark-text btn--sm">
            {t("nav.shop")}
          </Link>
        </div>
      </div>
    </div>
  );
}
