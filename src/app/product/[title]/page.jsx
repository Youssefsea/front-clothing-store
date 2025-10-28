"use client";
import React, { useEffect, useState, useRef, use } from "react";
import axiosInstance from "../../axios";
import {
  Box,
  Grid,
  Typography,
  Button,
  Chip,
  CircularProgress,
  ButtonGroup,
  Alert,
  Card,
  CardMedia,
  CardContent,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import Link from "next/link";

export default function ProductPage({ params }) {
  const resolvedParams = use(params);
  const productTitle = decodeURIComponent(resolvedParams.title);

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectColor, setSelectColor] = useState("");
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, visible: false });
  const [msg, setMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true);
        const res = await axiosInstance.post("/products/byName", { title: productTitle });
        if (res.data.product?.length) {
          const p = res.data.product[0];
          setProduct(p);
          const relatedRes = await axiosInstance.post("/products/byCategory", {
            category_name: p.category_name,
          });
          const relatedFiltered = relatedRes.data.products
            .filter((r) => r.id !== p.id)
            .slice(0, 4);
          setRelated(relatedFiltered);
        }
      } catch {}
      finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productTitle]);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress color="secondary" />
      </Box>
    );

  if (!product)
    return (
      <Typography align="center" sx={{ py: 10, color: "error.main", fontSize: 24 }}>
        Product not found 😢
      </Typography>
    );

  const discountedPrice = product.discount
    ? (product.price * (100 - product.discount)) / 100
    : null;
  const availableSizes = product.sizes ? product.sizes.split(",") : [];
  const availableColors = product.colors ? product.colors.split(",") : [];

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y, visible: true });
  };

  const handleMouseLeave = () => setZoomPos({ ...zoomPos, visible: false });

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) {
      setQuantity(1);
      return;
    }
    if (newQuantity > product.stock) {
      setMsg(`Only ${product.stock} items available in stock`);
      return;
    }
    setMsg("");
    setQuantity(newQuantity);
  };


function ProductImage({ image_url, title }) {
  const images = image_url ? image_url.split(",").map((img) => img.trim()) : [];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return; // لو فيه صورة واحدة بس، ما يعملش تبديل

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000); // ← التبديل كل 3 ثواني

    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <Box
        sx={{
          height: { xs: 160, md: 200 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 1,
          backgroundColor: "#f5f5f5",
        }}
      >
        <span>لا توجد صورة</span>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: { xs: 160, md: 200 },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mb: 1,
        position: "relative",
      }}
    >
      <Box
        component="img"
        src={images[currentIndex]}
        alt={`${title} image`}
        sx={{
          maxHeight: "100%",
          width: "auto",
          objectFit: "contain",
          transition: "opacity 0.5s ease-in-out",
        }}
      />
    </Box>
  );
}

  async function addToCart() {
    if (!selectedSize || !selectColor) {
      setMsg("Please select size and color");
      return;
    }
    if (quantity > product.stock) return;
    try {
      await axiosInstance.post("/cart/add", {
        product_id: product.id,
        quantity: quantity,
        size: selectedSize,
        color: selectColor,
      });
      setShowSuccess(true);
      setMsg("");
      setSelectedSize("");
      setSelectColor("");
      setQuantity(1);
      setTimeout(() => setShowSuccess(false), 2000);

      // update navbar cart and animate badge
      window.dispatchEvent(new Event("cartUpdated"));
      const cartIcon = document.querySelector(".cart-icon");
      if (cartIcon) {
        cartIcon.classList.add("cart-bounce");
        setTimeout(() => cartIcon.classList.remove("cart-bounce"), 800);
      }
      const cartBadge = document.querySelector(".cart-badge");
      if (cartBadge) {
        cartBadge.classList.add("cart-badge-pulse");
        setTimeout(() => cartBadge.classList.remove("cart-badge-pulse"), 800);
      }
    } catch(err) {
      console.log(err);
      window.location.href = "/login";
    }
  }

  return (
    <Box style ={{ paddingBottom: 40, paddingTop: 20,paddingLeft:20, paddingRight:20}}>
      <div className="container pd-breadcrumbs">
        <div className="pd-page-title">Product Details</div>
        <div className="pd-breadcrumbs-trail">
          <Link href="/">Home</Link>
          <span> / </span>
          <Link href="/">Shop</Link>
          <span> / </span>
          <span>{product.category_name || "Category"}</span>
          <span> / </span>
          <span className="current">Product Details</span>
        </div>
      </div>
      <div className="pd-wrapper container">
        <div className="pd-gallery">
         <div className="pd-main-image">
  <ProductImage image_url={product.image_url} title={product.title} />
</div>

        </div>

        <div className="pd-info">
          <h1 className="pd-title">{product.title}</h1>

          <div className="pd-price-row">
            {discountedPrice ? (
              <>
                <span className="pd-price">${discountedPrice.toFixed(2)}</span>
                <span className="pd-price-old">${product.price}</span>
              </>
            ) : (
              <span className="pd-price">${product.price}</span>
            )}
          </div>

          <p className="pd-desc">{product.description}</p>

          {availableColors.length > 0 && (
            <div className="pd-option">
              <span className="pd-option-label">Color</span>
              <div className="pd-color-swatches">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    aria-label={`color ${color}`}
                    className={`pd-swatch ${selectColor === color ? "active" : ""}`}
                    style={{ backgroundColor: color.toLowerCase() }}
                    onClick={() => setSelectColor(color)}
                  />
                ))}
              </div>
            </div>
          )}

          {availableSizes.length > 0 && (
            <div className="pd-option">
              <span className="pd-option-label">Size</span>
              <div className="pd-size-options">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    className={`pd-size ${selectedSize === size ? "active" : ""}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pd-qty-row">
            <span className="pd-option-label">Qty</span>
            <div className="pd-qty">
              <button onClick={() => handleQuantityChange(quantity - 1)}>-</button>
              <span className={`value ${quantity > product.stock ? "error" : ""}`}>{quantity}</span>
              <button onClick={() => handleQuantityChange(quantity + 1)}>+</button>
            </div>
            {product.stock <= 3 && product.stock > 0 && (
              <span className="pd-low-stock">Only {product.stock} left</span>
            )}
          </div>

          {msg && <div className="pd-msg-error">{msg}</div>}

          <div className="pd-actions">
            <button
              className="btn-primary"
              onClick={addToCart}
              disabled={!selectedSize || !selectColor || quantity > product.stock}
            >
              <span className="btn-icon" aria-hidden>🛒</span> Add To Cart
            </button>
          
          </div>

          {showSuccess && (
            <Alert severity="success" sx={{ mt: 2, width: "fit-content" }}>
              Product added to cart successfully!
            </Alert>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div className="container pd-related">
          <h2 className="pd-related-title">Explore Related Products</h2>
          <div className="pd-related-grid">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/product/${encodeURIComponent(item.title)}`}
                className="pd-related-card"
              >
                <img src={item.image_url} alt={item.title} />
                <div className="info">
                  <div className="title" title={item.title}>{item.title}</div>
                  <div className="price">${item.price}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="container pd-tabs">
        <div className="pd-tab-list">
          <button className="pd-tab-btn active">Description</button>
        </div>
        <div className="pd-tab-panel">
          {product.description && (
            <p className="pd-desc" style={{ marginBottom: 12 }}>{product.description}</p>
          )}
          <ul className="pd-bullets">
            {availableColors.length > 0 && (
              <li>Available colors: {availableColors.join(", ")}</li>
            )}
            {availableSizes.length > 0 && (
              <li>Available sizes: {availableSizes.join(", ")}</li>
            )}
            <li>Category: {product.category_name || "-"}</li>
            <li>SKU: {product.id}</li>
            <li>Stock: {product.stock}</li>
          </ul>
        </div>
      </div>
    </Box>
  );
}
