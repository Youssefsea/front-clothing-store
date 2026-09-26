"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LayoutDashboard, Package, ShoppingCart, Users, Tags, LogOut, ArrowLeft, ArrowRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth-store";
import { useLang } from "@/components/transitions/language-provider";
import { useTheme } from "@/components/transitions/theme-provider";
import { apiRequest } from "@/lib/api";
import { LoadingBlock } from "@/components/ui/feedback";

type VerifyState = "checking" | "allowed" | "denied";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const authStatus = useAuth((s) => s.status);
  const authUser = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const { t, locale } = useLang();
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [verify, setVerify] = useState<VerifyState>("checking");
  const [error, setError] = useState("");

  useEffect(() => {
    if (authStatus !== "authenticated" || authUser?.role === "admin") return;
    let active = true;
    void apiRequest("/admin/users").then(() => {
      if (!active || !authUser) return;
      setUser({ ...authUser, role: "admin" });
      setVerify("allowed");
    }).catch((err) => {
      if (!active) return;
      setError(err instanceof Error ? err.message : t("admin.unauthorized"));
      setVerify("denied");
    });
    return () => { active = false; };
  }, [authStatus, authUser, setUser, t]);

  if (authStatus === "unknown" || authStatus === "checking") {
    return <div className="min-h-screen bg-background p-6"><LoadingBlock label={t("admin.load")} /></div>;
  }

  if (authStatus !== "authenticated") {
    return <AdminDenied message={t("admin.unauthorized")} onBack={() => router.push("/login")} />;
  }

  if (authUser?.role !== "admin" && verify !== "allowed") {
    if (verify === "denied") {
      return <AdminDenied message={error || t("admin.unauthorized")} onBack={() => router.push("/")} />;
    }
    return <div className="min-h-screen bg-background p-6"><LoadingBlock label={t("admin.load")} /></div>;
  }

  const nav = [
    ["/admin", t("admin.dashboard"), LayoutDashboard],
    ["/admin/products", t("admin.products"), Package],
    ["/admin/orders", t("admin.orders"), ShoppingCart],
    ["/admin/users", t("admin.users"), Users],
    ["/admin/categories", t("admin.categories"), Tags]
  ] as const;

  const logout = async () => {
    await useAuth.getState().logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 start-0 hidden w-64 border-e border-border bg-surface p-5 lg:flex lg:flex-col">
        <Link href="/" className="text-lg font-black tracking-[.22em]">VANTA</Link>
        <p className="mt-2 text-xs text-muted-foreground">{t("admin.title")}</p>
        <nav className="mt-8 grid gap-1" aria-label={t("nav.primary")}>
          {nav.map(([href, label, Icon]) => (
            <Link key={href} href={href} className={"flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold " + (pathname === href ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
              <Icon className="size-4" aria-hidden />{label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto grid gap-2">
          <button type="button" onClick={() => theme.switchTheme()} className="min-h-10 rounded-xl px-3 text-start text-xs font-semibold hover:bg-muted">
            {theme.theme === "dark" ? t("admin.light") : t("admin.dark")}
          </button>
          <button type="button" onClick={() => void logout()} className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold hover:bg-muted">
            <LogOut className="size-4" aria-hidden />{t("account.logout")}
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:ps-64">
        <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <div>
              <p className="text-xs text-muted-foreground">{t("admin.title")}</p>
              <p className="text-sm font-semibold">{authUser?.name}</p>
            </div>
            <Link href="/" className="grid size-10 place-items-center rounded-full hover:bg-muted" aria-label={t("nav.home")}>
              {locale === "ar" ? <ArrowRight className="size-4" aria-hidden /> : <ArrowLeft className="size-4" aria-hidden />}
            </Link>
          </div>
        </header>
        <nav className="border-b border-border bg-surface px-3 py-2 lg:hidden" aria-label={t("nav.primary")}>
          <div className="flex gap-1 overflow-x-auto scrollbar-thin">
            {nav.map(([href, label]) => (
              <Link key={href} href={href} className={"shrink-0 rounded-full px-4 py-2 text-xs font-semibold " + (pathname === href ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>{label}</Link>
            ))}
          </div>
        </nav>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

function AdminDenied({ message, onBack }: { message: string; onBack: () => void }) {
  return <main className="min-h-screen bg-background p-6"><div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center"><div className="surface-card w-full p-8 text-center"><h1 className="text-2xl font-semibold">VANTA</h1><p className="mt-4 text-sm text-muted-foreground">{message}</p><button type="button" onClick={onBack} className="mt-7 min-h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">Continue</button></div></div></main>;
}
