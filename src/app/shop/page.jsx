"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import axiosInstance from "../axios";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Slider,
  Checkbox,
  FormControlLabel,
  Divider,
  Stack,
  Drawer,
  Pagination,
  Modal,
  IconButton as MuiIconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartOutlined from "@mui/icons-material/ShoppingCartOutlined";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export default function AllProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchName, setSearchName] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sizeFilters, setSizeFilters] = useState([]);
  const [colorFilters, setColorFilters] = useState([]);
  const [page, setPage] = useState(1);
  const perPage = 12;
  const [sortBy, setSortBy] = useState("default");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [tempMinPrice, setTempMinPrice] = useState("");
  const [tempMaxPrice, setTempMaxPrice] = useState("");

  // Lightbox-related state kept but unused (per request we won't open it on image click)
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);
  const [lbImages, setLbImages] = useState([]);
  const [lbAutoplay, setLbAutoplay] = useState(true);
  const [lbHover, setLbHover] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const touchStartRef = useRef({ x: 0, time: 0 });
  const draggingRef = useRef(false);

  const categories = useMemo(() => ["", "Men", "Women", "Shirt", "Hoodie", "Accessories"], []);
  const availableColors = ["Black", "Grey", "Green", "Red", "Orange", "Blue", "Pink", "White"];
  const availableSizes = ['XS',"S", "M", "L", "XL", "XXL", "XXXL"];

  async function fetchAllProducts() {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/products");
      const all = response.data.allProducts || [];
      setProducts(all);
      const prices = all.map((p) => Number(p.price) || 0);
      setPriceRange([Math.min(...prices, 0), Math.max(...prices, 1000)]);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAllProducts();
  }, []);

  async function fetchFiltered() {
    try {
      setLoading(true);
      let list = [];
      const isDefaultPrice = priceRange[0] === 0 && priceRange[1] === 1000;
      const hasColors = colorFilters.length > 0;

      if (category && isDefaultPrice && !hasColors) {
        const res = await axiosInstance.post("/products/byCategory", { category_name: category });
        list = res.data.products || [];
      } else if (!category && !isDefaultPrice && !hasColors) {
        const res = await axiosInstance.post("/products/inRange", { minPrice: priceRange[0], maxPrice: priceRange[1] });
        list = res.data.products || [];
      } else if (!category && isDefaultPrice && colorFilters.length === 1) {
        const res = await axiosInstance.post("/products/byColor", { color: colorFilters[0] });
        list = res.data.products || [];
      } else if (category) {
        const res = await axiosInstance.post("/products/byCategory", { category_name: category });
        list = res.data.products || [];
      } else {
        const response = await axiosInstance.get("/products");
        list = response.data.allProducts || [];
      }

      setProducts(list);
      const prices = list.map((p) => Number(p.price) || 0);
      if (isDefaultPrice) setPriceRange([Math.min(...prices, 0), Math.max(...prices, 1000)]);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFiltered();
    setPage(1);
  }, [category, priceRange[0], priceRange[1], colorFilters]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchName(searchInput.trim());
    setPage(1);
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    const min = tempMinPrice ? Number(tempMinPrice) : priceRange[0];
    const max = tempMaxPrice ? Number(tempMaxPrice) : priceRange[1];
    setPriceRange([min, max]);
    setPage(1);
  };

  const handleSliderChange = (_, newValue) => {
    setPriceRange(newValue);
    setPage(1);
  };

  const toggleSize = (s) => {
    setSizeFilters((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
    setPage(1);
  };
  const toggleColor = (c) => {
    setColorFilters((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = [...products];
    if (searchName) list = list.filter((p) => (p.title || "").toLowerCase().includes(searchName.toLowerCase()));
    list = list.filter((p) => {
      const price = Number(p.price) || 0;
      return price >= (priceRange[0] ?? 0) && price <= (priceRange[1] ?? 1000000);
    });
    if (sizeFilters.length > 0) {
      list = list.filter((p) => {
        if (!p.sizes) return false;
        const pSizes = p.sizes.split(",").map((s) => s.trim());
        return sizeFilters.some((s) => pSizes.includes(s));
      });
    }
    if (colorFilters.length > 0) {
      list = list.filter((p) => {
        const colors = [];
        if (p.color) colors.push(p.color);
        if (p.colors) p.colors.split(",").map((c) => c.trim()).forEach((c) => colors.push(c));
        return colorFilters.some((c) => colors.some((pc) => pc && pc.toLowerCase() === c.toLowerCase()));
      });
    }
    if (sortBy === "priceAsc") list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    else if (sortBy === "priceDesc") list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    else if (sortBy === "titleAsc") list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    return list;
  }, [products, searchName, priceRange, sizeFilters, colorFilters, sortBy]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const visibleProducts = filtered.slice((page - 1) * perPage, page * perPage);

  // ======================================================
  // ProductImage - now: image always scales to card area and NOT open lightbox on click.
  // Click goes to product page because image is wrapped by Link in card.
  // ======================================================
  function ProductImage({ image_url, title }) {
    const images = (image_url || "").split(",").map((img) => img.trim()).filter(Boolean);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [fade, setFade] = useState(true);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
      if (images.length <= 1) return;
      const interval = setInterval(() => {
        setFade(false);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % images.length);
          setFade(true);
        }, 300);
      }, 3000);
      return () => clearInterval(interval);
    }, [images.length]);

    // Balanced aspect so image area matches card size proportionally
    const aspectPt = { xs: "72%", sm: "68%", md: "62%" };
    const placeholder = "/placeholder.png";
    let imgSrc = images[currentIndex] || placeholder;
    try { imgSrc = encodeURI(imgSrc); } catch (e) {}

    const handleImgError = (ev) => {
      setFailed(true);
      ev.currentTarget.src = placeholder;
      console.error("Image load failed:", imgSrc);
    };

    return (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          pt: aspectPt,
          overflow: "hidden",
          borderRadius: 3,
          bgcolor: "#fafafa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Image fills the available card image area while keeping aspect ratio.
            objectFit: 'cover' will fill the box (may crop) but keep consistent visual size across cards.
            If you prefer no cropping, change to objectFit: 'contain' and maybe set background to a soft color. */}
        <Box
          component="img"
          src={imgSrc}
          alt={`${title} image`}
          onError={handleImgError}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "opacity 0.35s ease, transform 0.35s ease",
            opacity: fade ? 1 : 0,
            "&:hover": { transform: "scale(1.03)" },
          }}
        />
        {failed && (
          <Box sx={{ position: "absolute", color: "text.secondary", fontSize: 12 }}>
            Image unavailable
          </Box>
        )}
      </Box>
    );
  }

  // Lightbox kept but won't be triggered on image click (per request). Implementation unchanged.
  function Lightbox({ open, images, startIndex, onClose }) {
    const [index, setIndex] = useState(startIndex || 0);
    const autoplayRef = useRef(null);

    useEffect(() => {
      setIndex(startIndex || 0);
      setTranslateX(0);
    }, [startIndex, open]);

    useEffect(() => {
      if (!open) return;
      if (!lbAutoplay) return;
      if (!images || images.length <= 1) return;
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
    }, [open, lbAutoplay, lbHover, images]);

    useEffect(() => {
      function onKey(e) {
        if (!open) return;
        if (e.key === "Escape") onClose();
        if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
        if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + images.length) % images.length);
      }
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose, images]);

    const goPrev = () => setIndex((i) => (i - 1 + images.length) % images.length);
    const goNext = () => setIndex((i) => (i + 1) % images.length);

    // touch handlers (kept)
    const onTouchStart = (e) => {
      const t = e.touches && e.touches[0];
      if (!t) return;
      touchStartRef.current = { x: t.clientX, time: Date.now() };
      draggingRef.current = true;
      setTranslateX(0);
      setLbAutoplay(false);
    };

    const onTouchMove = (e) => {
      if (!draggingRef.current) return;
      const t = e.touches && e.touches[0];
      if (!t) return;
      const dx = t.clientX - touchStartRef.current.x;
      setTranslateX(dx);
      if (Math.abs(dx) > 10) e.preventDefault();
    };

    const onTouchEnd = (e) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      const t = (e.changedTouches && e.changedTouches[0]) || {};
      const dx = (t.clientX || 0) - touchStartRef.current.x;
      const dt = Date.now() - touchStartRef.current.time;
      const velocity = dx / Math.max(dt, 1);
      const threshold = 60;
      const velocityThreshold = 0.3;

      if (dx <= -threshold || velocity < -velocityThreshold) {
        setTranslateX(-200);
        setTimeout(() => {
          setTranslateX(0);
          goNext();
        }, 180);
      } else if (dx >= threshold || velocity > velocityThreshold) {
        setTranslateX(200);
        setTimeout(() => {
          setTranslateX(0);
          goPrev();
        }, 180);
      } else {
        setTranslateX(0);
      }

      setTimeout(() => setLbAutoplay(true), 600);
    };

    const onMouseMoveMagnifier = () => setLbHover(true);
    const onMouseLeaveMagnifier = () => setLbHover(false);

    if (!images || images.length === 0) return null;

    return (
      <Modal open={open} onClose={onClose} closeAfterTransition BackdropProps={{ timeout: 300 }}>
        <Box sx={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", p: 2, bgcolor: "rgba(10,10,10,0.6)", zIndex: 1500 }}>
          <Paper sx={{ width: { xs: "96%", md: "80%", lg: "72%" }, maxWidth: 1200, bgcolor: "background.paper", borderRadius: 2, p: 2, position: "relative" }} elevation={24}>
            <MuiIconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8, zIndex: 10 }}><CloseIcon /></MuiIconButton>

            <MuiIconButton onClick={() => { setLbAutoplay(false); goPrev(); }} sx={{ position: "absolute", left: -10, top: "50%", transform: "translateY(-50%)", zIndex: 10, display: { xs: "none", md: "flex" } }}>
              <ArrowBackIosNewIcon />
            </MuiIconButton>

            <MuiIconButton onClick={() => { setLbAutoplay(false); goNext(); }} sx={{ position: "absolute", right: -10, top: "50%", transform: "translateY(-50%)", zIndex: 10, display: { xs: "none", md: "flex" } }}>
              <ArrowForwardIosIcon />
            </MuiIconButton>

            <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" } }}>
              <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <Box onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onMouseMove={onMouseMoveMagnifier} onMouseLeave={onMouseLeaveMagnifier} sx={{ width: "100%", maxHeight: { xs: 360, md: 600 }, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: 1, bgcolor: "#fafafa", position: "relative", touchAction: "pan-y" }}>
                  <Box component="img" src={images[index]} alt={`img-${index}`} sx={{ maxWidth: "100%", maxHeight: { xs: 320, md: 560 }, objectFit: "contain", transition: "transform 0.25s ease, opacity 0.25s ease", transform: `translateX(${translateX}px)`, cursor: "zoom-out" }} onClick={() => setLbAutoplay((s) => !s)} draggable={false} />
                </Box>
              </Box>

              <Box sx={{ width: { xs: "100%", md: 220 }, mt: { xs: 1, md: 0 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{/* title omitted */}</Typography>
                  <Chip label={lbAutoplay ? "Auto" : "Paused"} size="small" onClick={() => setLbAutoplay((s) => !s)} sx={{ cursor: "pointer" }} />
                </Stack>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", maxHeight: 420, overflowY: "auto" }}>
                  {images.map((img, i) => (
                    <Box key={i} onClick={() => setIndex(i)} sx={{ width: 66, height: 66, borderRadius: 1, overflow: "hidden", border: i === index ? "2px solid" : "1px solid rgba(0,0,0,0.08)", borderColor: i === index ? "primary.main" : "divider", cursor: "pointer", "& img": { width: "100%", height: "100%", objectFit: "cover" } }}>
                      <Box component="img" src={img} alt={`thumb-${i}`} draggable={false} />
                    </Box>
                  ))}
                </Box>

                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button fullWidth variant="outlined" onClick={goPrev}>Prev</Button>
                  <Button fullWidth variant="contained" onClick={goNext}>Next</Button>
                </Stack>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Modal>
    );
  }

  // open lightbox from product card (kept but not used on image click)
  const openLightboxFromProduct = (images, idx) => {
    setLbImages(images || []);
    setLbIndex(idx || 0);
    setLightboxOpen(true);
    setLbAutoplay(true);
  };

  // ======================================================
  // Render
  // ======================================================
  return (
    <Box sx={{ display: "flex", gap: 4, flexDirection: { xs: "column", md: "row" }, p: { xs: 2, md: 3 } }}>
      {/* Filters column */}
      <Paper elevation={1} sx={{ width: { xs: "100%", md: 300 }, p: { xs: 2, md: 3 }, position: { xs: "static", md: "sticky" }, top: { md: 24 }, alignSelf: "flex-start", height: "fit-content", display: { xs: "none", md: "block" }, borderRadius: 3, boxShadow: "0 6px 20px rgba(20,20,20,0.04)" }}>
        <Typography variant="h6" fontWeight={800} gutterBottom>Filter Options</Typography>
        <Divider sx={{ mb: 2 }} />
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Category</InputLabel>
          <Select value={category} label="Category" onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
            {categories.map((c, idx) => <MenuItem key={idx} value={c}>{c === "" ? "All Categories" : c}</MenuItem>)}
          </Select>
        </FormControl>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Price</Typography>
          <Slider value={priceRange} onChange={handleSliderChange} valueLabelDisplay="auto" min={0} max={2000} step={1} />
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <TextField size="small" placeholder="Min" value={tempMinPrice} onChange={(e) => setTempMinPrice(e.target.value)} sx={{ width: 1 / 2 }} type="number" />
            <TextField size="small" placeholder="Max" value={tempMaxPrice} onChange={(e) => setTempMaxPrice(e.target.value)} sx={{ width: 1 / 2 }} type="number" />
          </Stack>
          <Button fullWidth variant="outlined" sx={{ mt: 1 }} onClick={handlePriceApply}>Apply</Button>
        </Box>

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Color</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2 }}>
          {availableColors.map((c) => {
            const selected = colorFilters.includes(c);
            return (
              <Box key={c} onClick={() => toggleColor(c)} sx={{ width: 26, height: 26, borderRadius: "50%", border: selected ? "3px solid #b8732a" : "2px solid #eee", cursor: "pointer", backgroundColor: c.toLowerCase(), boxShadow: selected ? "0 2px 8px rgba(184,115,42,0.18)" : "none" }} title={c} />
            );
          })}
        </Box>

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Size</Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {availableSizes.map((s) => (
            <Button key={s} size="small" variant={sizeFilters.includes(s) ? "contained" : "outlined"} onClick={() => toggleSize(s)} sx={{ borderRadius: 1, textTransform: "none" }}>{s}</Button>
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />
        <Button variant="text" color="primary" onClick={() => { setCategory(""); setSearchInput(""); setSearchName(""); setPriceRange([0, 1000]); setSizeFilters([]); setColorFilters([]); setTempMinPrice(""); setTempMaxPrice(""); setPage(1); fetchAllProducts(); }}>Clear All</Button>
      </Paper>

      {/* Main content */}
      <Box sx={{ flex: 1 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" fontWeight={900} sx={{ mb: 0.5 }}>Shop</Typography>
          <Typography variant="body2" color="text.secondary">Home / Shop</Typography>
        </Box>

        <Stack direction={{ xs: "column", md: "row" }} alignItems="center" justifyContent="space-between" sx={{ mb: 3, gap: 2 }}>
          <Box sx={{ display: { xs: "flex", md: "none" }, width: "100%" }}>
            <Button startIcon={<FilterAltIcon />} variant="outlined" onClick={() => setFiltersOpen(true)} sx={{ mr: 2 }}>Filters</Button>
          </Box>

          <form onSubmit={handleSearchSubmit} style={{ width: "100%", maxWidth: 640 }}>
            <Stack direction="row" spacing={1}>
              <TextField fullWidth size="small" placeholder="Search products..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
              <IconButton type="submit" color="primary" sx={{ bgcolor: "secondary.light" }}><SearchIcon /></IconButton>
            </Stack>
          </form>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ width: "100%", justifyContent: { xs: "stretch", md: "flex-end" } }}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: { xs: "center", sm: "left" } }}>
              Showing {filtered.length === 0 ? 0 : (page - 1) * perPage + 1} - {Math.min(page * perPage, filtered.length)} of {filtered.length} results
            </Typography>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Sort</InputLabel>
              <Select label="Sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <MenuItem value="default">Default Sorting</MenuItem>
                <MenuItem value="priceAsc">Price: Low to High</MenuItem>
                <MenuItem value="priceDesc">Price: High to Low</MenuItem>
                <MenuItem value="titleAsc">Name: A → Z</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
          {category && <Chip label={`Category: ${category}`} onDelete={() => { setCategory(""); setPage(1); fetchAllProducts(); }} />}
          {searchName && <Chip label={`Search: ${searchName}`} onDelete={() => { setSearchName(""); setSearchInput(""); setPage(1); }} />}
          {(priceRange?.[0] !== undefined && priceRange?.[1] !== undefined) && <Chip label={`Price: ${priceRange[0]} - ${priceRange[1]}`} onDelete={() => { setPriceRange([0, 1000]); setTempMinPrice(""); setTempMaxPrice(""); setPage(1); }} />}
          {sizeFilters.map((s) => <Chip key={`size-${s}`} label={`Size: ${s}`} onDelete={() => toggleSize(s)} />)}
          {colorFilters.map((c) => <Chip key={`color-${c}`} label={`Color: ${c}`} onDelete={() => toggleColor(c)} />)}
        </Stack>

        {loading ? (
          <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" } }}>
            {Array.from({ length: 6 }).map((_, idx) => (
              <Paper key={idx} sx={{ p: 2, height: { xs: 380, md: 440 }, display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ height: { xs: 240, md: 300 }, bgcolor: "#f2f2f2", borderRadius: 2 }} />
                <Box sx={{ height: 16, bgcolor: "#eaeaea", borderRadius: 1 }} />
                <Box sx={{ height: 14, bgcolor: "#eaeaea", borderRadius: 1, width: "60%", mt: 1 }} />
                <Box sx={{ mt: "auto", height: 40, bgcolor: "#eaeaea", borderRadius: 1 }} />
              </Paper>
            ))}
          </Box>
        ) : (
          <>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {visibleProducts.map((product) => {
                const discountedPrice =
                  product.discount > 0
                    ? (Number(product.price) * (100 - Number(product.discount))) / 100
                    : null;

                return (
                  <Grid item xs={6} sm={6} md={4} key={product.id}>
                    <Paper elevation={3} sx={{ p: { xs: 1.25, md: 1.5 }, borderRadius: 3, display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", position: "relative", overflow: "hidden", minHeight: { xs: 420, md: 480 }, boxShadow: "0 8px 24px rgba(20,20,20,0.06)", transition: "transform 0.18s ease, box-shadow 0.18s ease", "&:hover": { transform: "translateY(-6px)", boxShadow: "0 14px 36px rgba(20,20,20,0.08)" } }}>
                      {product.discount > 0 && (
                        <Chip label={`${product.discount}% off`} color="secondary" size="small" sx={{ position: "absolute", top: 12, left: 12, zIndex: 2, bgcolor: "#f1e1c6", color: "#6b4b2e", fontWeight: 700, borderRadius: 2, px: 1.2 }} />
                      )}

                      <Link href={`/product/${encodeURIComponent(product.title)}`} style={{ textDecoration: "none", color: "inherit" }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flexGrow: 1, px: 0.5 }}>
                          <ProductImage image_url={product.image_url} title={product.title} />

                          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5, fontSize: { xs: "1rem", md: "1.05rem" }, minHeight: 52 }}>
                            {product.title}
                          </Typography>

                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, minHeight: 36 }}>
                            {product.description?.slice(0, 60)}
                          </Typography>

                          {product.discount > 0 ? (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
                              <Typography variant="body2" color="text.secondary" sx={{ textDecoration: "line-through" }}>
                                ${product.price}
                              </Typography>
                              <Typography variant="h6" color="secondary" fontWeight={800} sx={{ fontSize: { xs: "1.05rem", md: "1.35rem" } }}>
                                ${discountedPrice.toFixed(2)}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="h6" color="secondary" fontWeight={800} sx={{ fontSize: { xs: "1.05rem", md: "1.35rem" } }}>
                              ${product.price}
                            </Typography>
                          )}
                        </Box>
                      </Link>

                      <Box sx={{ mt: 1, display: "flex", justifyContent: "center", px: 1 }}>
                        {product.stock > 0 ? (
                          <Button href={`/product/${encodeURIComponent(product.title)}`} variant="contained" startIcon={<ShoppingCartOutlined />} size="medium" sx={{ borderRadius: 2, textTransform: "none", width: "100%", py: 1.05, backgroundColor: "#3e2723", "&:hover": { backgroundColor: "#2f1f1a" } }}>
                            Add to Cart
                          </Button>
                        ) : (
                          <Typography color="error" fontWeight={700}>Out of Stock</Typography>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination count={pages} page={page} onChange={(_, val) => setPage(val)} color="primary" shape="rounded" />
            </Box>
          </>
        )}
      </Box>

      {/* Lightbox Modal (kept but not triggered on image click) */}
      <Lightbox open={lightboxOpen} images={lbImages} startIndex={lbIndex} onClose={() => setLightboxOpen(false)} />
    </Box>
  );
}