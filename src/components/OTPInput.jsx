"use client";

import React, { useRef } from "react";

function toDigits(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 6);
}

export default function OTPInput({ value, onChange, disabled = false }) {
  const refs = useRef([]);
  const raw = toDigits(value);
  const digits = Array.from({ length: 6 }, (_, i) => raw[i] || "");

  const emit = (nextDigits) => {
    onChange(nextDigits.join("").replace(/\D/g, "").slice(0, 6));
  };

  const setDigit = (idx, char) => {
    const cleaned = char.replace(/[^0-9]/g, "");
    if (!cleaned) return;
    const next = [...digits];
    next[idx] = cleaned.slice(-1);
    emit(next);
    if (idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const next = [...digits];
      if (next[idx]) {
        next[idx] = "";
        emit(next);
      } else if (idx > 0) {
        next[idx - 1] = "";
        emit(next);
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
          ref={(el) => {
            refs.current[i] = el;
          }}
          className={`otp-cell ${d ? "filled" : ""}`}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={d}
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
