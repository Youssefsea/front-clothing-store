"use client";

import React from "react";
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

// MUI was previously used purely for CssBaseline + ThemeProvider, but its
// Emotion global styles render an inline `<style>` element during SSR that
// the client injects into <head> instead — misaligning hydration and
// aborting React on every route (error #418). The app renders no MUI
// components and globals.css carries its own reset + design system, so the
// provider stack here is pure domain providers only.
export default function Providers({ children }) {
  return (
    <VantaThemeProvider>
      <LocaleProvider>
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
      </LocaleProvider>
    </VantaThemeProvider>
  );
}