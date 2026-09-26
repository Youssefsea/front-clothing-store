import React from "react";
import Link from "next/link";

export default function NotFoundPage() {
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
        <h1>Page not found</h1>
        <p>The page you were looking for does not exist or has moved.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="btn btn--primary btn--sm">
            Back to home
          </Link>
          <Link href="/shop" className="btn btn--outline btn--dark-text btn--sm">
            Browse the shop
          </Link>
        </div>
      </div>
    </div>
  );
}