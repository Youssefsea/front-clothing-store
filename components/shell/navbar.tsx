"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Languages, Menu, Moon, Search, ShoppingBag, Sun, UserRound, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useLang } from "@/components/transitions/language-provider";
import { useTheme } from "@/components/transitions/theme-provider";
import { useAuth } from "@/stores/auth-store";
import { useCart } from "@/stores/cart-store";
import { MobileMenu } from "@/components/shell/mobile-menu";

export function Navbar() {
  const { locale, t, switchLocale, switching: localeSwitching } = useLang();
  const { theme, switchTheme, switching: themeSwitching } = useTheme();
  const auth=useAuth();const cart=useCart();const pathname=usePathname();const router=useRouter();
  const [scrolled,setScrolled]=useState(false);const [searchOpen,setSearchOpen]=useState(false);const [query,setQuery]=useState("");const [menuOpen,setMenuOpen]=useState(false);
  useEffect(()=>{const onScroll=()=>setScrolled(window.scrollY>24);window.addEventListener("scroll",onScroll,{passive:true});return()=>window.removeEventListener("scroll",onScroll)},[]);
  useEffect(()=>{const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape"){setSearchOpen(false);setMenuOpen(false)}};document.addEventListener("keydown",onKey);return()=>document.removeEventListener("keydown",onKey)},[]);
  useEffect(()=>{document.body.style.overflow=menuOpen||searchOpen?"hidden":"";return()=>{document.body.style.overflow=""}},[menuOpen,searchOpen]);

  const showOverlay=pathname==="/"&&!scrolled;const accountHref=auth.status==="authenticated"?"/account":"/login";
  const links=useMemo(()=>[{href:"/",label:t("nav.home")},{href:"/shop",label:t("nav.shop")},...(auth.status==="authenticated"?[{href:"/orders",label:t("nav.orders")}]:[]),...(auth.user?.role==="admin"?[{href:"/admin",label:t("nav.admin")}]:[])],[auth.status,auth.user?.role,t]);
  return <>
    <header className={showOverlay?"fixed inset-x-0 top-0 z-50 text-white":"sticky top-0 z-50 border-b border-border bg-background/90 text-foreground backdrop-blur-xl"}>
      <div className="site-container flex min-h-20 items-center justify-between gap-5">
        <Link href="/" className="shrink-0 text-xl font-black tracking-[.22em]" aria-label="VANTA home">VANTA</Link>
        <nav className="hidden items-center gap-7 lg:flex" aria-label={t("nav.primary")}>{links.map(link=><Link key={link.href} href={link.href} className="group relative text-sm font-medium opacity-80 transition hover:opacity-100">{link.label}<span className="absolute -bottom-2 start-0 h-px w-0 bg-current transition-all duration-300 group-hover:w-full"/></Link>)}</nav>
        <div className="hidden items-center gap-1.5 lg:flex">
          <button type="button" onClick={()=>setSearchOpen(true)} className="grid size-10 place-items-center rounded-full hover:bg-white/10" aria-label={t("nav.search")}><Search className="size-4" aria-hidden/></button>
          <button type="button" disabled={themeSwitching} onClick={(e)=>switchTheme({x:e.clientX,y:e.clientY})} className="grid size-10 place-items-center rounded-full hover:bg-white/10 disabled:opacity-50" aria-label={t("nav.theme")}>{theme==="dark"?<Sun className="size-4"/>:<Moon className="size-4" />}</button>
          <button type="button" disabled={localeSwitching} onClick={(e)=>switchLocale({x:e.clientX,y:e.clientY})} className="inline-flex h-10 items-center gap-2 rounded-full px-3 text-xs font-semibold hover:bg-white/10 disabled:opacity-50" aria-label={t("nav.language")}><Languages className="size-4" aria-hidden/>{locale==="en"?"AR":"EN"}</button>
          <Link href="/cart" className="relative grid size-10 place-items-center rounded-full hover:bg-white/10" aria-label={t("nav.cart")}><ShoppingBag className="size-4" aria-hidden/>{cart.count>0&&<span className="absolute -end-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{cart.count}</span>}</Link>
          <Link href={accountHref} className="grid size-10 place-items-center rounded-full hover:bg-white/10" aria-label={t("nav.account")}><UserRound className="size-4" aria-hidden/></Link>
        </div>
        <div className="flex items-center gap-1 lg:hidden"><Link href="/cart" className="relative grid size-10 place-items-center rounded-full" aria-label={t("nav.cart")}><ShoppingBag className="size-5" aria-hidden/>{cart.count>0&&<span className="absolute end-0 top-0 grid min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{cart.count}</span>}</Link><button type="button" onClick={()=>setMenuOpen(true)} className="grid size-10 place-items-center rounded-full" aria-label={t("nav.openMenu")}><Menu className="size-5" aria-hidden/></button></div>
      </div>
    </header>
    <AnimatePresence>{searchOpen&&<motion.div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} role="presentation" onMouseDown={(e)=>{if(e.target===e.currentTarget)setSearchOpen(false)}}><motion.div className="mx-auto mt-24 w-[min(92%,720px)] rounded-[28px] bg-background p-5 text-foreground shadow-2xl" initial={{y:-20,opacity:0}} animate={{y:0,opacity:1}} exit={{y:-10,opacity:0}} role="dialog" aria-modal="true" aria-label={t("nav.search")}><form onSubmit={(e)=>{e.preventDefault();const q=query.trim();if(q)router.push("/shop?q="+encodeURIComponent(q));setSearchOpen(false)}}><div className="flex items-center gap-3"><Search className="size-5 text-muted-foreground" aria-hidden/><input value={query} onChange={(e)=>setQuery(e.target.value)} autoFocus className="min-h-12 flex-1 bg-transparent text-xl outline-none" placeholder={t("search.placeholder")} aria-label={t("nav.search")}/><button type="button" onClick={()=>setSearchOpen(false)} className="grid size-10 place-items-center rounded-full hover:bg-muted" aria-label={t("common.close")}><X className="size-5" aria-hidden/></button></div></form></motion.div></motion.div>}</AnimatePresence>
    <MobileMenu open={menuOpen} onClose={()=>setMenuOpen(false)}/>
  </>;
}
