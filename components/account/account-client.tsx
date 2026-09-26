"use client";

import Link from "next/link";
import { ArrowUpRight, LogOut, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth-store";
import { useLang } from "@/components/transitions/language-provider";
import { LoadingBlock } from "@/components/ui/feedback";
import { Button } from "@/components/ui/button";

export function AccountClient(){
  const {t}=useLang();const auth=useAuth();const router=useRouter();
  if(auth.status==="unknown"||auth.status==="checking")return <main className="site-container py-12"><LoadingBlock label={t("common.loading")}/></main>;
  if(auth.status!=="authenticated"||!auth.user)return <main className="site-container py-20 text-center"><h1 className="text-4xl font-semibold">{t("account.title")}</h1><p className="mt-4 text-muted-foreground">{t("account.loggedOut")}</p><Link href="/login" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">{t("account.login")}<ArrowUpRight className="size-4" aria-hidden/></Link></main>;
  const logout=async()=>{await auth.logout();router.push("/")};
  return <main className="site-container py-12 md:py-16"><div className="max-w-4xl"><p className="text-xs font-semibold uppercase tracking-[.25em] text-muted-foreground">VANTA / ACCOUNT</p><h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">{t("account.title")}</h1></div><div className="mt-10 grid gap-4 md:grid-cols-3"><section className="surface-card p-6 md:col-span-2"><p className="text-xs font-semibold uppercase tracking-[.2em] text-muted-foreground">{t("account.profile")}</p><dl className="mt-6 grid gap-5 sm:grid-cols-2"><Info label={t("account.name")} value={auth.user.name}/><Info label={t("account.email")} value={auth.user.email}/><Info label={t("account.phone")} value={auth.user.phone||"—"}/></dl></section><div className="grid gap-4"><Link href="/orders" className="surface-card flex min-h-28 items-end justify-between p-5 hover:border-foreground"><div><p className="text-sm font-semibold">{t("account.orders")}</p><p className="mt-2 text-xs text-muted-foreground">{t("orders.title")}</p></div><ArrowUpRight className="size-4" aria-hidden/></Link><Link href="/cart" className="surface-card flex min-h-28 items-end justify-between p-5 hover:border-foreground"><div><p className="text-sm font-semibold">{t("account.cart")}</p><p className="mt-2 text-xs text-muted-foreground">{t("cart.title")}</p></div><ShoppingBag className="size-4" aria-hidden/></Link><Button onClick={()=>void logout()} variant="secondary" className="w-full"><LogOut className="size-4" aria-hidden/>{t("account.logout")}</Button></div></div></main>;
}
function Info({label,value}:{label:string;value:string}){return <div><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-semibold break-words">{value}</dd></div>}
