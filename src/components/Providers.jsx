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

export default function Providers({ children }) {
  return (
    <VantaThemeProvider>
      <LocaleProvider>
        <AuthProvider>
          <CartProvider>
            <UiProvider>
              <div className="app-shell">
                <Navbar />
                <main className="app-main">{children}</main>
                <Footer />
              </div>
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
