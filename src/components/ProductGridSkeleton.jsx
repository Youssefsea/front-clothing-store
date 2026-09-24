import React from "react";

export default function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="p-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div className="p-card-skel" key={i}>
          <div className="media skeleton" />
          <div className="line skeleton line--w60" />
          <div className="line skeleton" />
        </div>
      ))}
    </div>
  );
}