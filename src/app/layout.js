"use client";
import React, { useEffect, useState } from "react";
import "./globals.css";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Link as MuiLink,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  Divider,
  Button,
  useMediaQuery,
  useTheme,
  Fade,
  Slide,
} from "@mui/material";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag } from "@mui/icons-material";
import axiosInstance from "../app/axios";

const theme = createTheme({
  palette: {
    primary: { main: "#3a2c1a" },
    secondary: { main: "#c99746" },
    background: { default: "#faf7f2", paper: "#ffffff" },
    text: { primary: "#2b1e10", secondary: "#6d645d" },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    button: { textTransform: "none", fontWeight: 600 },
  },
});

function Navbar({ cartCount, isLogged, pathname }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (!isLogged) setAnimate(true);
  }, [isLogged]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <MuiLink href='/'  variant="h6" sx={{ my: 2, color: muiTheme.palette.primary.main, fontWeight: 700 }}>
        Clothing.
      </MuiLink>
      <Divider />
      <List>
        <ListItem>
          <MuiLink href="/" underline="none" sx={{ color: pathname === "/" ? muiTheme.palette.secondary.main : muiTheme.palette.primary.main, fontWeight: 600 }}>
            Home
          </MuiLink>
        </ListItem>
        <ListItem>
          <MuiLink href="/shop" underline="none" sx={{ color: pathname === "/shop" ? muiTheme.palette.secondary.main : muiTheme.palette.primary.main, fontWeight: 600 }}>
            Shop
          </MuiLink>
        </ListItem>
        {/* <ListItem>
          <MuiLink href="" underline="none" sx={{ color: muiTheme.palette.primary.main, fontWeight: 600 }}>
            Contact with us
          </MuiLink>
        </ListItem> */}

        {isLogged && (
          <ListItem>
            <MuiLink href="/orderComplet" underline="none" sx={{ color: pathname === "/orderComplet" ? muiTheme.palette.secondary.main : muiTheme.palette.primary.main, fontWeight: 600 }}>
              My Orders
            </MuiLink>
          </ListItem>
        )}

        {!isLogged && (
          <Fade in={animate} timeout={700}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, mt: 1 }}>
              <Slide direction="up" in={animate} timeout={700}>
                <Button href="/login" variant="outlined" sx={{
                  color: muiTheme.palette.secondary.main,
                  borderColor: muiTheme.palette.secondary.main,
                  borderRadius: "20px",
                  px: 3,
                  "&:hover": { backgroundColor: muiTheme.palette.secondary.main, color: "#fff" }
                }}>
                  Sign In
                </Button>
              </Slide>
              <Slide direction="up" in={animate} timeout={900}>
                <Button href="/signup" variant="contained" sx={{
                  backgroundColor: muiTheme.palette.secondary.main,
                  color: "#fff",
                  borderRadius: "20px",
                  px: 3,
                  "&:hover": { backgroundColor: "#a97b30" }
                }}>
                  Sign Up
                </Button>
              </Slide>
            </Box>
          </Fade>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" sx={{ top: 0, backgroundColor: muiTheme.palette.primary.main, boxShadow: "none" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {isMobile && (
              <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
                <Menu />
              </IconButton>
            )}
            <MuiLink href='/' variant="h6" sx={{ color: "#fff", fontWeight: 700, cursor: "pointer" }}>
              Clothing.
            </MuiLink>
          </Box>

          {!isMobile && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <MuiLink href="/" underline="none" sx={{ color: pathname === "/" ? muiTheme.palette.secondary.main : "#fff" }}>Home</MuiLink>
              <MuiLink href="/shop" underline="none" sx={{ color: pathname === "/shop" ? muiTheme.palette.secondary.main : "#fff" }}>Shop</MuiLink>
              {/* <MuiLink href="" underline="none" sx={{ color: "#fff" }}>Contact with us</MuiLink> */}

              {isLogged && (
                <MuiLink href="/orderComplet" underline="none" sx={{ color: pathname === "/orderComplet" ? muiTheme.palette.secondary.main : "#fff", display: "flex", alignItems: "center", gap: 0.5 }}>
                  <ShoppingBag sx={{ fontSize: 18 }} />
                  My Orders
                </MuiLink>
              )}

              {!isLogged && (
                <Fade in={animate} timeout={700}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Slide direction="up" in={animate} timeout={700}>
                      <Button href="/login" variant="outlined" sx={{
                        color: muiTheme.palette.secondary.main,
                        borderColor: muiTheme.palette.secondary.main,
                        borderRadius: "20px",
                        px: 2.5,
                        "&:hover": { backgroundColor: muiTheme.palette.secondary.main, color: "#fff" }
                      }}>
                        Sign In
                      </Button>
                    </Slide>
                    <Slide direction="up" in={animate} timeout={900}>
                      <Button href="/signup" variant="contained" sx={{
                        backgroundColor: muiTheme.palette.secondary.main,
                        color: "#fff",
                        borderRadius: "20px",
                        px: 2.5,
                        "&:hover": { backgroundColor: "#a97b30" }
                      }}>
                        Sign Up
                      </Button>
                    </Slide>
                  </Box>
                </Fade>
              )}
            </Box>
          )}

          <Box>
            <MuiLink href="/cart" underline="none">
              <IconButton color="inherit">
                <Badge badgeContent={isLogged ? cartCount : 0} color="secondary">
                  <img
                    src="https://cdn0.iconfinder.com/data/icons/mobile-basic-vol-1/32/Tote_Bag-128.png"
                    alt="Cart"
                    style={{ width: 32, height: 32 }}
                  />
                </Badge>
              </IconButton>
            </MuiLink>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 } }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

function Footer() {
  return (
    <Box sx={{ backgroundColor: theme.palette.primary.main, color: "white", mt: 8, py: 4, textAlign: "center" }}>
      <Typography variant="body2">© 2025 Clothing Website Design. All Rights Reserved.</Typography>
    </Box>
  );
}

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [isLogged, setIsLogged] = useState(false);

  const updateCartCount = async () => {
    try {
      const res = await axiosInstance.get("/cart");
      const totalQty = res.data.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
      setCartCount(totalQty);

    }
    
  
    catch {
      setCartCount(0);
    }
  };

  const checkAuth = async () => {
    const res = await axiosInstance.get("/isLoggedIn");
    if(res.status===200)
    {
      setIsLogged(true);
    }
    else
    {
      setIsLogged(false);
    }
  };

  useEffect(() => {
    updateCartCount();
    checkAuth();
    window.addEventListener("cartUpdated", updateCartCount);
    return () => window.removeEventListener("cartUpdated", updateCartCount);
  }, []);

  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Navbar cartCount={cartCount} isLogged={isLogged} pathname={pathname} />
            <Box component="main" sx={{ flexGrow: 1 }}>{children}</Box>
            <Footer />
          </Box>
        </ThemeProvider>
      </body>
    </html>
  );
}
