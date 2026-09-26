"use client";

import React from "react";
import Link from "next/link";

export default function GlobalErrorPage({ reset }) {
  const isAr =
    typeof document !== "undefined" && document.documentElement.lang === "ar";
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
          !
        </div>
        <h1>{isAr ? "حدث خطأ غير متوقع" : "Something went wrong"}</h1>
        <p>{isAr ? "يرجى المحاولة مرة أخرى أو العودة إلى المتجر." : "Please try again, or head back to the store."}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn btn--primary btn--sm" onClick={() => reset()}>
            {isAr ? "إعادة المحاولة" : "Try again"}
          </button>
          <Link href="/" className="btn btn--outline btn--dark-text btn--sm">
            {isAr ? "الرئيسية" : "Home"}
          </Link>
        </div>
      </div>
    </div>
  );
}