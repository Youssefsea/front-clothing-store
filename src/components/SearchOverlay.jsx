"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useUi } from "@/context/UiContext";
import { fetchProductByTitle } from "@/lib/api/products";
import { formatPrice } from "@/lib/format";
import { ApiError } from "@/lib/api/client";

export default function SearchOverlay() {
  const { searchOpen, closeSearch } = useUi();
  const inputRef = useRef(null);
  const [value, setValue] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (searchOpen) {
      setValue("");
      setResults([]);
      setSearched(false);
      setMessage("");
      setTimeout(() => inputRef.current?.focus(), 120);
      const onKey = (e) => {
        if (e.key === "Escape") closeSearch();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
  }, [searchOpen, closeSearch]);

  const runSearch = async (e) => {
    e?.preventDefault();
    const term = value.trim();
    if (!term) {
      setResults([]);
      return;
    }
    setLoading(true);
    setSearched(true);
    setMessage("");
    try {
      const found = await fetchProductByTitle(term);
      setResults(found);
      if (found.length === 0) setMessage("No matches for that search.");
    } catch (err) {
      setResults([]);
      if (err instanceof ApiError) {
        setMessage(err.status === 404 ? "No matches for that search." : err.message);
      } else {
        setMessage("Search is unavailable right now.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`search-overlay ${searchOpen ? "open" : ""}`}
      onClick={closeSearch}
      role="dialog"
      aria-modal="true"
      aria-label="Search products"
    >
      <div
        className="search-overlay__panel"
        onClick={(e) => e.stopPropagation()}
        role="presentation"
      >
        <form className="search-overlay__input" onSubmit={runSearch}>
          <span style={{ color: "var(--muted)" }}>⌕</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search the collection…"
            aria-label="Search products by name"
          />
          {loading ? (
            <span className="spin" style={{ display: "inline-block", borderRight: "2px solid var(--muted)", width: 14, height: 14, borderRadius: "50%" }} />
          ) : (
            <span className="kbd">↵</span>
          )}
          <button className="icon-btn" onClick={closeSearch} aria-label="Close search">
            ✕
          </button>
        </form>

        <div className="search-overlay__hint">
          <span>Search by product name</span>
          <span style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
            <span className="kbd">esc</span> to close
          </span>
        </div>

        <div className="search-overlay__results">
          {searched && message && (
            <div className="empty-state" style={{ padding: "40px 20px" }}>
              <p>{message}</p>
            </div>
          )}
          {results.map((p) => (
            <Link key={p.id} href={`/product/${encodeURIComponent(p.title)}`} className="search-item" onClick={closeSearch}>
              <img src={p.image_url.split(",")[0]} alt={p.title} />
              <div style={{ minWidth: 0 }}>
                <div className="search-item__title">{p.title}</div>
                <div className="search-item__cat">{p.category_name}</div>
              </div>
              <div className="search-item__price">{formatPrice(p.finalPrice)}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}