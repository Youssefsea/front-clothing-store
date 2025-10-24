"use client";
import { SpeedInsights } from "@vercel/speed-insights/next"
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Grid,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  Avatar,
  AppBar,
  Toolbar,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Search,
  FavoriteBorder,
  ShoppingCartOutlined,
  LocalShipping,
  Payment,
  Support,
  ExpandMore,
  Star,
  ArrowForward,
  Instagram,
  Facebook,
  Twitter,
  Pinterest,
  YouTube,
  Menu,
  Person,
  Close,
  KeyboardArrowDown,
  Add,
  Remove,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import Link from "next/link";
import axiosInstance from "./axios";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const heroImages = [
    "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg", // Hoodie model
    "https://images.pexels.com/photos/2584269/pexels-photo-2584269.jpeg", // Fashion model
    "https://images.pexels.com/photos/5325870/pexels-photo-5325870.jpeg", // Dress model
    "https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg", // Casual wear
    "https://images.pexels.com/photos/7679722/pexels-photo-7679722.jpeg", // Street style
    "https://images.pexels.com/photos/2983467/pexels-photo-2983467.jpeg", // Fashion model
  ];
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/products");
      setProducts(res.data.allProducts?.slice(0, 8) || []);
    } catch (e) {
      console.error("Error fetching products:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box>
      <Box
        sx={{
          position: "relative",
          width: "100vw",
          height: { xs: "100vh", md: "100vh" },
          overflow: "hidden",
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
          marginTop: "-40px",
          paddingTop: "40px",
        }}
      >
        {heroImages.map((src, idx) => (
          <Box
            key={src}
            component="img"
            src={src}
            alt={`Hero model ${idx + 1}`}
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: activeHeroIndex === idx ? 1 : 0,
              transform: activeHeroIndex === idx ? "scale(1)" : "scale(1.1)",
              transition: "opacity 1000ms ease, transform 1000ms ease",
            }}
          />
        ))}

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(45deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)",
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", height: "100%", display: "flex", alignItems: "center" }}>
          <Stack alignItems="center" spacing={4} sx={{ width: "100%", textAlign: "center" }}>
            <Chip
              label="New Collection "
              icon={<Star />}
              sx={{ 
                bgcolor: "rgba(255,255,255,0.9)", 
                color: "#111", 
                px: 2, 
                py: 1, 
                fontWeight: 700,
                backdropFilter: "blur(10px)",
                animation: "fadeInUp 0.8s ease",
              }}
            />
            <Typography
              variant="h1"
              fontWeight={900}
              sx={{ 
                color: "white", 
                lineHeight: 1.1, 
                letterSpacing: "-2px",
                textShadow: "0 4px 20px rgba(0,0,0,0.3)",
                animation: "fadeInUp 0.8s ease 0.2s both",
                fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem", lg: "4.5rem" },
              }}
            >
              GEAR UP EVERY SEASON,<br />EVERY WORKOUT!
            </Typography>
            <Typography
              variant="h5"
              sx={{ 
                color: "rgba(255,255,255,0.9)", 
                fontWeight: 400,
                maxWidth: 600,
                animation: "fadeInUp 0.8s ease 0.4s both",
                fontSize: { xs: "1rem", sm: "1.2rem", md: "1.5rem" },
                px: { xs: 2, sm: 0 },
              }}
            >
              Discover our latest collection of premium fashion and athletic wear
            </Typography>

            <Stack 
              direction="row" 
              spacing={0} 
              sx={{ 
                animation: "fadeInUp 0.8s ease 0.6s both",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Button
                variant="contained"
                size="large"
                className="shop-now-button shop-now-shimmer"
                sx={{
                  bgcolor: "#111",
                  color: "#fff",
                  px: { xs: 4, sm: 6, md: 8 },
                  py: { xs: 2, sm: 2.5, md: 3 },
                  borderRadius: 999,
                  fontWeight: 700,
                  fontSize: { xs: 16, sm: 18, md: 20 },
                  minWidth: { xs: 200, sm: 220, md: 240 },
                  position: "relative",
                  overflow: "hidden",
                  textTransform: "none",
                  letterSpacing: "0.5px",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
                  "&:hover": { 
                    bgcolor: "#000",
                    transform: "translateY(-4px) scale(1.05)",
                    boxShadow: "0 15px 40px rgba(0,0,0,0.4)",
                    "&::before": {
                      transform: "translateX(100%)",
                    }
                  },
                  "&:active": {
                    transform: "translateY(-2px) scale(1.02)",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                    transition: "transform 0.6s ease",
                  },
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: 0,
                    height: 0,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.3)",
                    transform: "translate(-50%, -50%)",
                    transition: "width 0.6s ease, height 0.6s ease",
                  },
                  "&:hover::after": {
                    width: "300px",
                    height: "300px",
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                href="/shop"
              >
                <Box sx={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 1 }}>
                  Shop Now
                  <ArrowForward sx={{ fontSize: { xs: 18, sm: 20, md: 22 } }} />
                </Box>
              </Button>
            </Stack>
          </Stack>
        </Container>

        <IconButton
          onClick={() => setActiveHeroIndex((p) => (p - 1 + heroImages.length) % heroImages.length)}
          sx={{
            position: "absolute",
            top: "50%",
            left: { xs: 10, sm: 20 },
            transform: "translateY(-50%)",
            bgcolor: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(10px)",
            display: { xs: "none", sm: "flex" },
            "&:hover": { 
              bgcolor: "white",
              transform: "translateY(-50%) scale(1.1)",
            },
            transition: "all 0.3s ease",
          }}
        >
          <ChevronLeft />
        </IconButton>
        <IconButton
          onClick={() => setActiveHeroIndex((p) => (p + 1) % heroImages.length)}
          sx={{
            position: "absolute",
            top: "50%",
            right: { xs: 10, sm: 20 },
            transform: "translateY(-50%)",
            bgcolor: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(10px)",
            display: { xs: "none", sm: "flex" },
            "&:hover": { 
              bgcolor: "white",
              transform: "translateY(-50%) scale(1.1)",
            },
            transition: "all 0.3s ease",
          }}
        >
          <ChevronRight />
        </IconButton>

        <Stack 
          direction="row" 
          spacing={1} 
          sx={{ 
            position: "absolute", 
            bottom: { xs: 20, sm: 40 }, 
            left: 0, 
            right: 0, 
            mx: "auto", 
            justifyContent: "center" 
          }}
        >
          {heroImages.map((_, i) => (
            <Box
              key={i}
              onClick={() => setActiveHeroIndex(i)}
              sx={{
                width: i === activeHeroIndex ? 24 : 8,
                height: 8,
                borderRadius: 999,
                bgcolor: i === activeHeroIndex ? "white" : "rgba(255,255,255,0.5)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.8)",
                },
              }}
            />
          ))}
        </Stack>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Typography 
          variant="h3" 
          fontWeight={800} 
          textAlign="center" 
          mb={{ xs: 4, md: 6 }} 
          color="#111"
          sx={{ fontSize: { xs: "1.8rem", sm: "2.2rem", md: "3rem" } }}
        >
          Why Choose Us?
        </Typography>
        <Grid container spacing={{ xs: 2, md: 4 }}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                textAlign: "center",
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                border: "1px solid #f0f0f0",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                },
              }}
            >
              <Box
                sx={{
                  width: { xs: 80, md: 100 },
                  height: { xs: 80, md: 100 },
                  bgcolor: "#111",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: { xs: 2, md: 3 },
                  boxShadow: "0 8px 25px rgba(17, 17, 17, 0.3)",
                }}
              >
                <LocalShipping sx={{ fontSize: { xs: 40, md: 50 }, color: "white" }} />
              </Box>
              <Typography 
                variant="h5" 
                fontWeight={700} 
                mb={2} 
                color="#111"
                sx={{ fontSize: { xs: "1.2rem", md: "1.5rem" } }}
              >
                Free Shipping
              </Typography>
              <Typography color="#666" fontSize={{ xs: 14, md: 16 }}>
                Free shipping on all orders over $100
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                textAlign: "center",
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                border: "1px solid #f0f0f0",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                },
              }}
            >
              <Box
                sx={{
                  width: { xs: 80, md: 100 },
                  height: { xs: 80, md: 100 },
                  bgcolor: "#111",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: { xs: 2, md: 3 },
                  boxShadow: "0 8px 25px rgba(17, 17, 17, 0.3)",
                }}
              >
                <Payment sx={{ fontSize: { xs: 40, md: 50 }, color: "white" }} />
              </Box>
              <Typography 
                variant="h5" 
                fontWeight={700} 
                mb={2} 
                color="#111"
                sx={{ fontSize: { xs: "1.2rem", md: "1.5rem" } }}
              >
                Secure Payment
              </Typography>
              <Typography color="#666" fontSize={{ xs: 14, md: 16 }}>
                Safe and secure payment options
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                textAlign: "center",
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                border: "1px solid #f0f0f0",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                },
              }}
            >
              <Box
                sx={{
                  width: { xs: 80, md: 100 },
                  height: { xs: 80, md: 100 },
                  bgcolor: "#111",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: { xs: 2, md: 3 },
                  boxShadow: "0 8px 25px rgba(17, 17, 17, 0.3)",
                }}
              >
                <Support sx={{ fontSize: { xs: 40, md: 50 }, color: "white" }} />
              </Box>
              <Typography 
                variant="h5" 
                fontWeight={700} 
                mb={2} 
                color="#111"
                sx={{ fontSize: { xs: "1.2rem", md: "1.5rem" } }}
              >
                24/7 Support
              </Typography>
              <Typography color="#666" fontSize={{ xs: 14, md: 16 }}>
                We provide service all day
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Box sx={{ bgcolor: "#f8f9fa", py: { xs: 4, md: 8 } }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            fontWeight={800} 
            textAlign="center" 
            mb={{ xs: 4, md: 6 }} 
            color="#111"
            sx={{ fontSize: { xs: "1.8rem", sm: "2.2rem", md: "3rem" } }}
          >
            Shop by Category
          </Typography>
          <Grid container spacing={{ xs: 2, md: 4 }}>
            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  height: { xs: 400, md: 500 }, 
                  position: "relative", 
                  overflow: "hidden",
                  borderRadius: 3,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="300"
                  image="https://images.pexels.com/photos/2584269/pexels-photo-2584269.jpeg"
                  alt="Women's Fashion"
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ 
                  position: "absolute", 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  bgcolor: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(10px)",
                  p: 3
                }}>
                  <Typography variant="h4" fontWeight={800} mb={2} color="#111">
                    For Women's
                  </Typography>
                  <Typography variant="body1" color="#666" mb={2} fontWeight={600}>
                <br />
                  </Typography>
                  <Stack spacing={0.5}>
                    {["Dresses", "Tops", "Jeans", "Jackets & Coats", "Shoes", "Bags", "Accessories"].map((item) => (
                      <Typography key={item} fontSize={14} color="#666">
                        • {item}
                      </Typography>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  height: { xs: 400, md: 500 }, 
                  position: "relative", 
                  overflow: "hidden",
                  borderRadius: 3,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="300"
                  image="https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg"
                  alt="Men's Fashion"
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ 
                  position: "absolute", 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  bgcolor: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(10px)",
                  p: 3
                }}>
                  <Typography variant="h4" fontWeight={800} mb={2} color="#111">
                    For Men's
                  </Typography>
                  <Typography variant="body1" color="#666" mb={2} fontWeight={600}>
                    <br />
                  </Typography>
                  <Stack spacing={0.5}>
                    {["Shirts", "T-Shirts", "Jeans", "Jackets & Coats", "Shoes", "Watches"].map((item) => (
                      <Typography key={item} fontSize={14} color="#666">
                        • {item}
                      </Typography>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card 
                sx={{ 
                  height: { xs: 400, md: 500 }, 
                  position: "relative", 
                  overflow: "hidden",
                  borderRadius: 3,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image="https://th.bing.com/th/id/OIP.RpoFGVgWwnMtPSgwCDe2KQHaE7?w=282&h=187&c=7&r=0&o=7&cb=12&dpr=2&pid=1.7&rm=3"
                  alt="Accessories"
                  sx={{ objectFit: "cover" }}
                />
                <CardContent sx={{ 
                  position: "absolute", 
                  bottom: 0, 
                  left: 0, 
                  right: 0, 
                  bgcolor: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(10px)",
                  p: 3
                }}>
                  <Typography variant="h4" fontWeight={800} mb={2} color="#111">
                    Accessories
                  </Typography>
                  <Typography variant="body1" color="#666" mb={2} fontWeight={600}>
                    <br />
                  </Typography>
                  <Stack spacing={0.5}>
                    {["Bags", "Hats", "Jewelry", "Watches", "Belts"].map((item) => (
                      <Typography key={item} fontSize={14} color="#666">
                        • {item}
                      </Typography>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          mb: { xs: 4, md: 6 },
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 }
        }}>
          <Typography 
            variant="h4" 
            fontWeight={800} 
            color="#111"
            sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" } }}
          >
            Our Top Seller Products
          </Typography>
          {/* <Stack direction="row" spacing={1}>
            {["All", "Women", "Men", "Accessories"].map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "contained" : "outlined"}
                size="small"
                sx={{
                  bgcolor: category === "All" ? "#111" : "transparent",
                  color: category === "All" ? "white" : "#111",
                  borderColor: "#111",
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  "&:hover": {
                    bgcolor: category === "All" ? "#000" : "#f5f5f5",
                    borderColor: "#111",
                  },
                }}
              >
                {category}
              </Button>
            ))}
          </Stack> */}
        </Box>

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ p: 2, height: { xs: 350, md: 400 }, borderRadius: 3 }}>
                  <Box sx={{ height: 250, bgcolor: "#f5f5f5", borderRadius: 2, mb: 2 }} />
                  <Box sx={{ height: 20, bgcolor: "#e0e0e0", borderRadius: 1, mb: 1 }} />
                  <Box sx={{ height: 16, bgcolor: "#e0e0e0", borderRadius: 1, width: "60%" }} />
                </Card>
              </Grid>
            ))
          ) : (
            products.slice(0, 4).map((product) => {
              const discountedPrice = product.discount > 0 
                ? (Number(product.price) * (100 - Number(product.discount))) / 100 
                : null;
              
              return (
                <Grid item xs={12} sm={6} md={3} key={product.id}>
                  <Card
                    sx={{
                      p: 2,
                      height: { xs: 350, md: 400 },
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      borderRadius: 3,
                      boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
                      border: "1px solid #f0f0f0",
                      transition: "all 0.3s ease",
                      "&:hover": { 
                        transform: "translateY(-8px)",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    {product.discount > 0 && (
                      <Chip
                        label={`${product.discount}% off`}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          bgcolor: "#3a2c1a",
                          color: "white",
                          fontWeight: 600,
                          zIndex: 2,
                        }}
                      />
                    )}
                    
                    {/* <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
                      <IconButton size="small" sx={{ color: "#3a2c1a" }}>
                        <FavoriteBorder />
                      </IconButton>
                      <IconButton size="small" sx={{ color: "#3a2c1a" }}>
                        <ShoppingCartOutlined />
                      </IconButton>
                    </Stack> */}
                    
                    <Box
                      component={Link}
                      href={`/product/${encodeURIComponent(product.title)}`}
                      sx={{ textDecoration: "none", color: "inherit", flexGrow: 1 }}
                    >
                      <Box
                        sx={{
                          height: { xs: 200, md: 250 },
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 2,
                          position: "relative",
                          overflow: "hidden",
                          borderRadius: 2,
                        }}
                      >
                        <Box
                          component="img"
                          src={product.image_url}
                          alt={product.title}
                          sx={{
                            maxHeight: "100%",
                            width: "auto",
                            objectFit: "contain",
                            transition: "transform 0.3s ease",
                            "&:hover": { transform: "scale(1.05)" },
                          }}
                        />
                      </Box>
                      
                      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <Rating value={4.9} precision={0.1} size="small" readOnly />
                        <Typography variant="caption" sx={{ ml: 1, fontWeight: 600 }}>
                          4.9
                        </Typography>
                      </Box>
                      
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }} noWrap>
                        {product.title}
                      </Typography>
                      
                      {discountedPrice ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography variant="h6" color="#3a2c1a" fontWeight={700}>
                            ${discountedPrice.toFixed(2)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ textDecoration: "line-through" }}>
                            ${product.price}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="h6" color="#3a2c1a" fontWeight={700}>
                          ${product.price}
                        </Typography>
                      )}
                    </Box>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>
      </Container>


    </Box>
  );
}
