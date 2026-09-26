"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { X, Moon, Sun, Languages, Search, UserRound, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/transitions/language-provider";
import { useTheme } from "@/components/transitions/theme-provider";
import { useAuth } from "@/stores/auth-store";

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, locale, switchLocale } = useLang();
  const { theme, switchTheme } = useTheme();
  const auth = useAuth();
  const router = useRouter();

  const links = [
    ["/", t("nav.home")],
    ["/shop", t("nav.shop")],
    ...(auth.status === "authenticated" ? [["/orders", t("nav.orders")], ["/account", t("nav.account")]] : [["/login", t("nav.login")]]),
    ...(auth.user?.role === "admin" ? [["/admin", t("nav.admin")]] : [])
  ] as Array<[string, string]>;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" className="absolute inset-0 bg-black/60" onClick={onClose} aria-label={t("common.close")} />
          <motion.aside
            initial={{ x: locale === "ar" ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: locale === "ar" ? "100%" : "-100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className="absolute inset-y-0 start-0 flex w-[min(88vw,380px)] flex-col bg-background p-6 text-foreground shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label={t("nav.mobile")}
          >
            <div className="flex items-center justify-between">
              <Link href="/" onClick={onClose} className="text-lg font-black tracking-[.22em]">VANTA</Link>
              <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full bg-muted" aria-label={t("common.close")}><X className="size-5" aria-hidden /></button>
            </div>

            <nav className="mt-10 grid gap-2" aria-label={t("nav.primary")}>
              {links.map(([href, label]) => (
                <Link key={href} href={href} onClick={onClose} className="flex min-h-12 items-center justify-between rounded-2xl px-4 text-lg font-semibold hover:bg-muted">
                  {label}
                  <Search className="size-4 opacity-40" aria-hidden={href !== "/shop"} />
                </Link>
              ))}
            </nav>

            <div className="mt-auto grid gap-2 border-t border-border pt-4">
              <button type="button" onClick={() => { switchTheme(); }} className="flex min-h-12 items-center justify-between rounded-2xl px-4 hover:bg-muted">
                <span className="flex items-center gap-3">{theme === "dark" ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}{t("nav.theme")}</span>
                <span className="text-xs text-muted-foreground">{theme}</span>
              </button>
              <button type="button" onClick={() => switchLocale()} className="flex min-h-12 items-center justify-between rounded-2xl px-4 hover:bg-muted">
                <span className="flex items-center gap-3"><Languages className="size-4" aria-hidden />{t("nav.language")}</span>
                <span className="text-xs text-muted-foreground">{locale === "en" ? "AR" : "EN"}</span>
              </button>
              {auth.user?.role === "admin" && <div className="flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm text-muted-foreground"><ShieldCheck className="size-4" aria-hidden />{t("admin.access")}</div>}
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
