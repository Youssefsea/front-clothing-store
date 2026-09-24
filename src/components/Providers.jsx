"use client";

import React from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { UiProvider } from "@/context/UiContext";
import { ThemeProvider as VantaThemeProvider } from "@/context/ThemeContext";
import { LocaleProvider } from "@/context/LocaleContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SearchOverlay from "@/components/SearchOverlay";
import Toast from "@/components/Toast";

// MUI is used purely for its theme + CssBaseline reset. Only the reset's
// global styles and our typography matter; the palette below is static
// (aligned with the light tokens) because nothing renders MUI-colored
// components and palette colors cannot be CSS-var strings (MUI runs them
// through color manipulators at palette-augmentation time).
const theme = createTheme({
  palette: {
    primary: { main: "#e4572e" },
    secondary: { main: "#c8431c" },
    background: { default: "#f5f3ef", paper: "#ffffff" },
    text: { primary: "#262420", secondary: "#81796a" },
    error: { main: "#c0392b" },
    success: { main: "#1f7a4d" },
    warning: { main: "#b5811c" },
    info: { main: "#2a5fa3" },
  },
  shape: { borderRadius: 2 },
  typography: {
    fontFamily: "var(--body)",
    h1: { fontFamily: "var(--display)", fontWeight: 600 },
    h2: { fontFamily: "var(--display)", fontWeight: 600 },
    h3: { fontFamily: "var(--display)", fontWeight: 600 },
    h4: { fontFamily: "var(--display)", fontWeight: 600 },
    h5: { fontFamily: "var(--display)", fontWeight: 600 },
    h6: { fontFamily: "var(--display)", fontWeight: 600 },
    button: {
      textTransform: "none",
      fontWeight: 600,
      fontFamily: "var(--display)",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: { body: { background: "var(--bg)" } },
    },
  },
});

export default function Providers({ children }) {
  return (
    <VantaThemeProvider>
      <LocaleProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <CartProvider>
              <UiProvider>
                <Navbar />
                <main>{children}</main>
                <Footer />
                <CartDrawer />
                <SearchOverlay />
                <Toast />
              </UiProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </LocaleProvider>
    </VantaThemeProvider>
  );
}