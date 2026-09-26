"use client";

import { LanguageProvider } from "@/components/transitions/language-provider";
import { ThemeProvider } from "@/components/transitions/theme-provider";
import { LanguageRipple } from "@/components/transitions/language-ripple";
import { ThemeRipple } from "@/components/transitions/theme-ripple";
import { AuthBootstrap } from "@/stores/auth-store";
import { CartBootstrap } from "@/stores/cart-store";

export function Providers({
  children,
  initialLocale,
  initialTheme
}: {
  children: React.ReactNode;
  initialLocale: "en" | "ar";
  initialTheme: "light" | "dark";
}) {
  return (
    <LanguageProvider initialLocale={initialLocale}>
      <ThemeProvider initialTheme={initialTheme}>
        <AuthBootstrap>
          <CartBootstrap>
            {children}
            <LanguageRipple />
            <ThemeRipple />
          </CartBootstrap>
        </AuthBootstrap>
      </ThemeProvider>
    </LanguageProvider>
  );
}
