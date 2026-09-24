"use client";

import React from "react";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import Reveal from "@/components/Reveal";

export default function UnauthorizedPage() {
  return (
    <div className="nav-spacer">
      <div className="container" style={{ padding: "48px 24px 90px" }}>
        <Reveal>
          <EmptyState
            icon="!"
            title="Access denied"
            body="You don't have permission to view this area. If you think this is a mistake, sign in with an authorized account or head back home."
            action={
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                <Link href="/login" className="btn btn--primary btn--sm">Sign in</Link>
                <Link href="/" className="btn btn--outline btn--dark-text btn--sm">Go home</Link>
              </div>
            }
          />
        </Reveal>
      </div>
    </div>
  );
}