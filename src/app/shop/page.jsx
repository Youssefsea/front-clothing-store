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

  const categories = useMemo(
    () => ["", "Men", "Women", "Shirt", "Hoodie", "Accessories"],
    []
  );
  const availableColors = [
    "Black",
    "Grey",
    "Green",
    "Red",
    "Orange",
    "Blue",
    "Pink",
    "White",
  ];
  const availableSizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

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
        setFade(false);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % images.length);
          setFade(true);
        }, 300);
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
            objectFit: "cover",
            transition: "opacity 0.4s ease-in-out",
            opacity: fade ? 1 : 0,
            backgroundColor: "#f7f7f7",
          }}
        />
      </Box>
    );
  }

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (searchName)
      list = list.filter((p) =>
        (p.title || "").toLowerCase().includes(searchName.toLowerCase())
      );
    if (sortBy === "priceAsc")
      list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    else if (sortBy === "priceDesc")
      list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    else if (sortBy === "titleAsc")
      list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    return list;
  }, [products, searchName, sortBy]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const visibleProducts = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <Box sx={{ flex: 1 }}>
      <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
        Shop
      </Typography>

      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        alignItems="stretch" // ✅ كل الأعمدة بنفس الارتفاع
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
              sx={{ display: "flex" }} // ✅ علشان Paper يتمدد
            >
              <Paper
                elevation={2}
                sx={{
                  p: { xs: 1.5, md: 2 },
                  borderRadius: 3,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  flex: 1,
                  height: "100%",
                  minHeight: 440, // ✅ تثبيت الارتفاع
                  position: "relative",
                  overflow: "hidden",
                }}
              >
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

                <Box
                  component={Link}
                  href={`/product/${encodeURIComponent(product.title)}`}
                  sx={{
                    textDecoration: "none",
                    color: "inherit",
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <ProductImage
                    image_url={product.image_url}
                    title={product.title}
                  />

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
                      minHeight: 48,
                    }}
                  >
                    {product.title}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      mb: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      minHeight: 32,
                    }}
                  >
                    {product.description?.slice(0, 60)}
                  </Typography>

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
                      >
                        ${discountedPrice.toFixed(2)}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography
                      variant="h6"
                      color="secondary"
                      fontWeight={700}
                    >
                      ${product.price}
                    </Typography>
                  )}
                </Box>

                <Box
                  sx={{
                    mt: "auto",
                    pt: 2,
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
        <Pagination
          count={pages}
          page={page}
          onChange={(_, val) => setPage(val)}
          color="primary"
          shape="rounded"
        />
      </Box>
    </Box>
  );
}
