"use client";
import React, { useEffect, useState, useRef } from "react";
import axiosInstance from "../../axios";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Modal,
  IconButton,
  Stack,
  Chip,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Link from "next/link";

export default function ProductPage({ params }: { params: { title: string } }) {
  // Next.js passes params directly; decode title:
  const productTitle = decodeURIComponent(params.title || "");

  const [product, setProduct] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectColor, setSelectColor] = useState("");
  const [msg, setMsg] = useState("");
  const imgRef = useRef<HTMLDivElement | null>(null);

  // Lightbox / Gallery states
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);
  const [lbAutoplay, setLbAutoplay] = useState(true);
  const [lbHover, setLbHover] = useState(false); // pause autoplay when hovering
  const [zoom, setZoom] = useState({ x: 50, y: 50, visible: false }); // for magnifier inside lightbox

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
          const relatedFiltered = (relatedRes.data.products || [])
            .filter((r: any) => r.id !== p.id)
            .slice(0, 4);
          setRelated(relatedFiltered);
        }
      } catch (err) {
        console.error(err);
      } finally {
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
  const availableSizes = product.sizes ? product.sizes.split(",").map((s: string) => s.trim()) : [];
  const availableColors = product.colors ? product.colors.split(",").map((c: string) => c.trim()) : [];

  const handleQuantityChange = (newQuantity: number) => {
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
      // success UI
      setMsg("");
      setSelectedSize("");
      setSelectColor("");
      setQuantity(1);
      // temporary success banner
      setTimeout(() => setMsg("Product added to cart successfully!"), 50);
      setTimeout(() => setMsg(""), 2000);

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
    } catch (err) {
      console.error(err);
      window.location.href = "/login";
    }
  }

  // Helper to get images array
  const images: string[] = (product.image_url || "")
    .split(",")
    .map((i: string) => i.trim())
    .filter(Boolean);

  //
  // ProductImage component: small card/main image, clickable to open lightbox.
  //
  function ProductImage({
    image_url,
    title,
    onOpen,
  }: {
    image_url?: string;
    title?: string;
    onOpen?: (index: number) => void;
  }) {
    const imgs = (image_url || "").split(",").map((s) => s.trim()).filter(Boolean);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      if (imgs.length <= 1) return;
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % imgs.length);
      }, 3000);
      return () => clearInterval(interval);
    }, [imgs.length]);

    const src = imgs[currentIndex] || "/placeholder.png";

    return (
      <Box
        ref={imgRef}
        onClick={() => onOpen && onOpen(currentIndex)}
        sx={{
          height: { xs: 220, md: 360 },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 1,
          position: "relative",
          cursor: onOpen ? "zoom-in" : "default",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: 3,
        }}
      >
        <Box
          component="img"
          src={src}
          alt={`${title} image`}
          sx={{
            maxHeight: "100%",
            width: "auto",
            objectFit: "contain",
            transition: "transform 0.4s ease, opacity 0.4s ease",
            "&:hover": { transform: onOpen ? "scale(1.03)" : "none" },
          }}
        />
      </Box>
    );
  }

  //
  // Lightbox - modal with large image, arrows, thumbnails, autoplay while open,
  // magnifier (simple background zoom) when hovering inside modal image area.
  //
  function Lightbox({
    open,
    onClose,
    startIndex = 0,
  }: {
    open: boolean;
    onClose: () => void;
    startIndex?: number;
  }) {
    const [index, setIndex] = useState(startIndex);
    const autoplayRef = useRef<number | null>(null);

    useEffect(() => {
      setIndex(startIndex);
    }, [startIndex, open]);

    // autoplay: cycle when open, unless paused by hover or disabled
    useEffect(() => {
      if (!open) return;
      if (!lbAutoplay) return;
      if (images.length <= 1) return;
      if (lbHover) return;

      autoplayRef.current = window.setInterval(() => {
        setIndex((prev) => (prev + 1) % images.length);
      }, 3000);

      return () => {
        if (autoplayRef.current) {
          clearInterval(autoplayRef.current);
          autoplayRef.current = null;
        }
      };
    }, [open, lbAutoplay, lbHover]);

    useEffect(() => {
      function onKey(e: KeyboardEvent) {
        if (!open) return;
        if (e.key === "Escape") onClose();
        if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
        if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + images.length) % images.length);
      }
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    const goPrev = () => setIndex((i) => (i - 1 + images.length) % images.length);
    const goNext = () => setIndex((i) => (i + 1) % images.length);

    // Magnifier: compute background position based on mouse
    const onMouseMove = (e: React.MouseEvent) => {
      const el = e.currentTarget as HTMLDivElement;
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoom({ x, y, visible: true });
    };
    const onMouseLeave = () => setZoom({ ...zoom, visible: false });

    return (
      <Modal
        open={open}
        onClose={onClose}
        closeAfterTransition
        BackdropProps={{ timeout: 300 }}
      >
        <Box
          onMouseEnter={() => setLbHover(true)}
          onMouseLeave={() => setLbHover(false)}
          sx={{
            outline: "none",
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
            bgcolor: "rgba(10,10,10,0.6)",
            zIndex: 1500,
          }}
        >
          <Box
            sx={{
              width: { xs: "95%", md: "80%", lg: "70%" },
              maxWidth: 1200,
              bgcolor: "background.paper",
              borderRadius: 2,
              p: 2,
              boxShadow: 24,
              position: "relative",
            }}
          >
            {/* Close */}
            <IconButton
              onClick={onClose}
              aria-label="close"
              sx={{ position: "absolute", top: 12, right: 12, zIndex: 10 }}
            >
              <CloseIcon />
            </IconButton>

            {/* Left arrow */}
            <IconButton
              onClick={goPrev}
              sx={{
                position: "absolute",
                left: -10,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                bgcolor: "rgba(255,255,255,0.8)",
                "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                display: { xs: "none", md: "flex" },
              }}
            >
              <ArrowBackIosNewIcon />
            </IconButton>

            {/* Right arrow */}
            <IconButton
              onClick={goNext}
              sx={{
                position: "absolute",
                right: -10,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                bgcolor: "rgba(255,255,255,0.8)",
                "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                display: { xs: "none", md: "flex" },
              }}
            >
              <ArrowForwardIosIcon />
            </IconButton>

            {/* Main image area */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
              }}
            >
              <Box sx={{ flex: 1, display: "flex", justifyContent: "center", position: "relative" }}>
                <Box
                  onMouseMove={onMouseMove}
                  onMouseLeave={onMouseLeave}
                  sx={{
                    width: "100%",
                    maxHeight: { xs: 360, md: 600 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    borderRadius: 1,
                    bgcolor: "#fafafa",
                    position: "relative",
                  }}
                >
                  {/* The visible image */}
                  <Box
                    component="img"
                    src={images[index]}
                    alt={`Zoom ${index}`}
                    sx={{
                      maxWidth: "100%",
                      maxHeight: { xs: 320, md: 560 },
                      objectFit: "contain",
                      transition: "opacity 0.3s ease, transform 0.3s ease",
                      cursor: "zoom-out",
                    }}
                    onClick={() => {
                      // clicking image while modal open toggles autoplay/pause for UX
                      setLbAutoplay((s) => !s);
                    }}
                  />

                  {/* Magnifier box */}
                  {zoom.visible && (
                    <Box
                      sx={{
                        position: "absolute",
                        right: 12,
                        top: 12,
                        width: { xs: 120, md: 220 },
                        height: { xs: 120, md: 220 },
                        borderRadius: 1,
                        border: "2px solid rgba(0,0,0,0.08)",
                        overflow: "hidden",
                        boxShadow: 2,
                        backgroundImage: `url(${images[index]})`,
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "200% auto",
                        backgroundPosition: `${zoom.x}% ${zoom.y}%`,
                        display: { xs: "none", md: "block" }, // hide magnifier on small screens
                      }}
                    />
                  )}
                </Box>
              </Box>

              {/* Right column: thumbnails & controls */}
              <Box sx={{ width: { xs: "100%", md: 220 }, mt: { xs: 1, md: 0 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {product.title}
                  </Typography>
                  <Chip
                    label={lbAutoplay ? "Auto" : "Paused"}
                    size="small"
                    onClick={() => setLbAutoplay((s) => !s)}
                    sx={{ cursor: "pointer" }}
                  />
                </Stack>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", maxHeight: 420, overflowY: "auto" }}>
                  {images.map((img, i) => (
                    <Box
                      key={i}
                      onClick={() => setIndex(i)}
                      sx={{
                        width: 66,
                        height: 66,
                        borderRadius: 1,
                        overflow: "hidden",
                        border: i === index ? "2px solid" : "1px solid rgba(0,0,0,0.08)",
                        borderColor: i === index ? "primary.main" : "divider",
                        cursor: "pointer",
                        "& img": { width: "100%", height: "100%", objectFit: "cover" },
                      }}
                    >
                      {/* thumbnail */}
                      <Box component="img" src={img} alt={`thumb-${i}`} />
                    </Box>
                  ))}
                </Box>

                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button fullWidth variant="outlined" onClick={goPrev}>
                    Prev
                  </Button>
                  <Button fullWidth variant="contained" onClick={goNext}>
                    Next
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Box>
        </Box>
      </Modal>
    );
  }

  return (
    <Box style={{ paddingBottom: 40, paddingTop: 20, paddingLeft: 20, paddingRight: 20 }}>
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

      <div className="pd-wrapper container" style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="pd-gallery" style={{ flex: "1 1 420px", minWidth: 300 }}>
          <div className="pd-main-image">
            <ProductImage
              image_url={product.image_url}
              title={product.title}
              onOpen={(idx) => {
                setLbIndex(idx);
                setLightboxOpen(true);
                setLbAutoplay(true);
              }}
            />
          </div>
        </div>

        <div className="pd-info" style={{ flex: "1 1 360px", minWidth: 300 }}>
          <h1 className="pd-title">{product.title}</h1>

          <div className="pd-price-row" style={{ marginBottom: 12 }}>
            {discountedPrice ? (
              <>
                <span className="pd-price" style={{ fontWeight: 700, color: "#b8732a", fontSize: 20 }}>${discountedPrice.toFixed(2)}</span>
                <span className="pd-price-old" style={{ marginLeft: 8, textDecoration: "line-through", color: "#888" }}>${product.price}</span>
              </>
            ) : (
              <span className="pd-price" style={{ fontWeight: 700, color: "#b8732a", fontSize: 20 }}>${product.price}</span>
            )}
          </div>

          <p className="pd-desc">{product.description}</p>

          {availableColors.length > 0 && (
            <div className="pd-option">
              <span className="pd-option-label">Color</span>
              <div className="pd-color-swatches" style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {availableColors.map((color) => (
                  <button
                    key={color}
                    aria-label={`color ${color}`}
                    className={`pd-swatch ${selectColor === color ? "active" : ""}`}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 999,
                      border: selectColor === color ? "3px solid #b8732a" : "2px solid #eee",
                      backgroundColor: color.toLowerCase(),
                      cursor: "pointer",
                    }}
                    onClick={() => setSelectColor(color)}
                  />
                ))}
              </div>
            </div>
          )}

          {availableSizes.length > 0 && (
            <div className="pd-option" style={{ marginTop: 12 }}>
              <span className="pd-option-label">Size</span>
              <div className="pd-size-options" style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    className={`pd-size ${selectedSize === size ? "active" : ""}`}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: selectedSize === size ? "2px solid #b8732a" : "1px solid #ddd",
                      background: selectedSize === size ? "#fff8f3" : "#fff",
                      cursor: "pointer",
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pd-qty-row" style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <span className="pd-option-label">Qty</span>
            <div className="pd-qty" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={() => handleQuantityChange(quantity - 1)} style={{ width: 32, height: 32 }}>-</button>
              <span className={`value ${quantity > product.stock ? "error" : ""}`}>{quantity}</span>
              <button onClick={() => handleQuantityChange(quantity + 1)} style={{ width: 32, height: 32 }}>+</button>
            </div>
            {product.stock <= 3 && product.stock > 0 && (
              <span className="pd-low-stock" style={{ color: "#d32f2f" }}>Only {product.stock} left</span>
            )}
          </div>

          {msg && (
            <div style={{ marginTop: 12 }}>
              <Alert severity={msg.startsWith("Product added") ? "success" : "error"}>{msg}</Alert>
            </div>
          )}

          <div className="pd-actions" style={{ marginTop: 16 }}>
            <button
              className="btn-primary"
              onClick={addToCart}
              disabled={!selectedSize || !selectColor || quantity > product.stock}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "#3e2723",
                color: "#fff",
                padding: "10px 16px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
              }}
            >
              <span className="btn-icon" aria-hidden>
                <ShoppingCartIcon fontSize="small" />
              </span>
              Add To Cart
            </button>

            <Button
              variant="text"
              sx={{ ml: 2, textTransform: "none" }}
              onClick={() => {
                setLbIndex(0);
                setLightboxOpen(true);
              }}
            >
              View Gallery
            </Button>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="container pd-related" style={{ marginTop: 32 }}>
          <h2 className="pd-related-title">Explore Related Products</h2>
          <div className="pd-related-grid" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/product/${encodeURIComponent(item.title)}`}
                className="pd-related-card"
                style={{
                  width: 180,
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "#fff",
                  boxShadow: "0 6px 18px rgba(30,30,30,0.06)",
                }}
              >
                <ProductImage image_url={item.image_url} title={item.title} />
                <div style={{ padding: 8 }}>
                  <div className="title" title={item.title} style={{ fontWeight: 700 }}>{item.title}</div>
                  <div className="price" style={{ marginTop: 6, color: "#b8732a", fontWeight: 700 }}>${item.price}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 28 }}>
        <div className="pd-tab-list">
          <button className="pd-tab-btn active">Description</button>
        </div>
        <div className="pd-tab-panel" style={{ marginTop: 12 }}>
          {product.description && <p className="pd-desc" style={{ marginBottom: 12 }}>{product.description}</p>}
          <ul className="pd-bullets">
            {availableColors.length > 0 && <li>Available colors: {availableColors.join(", ")}</li>}
            {availableSizes.length > 0 && <li>Available sizes: {availableSizes.join(", ")}</li>}
            <li>Category: {product.category_name || "-"}</li>
            <li>SKU: {product.id}</li>
            <li>Stock: {product.stock}</li>
          </ul>
        </div>
      </div>

      {/* Lightbox modal */}
      <Lightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        startIndex={lbIndex}
      />
    </Box>
  );
}