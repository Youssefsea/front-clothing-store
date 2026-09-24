"use client";

import React from "react";
import { useUi } from "@/context/UiContext";

export default function Toast() {
  const { globalMsg } = useUi();
  return (
    <div className={`toast ${globalMsg ? "show" : ""}`} role="status" aria-live="polite">
      {globalMsg ? <span className="dot" style={{ color: "var(--accent)", fontSize: "16px" }}>●</span> : null}
      {globalMsg}
    </div>
  );
}