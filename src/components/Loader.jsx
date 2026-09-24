import React from "react";

export default function Loader({ label = "" }) {
  return (
    <div
      style={{
        minHeight: "40vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        color: "var(--muted)",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          border: "2px solid var(--line)",
          borderTopColor: "var(--ink)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
        aria-hidden="true"
      />
      {label && (
        <span style={{ fontFamily: "var(--display)", fontSize: "0.78rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
          {label}
        </span>
      )}
    </div>
  );
}