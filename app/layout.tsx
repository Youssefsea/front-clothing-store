import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Providers } from "@/components/app/providers";
import { SiteShell } from "@/components/shell/site-shell";
import { getInitialLocale } from "@/lib/server-locale";

export const metadata: Metadata = {
  title: "VANTA — Modern Essentials",
  description: "A premium, modern clothing storefront."
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getInitialLocale();
  const theme = (await cookies()).get("vanta-theme")?.value === "dark" ? "dark" : "light";

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={theme} suppressHydrationWarning>
      <body>
        <Providers initialLocale={locale} initialTheme={theme}>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
