"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  CircularProgress,
  Pagination,
  Stack,
  Drawer,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ShoppingCartOutlined from "@mui/icons-material/ShoppingCartOutlined";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

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



function ProductImage({ image_url, title }) {
  const images = image_url.split(",").map((img) => img.trim());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setFade(false); // أولًا نخفي الصورة الحالية
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setFade(true); // ثم نظهر الصورة الجديدة
      }, 300); // نفس مدة الـtransition
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
<Box
  sx={{
    position: "relative",
    height: { xs: 200, md: 240 },
    overflow: "hidden",
    borderRadius: 2,
    "& img": {
      transition: "transform 0.4s ease",
    },
    "&:hover img": {
      transform: "scale(1.05)",
    },
  }}
>
     <Box
  component="img"
  src={images[currentIndex]}
  alt={`${title} image`}
  sx={{
    height: "100%",
    width: "100%",
    objectFit: "cover", // أو "contain" لو تحب تبين الصورة كاملة
    transition: "opacity 0.4s ease-in-out",
    opacity: fade ? 1 : 0,
    backgroundColor: "#f7f7f7", // لو الصورة بطيئة التحميل
  }}
/>
    </Box>
  );
}




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

  useEffect(() => {
    fetchAllProducts();
  }, []);

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
            return <Box key={c} onClick={() => toggleColor(c)} sx={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid #e7e2db", cursor: "pointer", outline: selected ? "2px solid #c99746" : "none", outlineOffset: 2, backgroundColor: c.toLowerCase() }} title={c} />;
          })}
        </Box>

        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Size</Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {availableSizes.map((s) => <FormControlLabel key={s} control={<Checkbox checked={sizeFilters.includes(s)} onChange={() => toggleSize(s)} size="small" />} label={s} />)}
        </Box>

        <Divider sx={{ my: 2 }} />
        <Button variant="text" color="primary" onClick={() => { setCategory(""); setSearchInput(""); setSearchName(""); setPriceRange([0, 1000]); setSizeFilters([]); setColorFilters([]); setTempMinPrice(""); setTempMaxPrice(""); setPage(1); fetchAllProducts(); }}>Clear All</Button>
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
              return <Box key={`m-${c}`} onClick={() => toggleColor(c)} sx={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid #e7e2db", cursor: "pointer", outline: selected ? "2px solid #c99746" : "none", outlineOffset: 2, backgroundColor: c.toLowerCase() }} title={c} />;
            })}
          </Box>

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Size</Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {availableSizes.map((s) => <FormControlLabel key={`m-${s}`} control={<Checkbox checked={sizeFilters.includes(s)} onChange={() => toggleSize(s)} size="small" />} label={s} />)}
          </Box>

          <Divider sx={{ my: 2 }} />
          <Button variant="text" color="primary" onClick={() => { setCategory(""); setSearchInput(""); setSearchName(""); setPriceRange([0, 1000]); setSizeFilters([]); setColorFilters([]); setTempMinPrice(""); setTempMaxPrice(""); setPage(1); fetchAllProducts(); }}>Clear All</Button>
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
          {(priceRange?.[0] !== undefined && priceRange?.[1] !== undefined) && <Chip label={`Price: ${priceRange[0]} - ${priceRange[1]}`} onDelete={() => { setPriceRange([0, 1000]); setTempMinPrice(""); setTempMaxPrice(""); setPage(1); }} />}
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
  <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        sx={{
          alignItems: "stretch", // الكروت كلها بنفس الارتفاع
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
              xs={6} // موبايل = 2 في الصف
              sm={4} // تابلت = 3 في الصف
              md={3} // ديسكتوب = 4 في الصف
              key={product.id}
              sx={{ display: "flex" }}
            >
              <Paper
                elevation={2}
                sx={{
                  p: { xs: 1.5, md: 2 },
                  borderRadius: 3,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  width: "100%",
                  height: "100%", // تساوي ارتفاع الكروت
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* عرض الخصم */}
                {product.discount > 0 && (
                  <Chip
                    label={`${product.discount}% off`}
                    color="secondary"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      zIndex: 2,
                    }}
                  />
                )}

                {/* صورة المنتج */}
                <Box
                  component={Link}
                  href={`/product/${encodeURIComponent(product.title)}`}
                  sx={{
                    textDecoration: "none",
                    color: "inherit",
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                  }}
                >
                  <ProductImage
                    image_url={product.image_url}
                    title={product.title}
                  />

                  {/* العنوان */}
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{
                      mb: 0.5,
                      fontSize: { xs: "0.9rem", md: "1rem" },
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      minHeight: 48, // لتثبيت ارتفاع العنوان
                    }}
                  >
                    {product.title}
                  </Typography>

                  {/* الوصف */}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mb: 1,
                      fontSize: { xs: "0.7rem", md: "0.75rem" },
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      minHeight: 32, // لتثبيت ارتفاع الوصف
                    }}
                  >
                    {product.description?.slice(0, 60)}
                  </Typography>

                  {/* السعر */}
                  {product.discount > 0 ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.3,
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textDecoration: "line-through" }}
                      >
                        ${product.price}
                      </Typography>
                      <Typography
                        variant="h6"
                        color="secondary"
                        fontWeight={700}
                        sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}
                      >
                        ${discountedPrice.toFixed(2)}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography
                      variant="h6"
                      color="secondary"
                      fontWeight={700}
                      sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}
                    >
                      ${product.price}
                    </Typography>
                  )}
                </Box>

                {/* زرار أو Out of Stock */}
                <Box
                  sx={{
                    mt: "auto",
                    pt: { xs: 1, md: 2 },
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {product.stock > 0 ? (
                    <Button
                      href={`/product/${encodeURIComponent(product.title)}`}
                      variant="contained"
                      startIcon={<ShoppingCartOutlined />}
                      size="small"
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        width: "100%",
                      }}
                    >
                      Add to Cart
                    </Button>
                  ) : (
                    <Typography color="error" fontWeight={700}>
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
          </>
        )}
      </Box>
    </Box>
  );
}
