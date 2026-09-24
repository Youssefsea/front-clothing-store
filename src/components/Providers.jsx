"use client";

import React from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { UiProvider } from "@/context/UiContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SearchOverlay from "@/components/SearchOverlay";
import Toast from "@/components/Toast";

const theme = createTheme({
  palette: {
    primary: { main: "#0b0b0b" },
    secondary: { main: "#e4572e" },
    background: { default: "#f5f3ef", paper: "#ffffff" },
    text: { primary: "#0b0b0b", secondary: "#706a60" },
    error: { main: "#c0392b" },
    success: { main: "#1f7a4d" },
    warning: { main: "#b5811c" },
  },
  shape: { borderRadius: 2 },
  typography: {
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    h1: { fontFamily: "'Archivo', sans-serif", fontWeight: 600 },
    h2: { fontFamily: "'Archivo', sans-serif", fontWeight: 600 },
    h3: { fontFamily: "'Archivo', sans-serif", fontWeight: 600 },
    h4: { fontFamily: "'Archivo', sans-serif", fontWeight: 600 },
    h5: { fontFamily: "'Archivo', sans-serif", fontWeight: 600 },
    h6: { fontFamily: "'Archivo', sans-serif", fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600, fontFamily: "'Archivo', sans-serif" },
  },
  components: {
    MuiCssBaseline: { styleOverrides: { body: { background: "#f5f3ef" } } },
  },
});

export default function Providers({ children }) {
  return (
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
  );
}