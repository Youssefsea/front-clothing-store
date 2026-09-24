"use client";

import React, { useRef } from "react";

export default function OTPInput({ value, onChange, disabled = false }) {
  const refs = useRef([]);
  const digits = String(value || "").padEnd(6, " ").slice(0, 6).split("");

  const setDigit = (idx, char) => {
    const cleaned = char.replace(/[^0-9]/g, "");
    if (!cleaned) return;
    const next = digits.map((d) => d);
    next[idx] = cleaned;
    onChange(next.join(""));
    if (idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = digits.map((d) => d);
      if (next[idx] !== " ") {
        next[idx] = " ";
        onChange(next.join(""));
      } else if (idx > 0) {
        next[idx - 1] = " ";
        onChange(next.join(" "));
        refs.current[idx - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft" && idx > 0) refs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    onChange(text);
    refs.current[Math.min(text.length, 5)]?.focus();
  };

  return (
    <div className="otp-row" onPaste={handlePaste} role="group" aria-label="6 digit verification code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          className={`otp-cell ${d !== " " ? "filled" : ""}`}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={d === " " ? "" : d}
          disabled={disabled}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}