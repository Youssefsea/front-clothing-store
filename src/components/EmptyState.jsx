import React from "react";

export default function EmptyState({
  icon = "◎",
  title = "Nothing here yet",
  body,
  action,
}) {
  return (
    <div className="empty-state">
      <div className="mark" aria-hidden="true">{icon}</div>
      <h3>{title}</h3>
      {body && <p>{body}</p>}
      {action}
    </div>
  );
}