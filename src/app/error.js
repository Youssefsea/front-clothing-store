"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function GlobalErrorPage({ error, reset }) {
  const isAr =
    typeof document !== "undefined" && document.documentElement.lang === "ar";

  useEffect(() => {
    // Detailed error logging for debugging
    console.error("=== ERROR BOUNDARY CAUGHT ERROR ===");
    console.error("Error:", error);
    console.error("Error message:", error?.message);
    console.error("Error stack:", error?.stack);
    console.error("Error name:", error?.name);
    console.error("Component stack:", error?.componentStack || "N/A");
    console.error("Error cause:", error?.cause);
    console.error("===================================");
  }, [error]);

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
        {process.env.NODE_ENV === "development" && error && (
          <details style={{ marginTop: 16, textAlign: "left", maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}>
            <summary style={{ cursor: "pointer", color: "var(--muted)" }}>
              {isAr ? "تفاصيل الخطأ (تطوير)" : "Error details (dev)"}
            </summary>
            <pre style={{ marginTop: 12, padding: 12, background: "var(--bg-alt)", borderRadius: 8, overflow: "auto", fontSize: "0.75rem", textAlign: "left", whiteSpace: "pre-wrap" }}>
              {error?.message || "Unknown error"}
              {error?.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
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