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
    if (sortBy === "priceAsc") list.sort((a, b) => (Number(a.price-a.discount) || 0) - (Number(b.price-b.discount) || 0));
    else if (sortBy === "priceDesc") list.sort((a, b) => (Number(b.price-b.discount) || 0) - (Number(a.price-a.discount) || 0));
    else if (sortBy === "titleAsc") list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    return list;
  }, [products, searchName, priceRange, sizeFilters, colorFilters, sortBy]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const visibleProducts = filtered.slice((page - 1) * perPage, page * perPage);

  // Product image: make fixed height for consistent cards across desktop and mobile
  function ProductImage({ image_url, title, onOpen, cover = true }) {
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
        onClick={() => {
          if (onOpen) {
            onOpen(images, currentIndex);
          }
        }}
        sx={{
          position: "relative",
          width: "100%",
          height: { xs: 160, sm: 180, md: 200 }, // fixed heights keep desktop tidy
          overflow: "hidden",
          borderRadius: 2,
          bgcolor: failed ? "#f0f0f0" : "#f7f7f7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          component="img"
          src={imgSrc}
          alt={`${title} image`}
          onError={handleImgError}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: cover ? "cover" : "contain",
            transition: "opacity 0.35s ease-in-out, transform 0.35s ease",
            opacity: fade ? 1 : 0,
            "&:hover": { transform: "scale(1.02)" },
          }}
        />
      </Box>
    );
  }

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

    // touch handlers for swipe
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

    const onMouseMoveMagnifier = (e) => {
      setLbHover(true);
    };
    const onMouseLeaveMagnifier = () => setLbHover(false);

    if (!images || images.length === 0) return null;

    return (
      <Modal open={open} onClose={onClose} closeAfterTransition BackdropProps={{ timeout: 300 }}>
        <Box
          sx={{
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
          <Paper
            sx={{
              width: { xs: "96%", md: "80%", lg: "72%" },
              maxWidth: 1200,
              bgcolor: "background.paper",
              borderRadius: 2,
              p: 2,
              position: "relative",
            }}
            elevation={24}
          >
            <MuiIconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8, zIndex: 10 }}>
              <CloseIcon />
            </MuiIconButton>

            <MuiIconButton
              onClick={() => { setLbAutoplay(false); goPrev(); }}
              sx={{ position: "absolute", left: -10, top: "50%", transform: "translateY(-50%)", zIndex: 10, display: { xs: "none", md: "flex" } }}
            >
              <ArrowBackIosNewIcon />
            </MuiIconButton>

            <MuiIconButton
              onClick={() => { setLbAutoplay(false); goNext(); }}
              sx={{ position: "absolute", right: -10, top: "50%", transform: "translateY(-50%)", zIndex: 10, display: { xs: "none", md: "flex" } }}
            >
              <ArrowForwardIosIcon />
            </MuiIconButton>

            <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", md: "row" } }}>
              <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <Box
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                  onMouseMove={onMouseMoveMagnifier}
                  onMouseLeave={onMouseLeaveMagnifier}
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
                    touchAction: "pan-y",
                  }}
                >
                  <Box
                    component="img"
                    src={images[index]}
                    alt={`img-${index}`}
                    sx={{
                      maxWidth: "100%",
                      maxHeight: { xs: 320, md: 560 },
                      objectFit: "contain",
                      transition: "transform 0.25s ease, opacity 0.25s ease",
                      transform: `translateX(${translateX}px)`,
                      cursor: "zoom-out",
                    }}
                    onClick={() => setLbAutoplay((s) => !s)}
                    draggable={false}
                  />
                </Box>
              </Box>

              <Box sx={{ width: { xs: "100%", md: 220 }, mt: { xs: 1, md: 0 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{/* title omitted to keep compact */}</Typography>
                  <Chip label={lbAutoplay ? "Auto" : "Paused"} size="small" onClick={() => setLbAutoplay((s) => !s)} sx={{ cursor: "pointer" }} />
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

  
  const openLightboxFromProduct = (images, idx) => {
    setLbImages(images || []);
    setLbIndex(idx || 0);
    setLightboxOpen(true);
    setLbAutoplay(true);
  };

  return (
    <Box sx={{ display: "flex", gap: 4, flexDirection: { xs: "column", md: "row" } }}>
      <Paper
        elevation={1}
        sx={{
          width: { xs: "100%", md: 260 },
          p: { xs: 2, md: 3 },
          position: { xs: "static", md: "sticky" },
          top: { md: 24 },
          alignSelf: "flex-start",
          height: "fit-content",
          display: { xs: "none", md: "block" },
        }}
      >
        <Typography variant="h6" fontWeight={700} gutterBottom>Filter Options</Typography>
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
            return <Box key={c} onClick={() => toggleColor(c)} sx={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid #e7e2db", cursor: "pointer", backgroundColor: c.toLowerCase(), outline: selected ? `3px solid rgba(200,150,70,0.95)` : "none" }} />
          })}
        </Box>

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Size</Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {availableSizes.map((s) => <FormControlLabel key={s} control={<Checkbox checked={sizeFilters.includes(s)} onChange={() => toggleSize(s)} size="small" />} label={s} />)}
        </Box>

        <Divider sx={{ my: 2 }} />
        <Button variant="text" color="primary" onClick={() => { setCategory(""); setSearchInput(""); setSearchName(""); setPriceRange([0, 1000]); setSizeFilters([]); setColorFilters([]); setTempMinPrice(""); setTempMaxPrice(""); }}>Reset filters</Button>
      </Paper>

      <Drawer anchor="left" open={filtersOpen} onClose={() => setFiltersOpen(false)}>
        <Box sx={{ width: 300, p: 2 }} role="presentation">
          <Typography variant="h6" fontWeight={700} gutterBottom>Filter Options</Typography>
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
              return <Box key={`m-${c}`} onClick={() => toggleColor(c)} sx={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid #e7e2db", cursor: "pointer", backgroundColor: c.toLowerCase(), outline: selected ? `3px solid rgba(200,150,70,0.95)` : "none" }} />
            })}
          </Box>

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Size</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {availableSizes.map((s) => <FormControlLabel key={`m-${s}`} control={<Checkbox checked={sizeFilters.includes(s)} onChange={() => toggleSize(s)} size="small" />} label={s} />)}
          </Box>

          <Divider sx={{ my: 2 }} />
          <Button variant="text" color="primary" onClick={() => { setCategory(""); setSearchInput(""); setSearchName(""); setPriceRange([0, 1000]); setSizeFilters([]); setColorFilters([]); setTempMinPrice(""); setTempMaxPrice(""); }}>Reset filters</Button>
        </Box>
      </Drawer>

      <Box sx={{ flex: 1 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5 }}>Shop</Typography>
          <Typography variant="body2" color="text.secondary">Home / Shop</Typography>
        </Box>

        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }} sx={{ mb: 3, gap: 2 }}>
          <Box sx={{ display: { xs: "flex", md: "none" }, width: "100%" }}>
            <Button startIcon={<FilterAltIcon />} variant="outlined" onClick={() => setFiltersOpen(true)} sx={{ mr: 2 }}>Filters</Button>
          </Box>
          <form onSubmit={handleSearchSubmit} style={{ width: "100%", maxWidth: 560 }}>
            <Stack direction="row" spacing={1}>
              <TextField fullWidth size="small" placeholder="Search products..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
              <IconButton type="submit" color="primary" sx={{ bgcolor: "secondary.light" }}><SearchIcon /></IconButton>
            </Stack>
          </form>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }} sx={{ width: "100%", justifyContent: { xs: "stretch", md: "flex-end" } }}>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: { xs: "center", sm: "left" } }}>
              Showing {filtered.length === 0 ? 0 : (page - 1) * perPage + 1} - {Math.min(page * perPage, filtered.length)} of {filtered.length} results
            </Typography>
            <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 170 },margin:"10 auto" }}>
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
          {(priceRange?.[0] !== undefined && priceRange?.[1] !== undefined) && <Chip label={`Price: ${priceRange[0]} - ${priceRange[1]}`} onDelete={() => { setPriceRange([0, 1000]); setTempMinPrice(""); setTempMaxPrice(""); setPage(1); fetchAllProducts(); }} />}
          {sizeFilters.map((s) => <Chip key={`size-${s}`} label={`Size: ${s}`} onDelete={() => toggleSize(s)} />)}
          {colorFilters.map((c) => <Chip key={`color-${c}`} label={`Color: ${c}`} onDelete={() => toggleColor(c)} />)}
        </Stack>

        {loading ? (
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "repeat(auto-fill, minmax(150px, 1fr))", sm: "repeat(auto-fill, minmax(180px, 1fr))", md: "repeat(auto-fill, minmax(220px, 1fr))" } }}>
            {Array.from({ length: 8 }).map((_, idx) => <Paper key={idx} 
              sx={{ p: 2, height: { xs: 280, md: 320 }, display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ height: { xs: 140, md: 160 }, bgcolor: "#f2f2f2", borderRadius: 1 }} />
                <Box sx={{ height: 14, bgcolor: "#eaeaea", borderRadius: 1 }} />
                <Box sx={{ height: 14, bgcolor: "#eaeaea", borderRadius: 1, width: "60%", mt: 1 }} />
              <Box sx={{ mt: "auto", height: 36, bgcolor: "#eaeaea", borderRadius: 1 }} /></Paper>)}
          </Box>
        ) : (
          <>
            <Box sx={{ px: { xs: 2, sm: 0 } }}>
              <Grid
                container
                spacing={{ xs: 2, sm: 2, md: 3 }}
                sx={{
                  alignItems: "stretch",
                }}
              >
                {visibleProducts.map((product) => {
                  const discountedPrice =
                    product.discount > 0
                      ? (Number(product.price) * (100 - Number(product.discount))) / 100
                      : null;
                  return (
                    <Grid
                      item
                      xs={6}
                      sm={4}
                      md={3}
                      key={product.id}
                      sx={{ display: "flex", flexDirection: "column" }}
                    >                      <Paper
                        elevation={3}
                        sx={{
                          p: { xs: 1.5, sm: 2, md: 2 },
                          borderRadius: { xs: 2, md: 3 },
                          display: "flex",
                          flexDirection: "column",
                          width: "100%",
                          height: { xs: 320, sm: 380, md: 420 }, // Fixed height for consistency
                          position: "relative",
                          overflow: "hidden",
                          transition: "transform 0.18s ease, box-shadow 0.18s ease",
                          "&:hover": {
                            transform: "translateY(-6px)",
                            boxShadow: "0 12px 30px rgba(0,0,0,0.12)"
                          }
                        }}
                      >
                        {product.discount > 0 && (
                          <Chip
                            label={`${product.discount}% off`}
                            color="secondary"
                            size="small"
                            sx={{
                              position: "absolute",
                              top: 8,
                              left: 8,
                              zIndex: 2,
                              fontSize: { xs: "0.7rem", sm: "0.75rem" }
                            }}
                          />
                        )}
                        
                        <Box
                          component={Link}
                          href={`/product/${encodeURIComponent(product.title)}`}
                          sx={{
                            textDecoration: "none",
                            color: "inherit",
                            display: "flex",
                            flexDirection: "column",
                            flexGrow: 1,
                            gap: { xs: 1, sm: 1.2 }
                          }}
                        >
                          <ProductImage
                            image_url={product.image_url}
                            title={product.title}
                          />                          <Box sx={{ px: { xs: 0.5, sm: 0 }, flex: 1, display: "flex", flexDirection: "column" }}>
                            <Typography
                              variant="subtitle1"
                              fontWeight={600}
                              sx={{
                                mb: 0.5,
                                fontSize: { xs: "0.9rem", sm: "0.95rem", md: "1rem" },
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                height: { xs: 44, sm: 46, md: 48 }, // Fixed height instead of minHeight
                                lineHeight: { xs: 1.35, sm: 1.4 },
                              }}
                            >
                              {product.title}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "-webkit-box",
                                mb: 1.2,
                                fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" },
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                WebkitLineClamp: { xs: 2, sm: 2 },
                                WebkitBoxOrient: "vertical",
                                height: { xs: 32, sm: 34, md: 36 }, // Fixed height instead of minHeight
                                lineHeight: 1.4,
                                flex: 1, // Take remaining space
                              }}
                            >
                              {/* {product.description?.slice(0, 70)} */}
                            </Typography>                            <Box sx={{ mt: "auto", mb: 1 }}>
                              {product.discount > 0 ? (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
                                  <Typography 
                                    variant="body2" 
                                    color="text.secondary" 
                                    sx={{ 
                                      textDecoration: "line-through", 
                                      fontSize: { xs: "0.8rem", md: "0.9rem" } 
                                    }}
                                  >
                                    ${Number(product.price).toFixed(2)}
                                  </Typography>
                                  <Typography 
                                    variant="h6" 
                                    color="secondary" 
                                    fontWeight={700} 
                                    sx={{ fontSize: { xs: "1rem", md: "1.1rem" } }}
                                  >
                                    ${discountedPrice.toFixed(2)}
                                  </Typography>
                                </Box>
                              ) : (
                                <Typography 
                                  variant="h6" 
                                  color="secondary" 
                                  fontWeight={700} 
                                  sx={{ fontSize: { xs: "1rem", md: "1.1rem" } }}
                                >
                                  ${Number(product.price).toFixed(2)}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Box>

                        <Box sx={{ mt: "auto", pt: 1.5, px: { xs: 0.5, sm: 0 } }}>
                          {product.stock > 0 ? (
                            <Button
                              href={`/product/${encodeURIComponent(product.title)}`}
                              variant="contained"
                              startIcon={<ShoppingCartOutlined />}
                              size="small"
                              fullWidth
                              sx={{
                                borderRadius: 2,
                                textTransform: "none",
                                py: { xs: 1, sm: 1.2 },
                                fontSize: { xs: "0.8rem", sm: "0.85rem" },
                                fontWeight: 600
                              }}
                            >
                              View / Add
                            </Button>
                          ) : (
                            <Typography 
                              color="error" 
                              fontWeight={700} 
                              align="center"
                              sx={{ 
                                fontSize: { xs: "0.85rem", md: "1rem" },
                                py: 1
                              }}
                            >
                              Out of Stock
                            </Typography>
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
            </Box>
          </>
        )}
      </Box>

      <Lightbox open={lightboxOpen} images={lbImages} startIndex={lbIndex} onClose={() => setLightboxOpen(false)} />
    </Box>
  );
}