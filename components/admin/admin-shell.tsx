"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LayoutDashboard, Package, ShoppingCart, Users, Tags, LogOut, ArrowLeft, ArrowRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/stores/auth-store";
import { useLang } from "@/components/transitions/language-provider";
import { apiRequest } from "@/lib/api";
import { LoadingBlock, ErrorBlock } from "@/components/ui/feedback";
import { useTheme } from "@/components/transitions/theme-provider";

export function AdminShell({children}:{children:React.ReactNode}){
  const auth=useAuth();const {t,locale}=useLang();const theme=useTheme();const router=useRouter();const pathname=usePathname();const [checking,setChecking]=useState(false);const [allowed,setAllowed]=useState<boolean|null>(null);const [error,setError]=useState("");
  useEffect(()=>{
    if(auth.status!=="authenticated"){setAllowed(null);return;}
    if(auth.user?.role==="admin"){setAllowed(true);return;}
    let active=true;setChecking(true);apiRequest("/admin/users").then(()=>{if(!active)return;const user=auth.user;if(user)auth.setUser({...user,role:"admin"});setAllowed(true)}).catch((err)=>{if(!active)return;setAllowed(false);setError(err instanceof Error?err.message:t("admin.unauthorized"))}).finally(()=>{if(active)setChecking(false)});return()=>{active=false}
  },[auth.status,auth.user?.role,t,auth.setUser]);

  if(auth.status==="unknown"||auth.status==="checking"||checking)return <div className="min-h-screen bg-background p-6"><LoadingBlock label={t("admin.load")}/></div>;
  if(auth.status!=="authenticated")return <AdminDenied message={t("admin.unauthorized")} onBack={()=>router.push("/login")}/>;
  if(allowed!==true)return <AdminDenied message={error||t("admin.unauthorized")} onBack={()=>router.push("/")}/>;

  const nav=[["/admin",t("admin.dashboard"),LayoutDashboard],["/admin/products",t("admin.products"),Package],["/admin/orders",t("admin.orders"),ShoppingCart],["/admin/users",t("admin.users"),Users],["/admin/categories",t("admin.categories"),Tags]] as const;
  const logout=async()=>{await auth.logout();router.push("/")};

  return <div className="min-h-screen bg-background text-foreground"><aside className="fixed inset-y-0 start-0 hidden w-64 border-e border-border bg-surface p-5 lg:flex lg:flex-col"><Link href="/" className="text-lg font-black tracking-[.22em]">VANTA</Link><p className="mt-2 text-xs text-muted-foreground">{t("admin.title")}</p><nav className="mt-8 grid gap-1">{nav.map(([href,label,Icon])=><Link key={href} href={href} className={"flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold " + (pathname===href?"bg-primary text-primary-foreground":"hover:bg-muted")}><Icon className="size-4" aria-hidden/>{label}</Link>)}</nav><div className="mt-auto grid gap-2"><button type="button" onClick={()=>theme.switchTheme()} className="min-h-10 rounded-xl px-3 text-start text-xs font-semibold hover:bg-muted">{theme.theme==="dark"?"Light":"Dark"}</button><button type="button" onClick={()=>void logout()} className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold hover:bg-muted"><LogOut className="size-4" aria-hidden/>{t("account.logout")}</button></div></aside><div className="min-h-screen lg:ps-64"><header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl"><div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6"><div><p className="text-xs text-muted-foreground">{t("admin.title")}</p><p className="text-sm font-semibold">{auth.user?.name}</p></div><div className="flex items-center gap-2"><Link href="/" className="grid size-10 place-items-center rounded-full hover:bg-muted" aria-label={t("nav.home")}>{locale==="ar"?<ArrowRight className="size-4"/>:<ArrowLeft className="size-4"/>}</Link></div></div></header><nav className="border-b border-border bg-surface px-3 py-2 lg:hidden"><div className="flex gap-1 overflow-x-auto scrollbar-thin">{nav.map(([href,label])=><Link key={href} href={href} className={"shrink-0 rounded-full px-4 py-2 text-xs font-semibold " + (pathname===href?"bg-primary text-primary-foreground":"hover:bg-muted")}>{label}</Link>)}</div></nav><main className="p-4 sm:p-6 lg:p-8">{children}</main></div></div>;
}
function AdminDenied({message,onBack}:{message:string;onBack:()=>void}){return <main className="min-h-screen bg-background p-6"><div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center"><div className="surface-card w-full p-8 text-center"><h1 className="text-2xl font-semibold">VANTA</h1><p className="mt-4 text-sm text-muted-foreground">{message}</p><button type="button" onClick={onBack} className="mt-7 min-h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">Continue</button></div></div></main>}
