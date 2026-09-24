"use client";

import React, { useEffect, useState } from "react";
import { fetchProducts, toggleProduct } from "@/lib/api/products";
import { formatPrice } from "@/lib/format";
import { ApiError } from "@/lib/api/client";
import { useUi } from "@/context/UiContext";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import ProductImage from "@/components/ProductImage";
import AdminProductForm from "@/components/admin/AdminProductForm";

export default function AdminProducts() {
  const { notify } = useUi();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { product } | "add" | null
  const [toggling, setToggling] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      setProducts(await fetchProducts());
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Could not load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openNew = () => {
    setModal("add");
  };

  const openEdit = (p) => {
    setModal({ product: p });
  };

  const closeModal = () => {
    setModal(null);
  };

  const onSaved = (info) => {
    setModal(null);
    notify(info.message);
    load();
  };

  const toggle = async (p) => {
    setToggling(String(p.id));
    try {
      await toggleProduct(p.id);
      setProducts((list) =>
        list.map((x) => (x.id === p.id ? { ...x, is_active: !x.is_active } : x))
      );
      notify(`${p.title} is now ${p.is_active !== false ? "hidden" : "live"}`);
    } catch (err) {
      notify(err instanceof ApiError ? err.message : "Could not toggle product");
    } finally {
      setToggling(null);
    }
  };

  const activeCount = products.filter((p) => p.is_active !== false).length;

  return (
    <div>
      <div className="admin-bar">
        <div>
          <p className="section-label">Catalog</p>
          <h1 className="section-title" style={{ fontSize: "1.9rem" }}>Products</h1>
          <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            {products.length} total · {activeCount} live
          </span>
        </div>
        <button className="btn btn--accent btn--sm" onClick={openNew}>+ Add product</button>
      </div>

      {loading ? (
        <Loader label="Loading products" />
      ) : products.length === 0 ? (
        <EmptyState
          icon="◎"
          title="No products yet"
          body="Create your first product to bring life to the store."
          action={<button className="btn btn--primary btn--sm" onClick={openNew}>Add product</button>}
        />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Sizes</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 220 }}>
                      <ProductImage imageUrl={p.image_url} alt={p.title} className="order-line__img" style={{ width: 44, height: 54 }} />
                      <span style={{ fontWeight: 500 }}>{p.title}</span>
                    </div>
                  </td>
                  <td>{p.category_name}</td>
                  <td style={{ fontFamily: "var(--display)", fontWeight: 600 }}>
                    {formatPrice(p.finalPrice)}
                    {p.discount > 0 && (
                      <span className="p-card__badge" style={{ position: "static", marginLeft: 8 }}>-{Math.round(p.discount)}%</span>
                    )}
                  </td>
                  <td>{p.stock}</td>
                  <td>{p.sizes.join(", ") || "—"}</td>
                  <td>
                    <button
                      className={`badge ${p.is_active !== false ? "badge--ok" : "badge--err"}`}
                      onClick={() => toggle(p)}
                      disabled={toggling === String(p.id)}
                      style={{ cursor: "pointer" }}
                      aria-label={`Toggle visibility of ${p.title}`}
                    >
                      {p.is_active !== false ? "Live" : "Hidden"}
                    </button>
                  </td>
                  <td>
                    <button className="cart-line__remove" onClick={() => openEdit(p)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal__panel">
            <div className="modal__head">
              <h3>{modal === "add" ? "Add product" : `Edit — ${modal.product.title}`}</h3>
              <button className="icon-btn" onClick={closeModal} aria-label="Close">✕</button>
            </div>

            <div className="modal__body">
              <AdminProductForm
                key={modal === "add" ? "add" : modal.product.id}
                catalog={products}
                mode={modal === "add" ? "add" : "edit"}
                product={modal === "add" ? null : modal.product}
                onClose={closeModal}
                onSaved={onSaved}
                onError={(msg) => notify(msg)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}