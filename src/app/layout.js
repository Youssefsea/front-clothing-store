"use client";
import React from "react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  Box,
} from "@mui/material";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AuthProvider>
            <CartProvider>
              <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                <Navbar theme={theme} />
                <Box component="main" sx={{ flexGrow: 1 }}>
                  {children}
                </Box>
                <Footer theme={theme} />
              </Box>
            </CartProvider>
          </AuthProvider>
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}

