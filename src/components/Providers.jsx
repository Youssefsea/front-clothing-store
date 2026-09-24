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

const theme = createTheme({
  palette: {
    primary: { main: "#e4572e" },
    secondary: { main: "#c8431c" },
    background: {
      default: "#f5f3ef",
      paper: "#ffffff",
    },
    text: {
      primary: "#262420",
      secondary: "#81796a",
    },
    error: { main: "#c0392b" },
    success: { main: "#1f7a4d" },
    warning: { main: "#b5811c" },
    info: { main: "#2a5fa3" },
  },

  shape: {
    borderRadius: 2,
  },

  typography: {
    fontFamily: "var(--body)",

    h1: {
      fontFamily: "var(--display)",
      fontWeight: 600,
    },

    h2: {
      fontFamily: "var(--display)",
      fontWeight: 600,
    },

    h3: {
      fontFamily: "var(--display)",
      fontWeight: 600,
    },

    h4: {
      fontFamily: "var(--display)",
      fontWeight: 600,
    },

    h5: {
      fontFamily: "var(--display)",
      fontWeight: 600,
    },

    h6: {
      fontFamily: "var(--display)",
      fontWeight: 600,
    },

    button: {
      textTransform: "none",
      fontWeight: 600,
      fontFamily: "var(--display)",
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          width: "100%",
          minHeight: "100%",
        },

        body: {
          margin: 0,
          width: "100%",
          minHeight: "100%",
          background: "var(--bg)",
        },

        "#__next": {
          width: "100%",
          minHeight: "100%",
        },
      },
    },
  },
});

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VantaThemeProvider>
      <LocaleProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />

          <AuthProvider>
            <CartProvider>
              <UiProvider>
                {/* ================================
                    GLOBAL APPLICATION SHELL
                    Navbar
                    Main content
                    Footer
                   ================================= */}
                <div className="app-shell">
                  <Navbar />

                  <main className="app-main">{children}</main>

                  <Footer />
                </div>

                {/* Global overlays / portals */}
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