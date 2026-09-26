"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Scroll-reveal wrapper. Above-the-fold content should pass `eager`
 * so it never starts invisible (which previously caused blank-looking
 * auth / PDP panels when IntersectionObserver delayed or never fired).
 */
export default function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
  style,
  eager = false,
  ...rest
}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(eager);

  useEffect(() => {
    if (eager) return;
    const el = ref.current;
    if (!el) return;

    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "40px 0px 0px 0px" }
    );
    obs.observe(el);

    // Safety: if already in viewport on mount, reveal immediately.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setInView(true);
      obs.unobserve(el);
    }

    return () => obs.disconnect();
  }, [eager]);

  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? "in" : ""} ${className}`}
      style={{ ...style, transitionDelay: inView ? `${delay}ms` : undefined }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
