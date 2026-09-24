"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
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
  ListItemText,
  Divider,
  Button,
  useMediaQuery,
  useTheme,
  Fade,
  Slide,
  CircularProgress,
} from "@mui/material";
import { Menu, ShoppingBag, Close, Logout as LogoutIcon } from "@mui/icons-material";

function Navbar({ theme: muiTheme }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();
  const { items: cartItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    ...(isAuthenticated ? [{ href: "/orders", label: "Orders" }] : []),
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setMobileOpen(false);
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleNavigation = (href) => {
    router.push(href);
    setMobileOpen(false);
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: muiTheme.palette.primary.main, boxShadow: 1 }}>
        <Toolbar>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "1.2rem", md: "1.5rem" },
                color: "white",
                cursor: "pointer",
              }}
            >
              Fashion Store
            </Typography>
          </Link>

          {isMobile ? (
            <>
              <Box sx={{ marginLeft: "auto", display: "flex", gap: 1 }}>
                <Link href="/cart" style={{ textDecoration: "none" }}>
                  <IconButton color="inherit" size="small">
                    <Badge badgeContent={cartCount} color="secondary">
                      <ShoppingBag sx={{ fontSize: "1.5rem" }} />
                    </Badge>
                  </IconButton>
                </Link>
                <IconButton color="inherit" onClick={() => setMobileOpen(true)}>
                  <Menu />
                </IconButton>
              </Box>

              <Drawer
                anchor="right"
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
              >
                <Box sx={{ width: 250, p: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6">Menu</Typography>
                    <IconButton size="small" onClick={() => setMobileOpen(false)}>
                      <Close />
                    </IconButton>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <List>
                    {navLinks.map((link) => (
                      <ListItem
                        key={link.href}
                        button
                        onClick={() => handleNavigation(link.href)}
                        selected={pathname === link.href}
                      >
                        <ListItemText primary={link.label} />
                      </ListItem>
                    ))}
                  </List>
                  <Divider sx={{ my: 2 }} />
                  {isAuthenticated ? (
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
                        {user?.email || "Logged in"}
                      </Typography>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<LogoutIcon />}
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        size="small"
                        onClick={() => handleNavigation("/login")}
                      >
                        Login
                      </Button>
                      <Button
                        fullWidth
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={() => handleNavigation("/signup")}
                      >
                        Sign Up
                      </Button>
                    </Box>
                  )}
                </Box>
              </Drawer>
            </>
          ) : (
            <>
              <Box sx={{ marginLeft: "auto", display: "flex", gap: 3, alignItems: "center" }}>
                {navLinks.map((link) => (
                  <MuiLink
                    key={link.href}
                    component={Link}
                    href={link.href}
                    sx={{
                      color: "white",
                      textDecoration: "none",
                      fontWeight: pathname === link.href ? "bold" : "normal",
                      borderBottom: pathname === link.href ? "2px solid" : "none",
                      borderColor: "secondary.main",
                      transition: "all 0.3s",
                      "&:hover": { color: "secondary.main" },
                    }}
                  >
                    {link.label}
                  </MuiLink>
                ))}

                <Link href="/cart" style={{ textDecoration: "none" }}>
                  <IconButton color="inherit">
                    <Badge badgeContent={cartCount} color="secondary">
                      <ShoppingBag />
                    </Badge>
                  </IconButton>
                </Link>

                {authLoading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : isAuthenticated ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" sx={{ color: "white" }}>
                      {user?.email?.split("@")[0] || "User"}
                    </Typography>
                    <Button
                      color="inherit"
                      size="small"
                      onClick={handleLogout}
                      startIcon={<LogoutIcon />}
                    >
                      Logout
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => handleNavigation("/login")}
                    >
                      Login
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="small"
                      onClick={() => handleNavigation("/signup")}
                    >
                      Sign Up
                    </Button>
                  </Box>
                )}
              </Box>
            </>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
}

export default Navbar;
