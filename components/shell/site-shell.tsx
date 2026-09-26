"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/shell/navbar";
import { Footer } from "@/components/shell/footer";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <div className="min-h-screen bg-background">{children}</div>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
    </div>
  );
}
