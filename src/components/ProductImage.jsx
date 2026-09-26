"use client";

import React, { useState } from "react";
import { splitImages } from "@/lib/format";

/**
 * Fashion-aware product image. Handles:
 * - comma-separated image lists from the backend
 * - hover crossfade when multiple images exist
 * - broken image fallback
 * - object-fit that preserves photography
 */
export default function ProductImage({
  imageUrl,
  alt = "",
  className = "",
  style,
  hoverCrossfade = true,
  eager = false,
}) {
  const images = splitImages(imageUrl);
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [failedIndexes, setFailedIndexes] = useState(() => new Set());
  const failed = failedIndexes.size >= Math.min(images.length, 2);

  if (images.length === 0 || failed) {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          ...style,
        }}
        role="img"
        aria-label={alt}
      >
        <span
          className="p-card__media--empty"
          style={{ border: "none", background: "none" }}
        >
          {alt ? alt.slice(0, 2).toUpperCase() : "V"}
        </span>
      </div>
    );
  }

  const hoverIdx = (current + 1) % images.length;
  const showIndex = hoverCrossfade && hovered ? hoverIdx : current;

  return (
    <span
      className={className}
      style={{ display: "block", position: "relative", overflow: "hidden", ...style }}
      onMouseEnter={() => images.length > 1 && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {images.slice(0, 2).map((src, idx) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src + idx}
          src={src}
          alt={idx === 0 ? alt : `${alt} alternate`}
          loading={eager ? "eager" : "lazy"}
          onError={() => {
            setFailedIndexes((prev) => {
              const next = new Set(prev);
              next.add(idx);
              return next;
            });
            if (idx === 0 && images.length > 1) setCurrent(1);
          }}
          style={{
            position: idx === 0 ? "relative" : "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: idx === 0 ? (showIndex === 0 ? 1 : 0) : showIndex === 1 ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        />
      ))}
    </span>
  );
}