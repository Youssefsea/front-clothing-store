"use client";

import Link from "next/link";
import { ArrowUpRight, Instagram, Mail } from "lucide-react";
import { useLang } from "@/components/transitions/language-provider";

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="mt-20 border-t border-border">
      <div className="site-container py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.2fr_repeat(3,1fr)]">
          <div>
            <div className="text-xl font-black tracking-[.22em]">VANTA</div>
            <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">{t("footer.statement")}</p>
            <div className="mt-6 flex gap-2">
              <a href="mailto:" className="grid size-10 place-items-center rounded-full border border-border hover:bg-muted" aria-label={t("footer.email")}><Mail className="size-4" aria-hidden /></a>
              <a href="#" className="grid size-10 place-items-center rounded-full border border-border hover:bg-muted" aria-label={t("footer.instagram")}><Instagram className="size-4" aria-hidden /></a>
            </div>
          </div>
          <FooterCol title={t("footer.shop")} links={[[t("nav.shop"), "/shop"], [t("home.featured"), "/shop"]]} />
          <FooterCol title={t("footer.account")} links={[[t("nav.account"), "/account"], [t("nav.orders"), "/orders"], [t("nav.cart"), "/cart"]]} />
          <FooterCol title={t("footer.support")} links={[[t("footer.contact"), "mailto:"], [t("footer.payment"), "/checkout"]]} />
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} VANTA</span>
          <span>{t("footer.note")}</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: Array<[string, string]> }) {
  return (
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <nav className="mt-4 grid gap-3">
        {links.map(([label, href]) => href.startsWith("mailto:") ? (
          <a key={label} href={href} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">{label}<ArrowUpRight className="size-3.5" aria-hidden /></a>
        ) : (
          <Link key={label} href={href} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">{label}<ArrowUpRight className="size-3.5" aria-hidden /></Link>
        ))}
      </nav>
    </div>
  );
}
