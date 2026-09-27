"use client";
import Link from "next/link";
import {Menu,Search,ShoppingBag,Sun,Moon,UserRound,ShieldCheck} from "lucide-react";
import {useLocale} from "@/components/locale-provider";
import {useTheme} from "@/components/theme-provider";
import {useAuth} from "@/components/auth-provider";
import {useCartStore} from "@/stores/cart";
import {MobileNav} from "@/components/mobile-nav";
import {useState} from "react";
export function Navbar({onSearch,onCart}:{onSearch:()=>void;onCart:()=>void}){
 const{t,locale,switchLocale}=useLocale();const{theme,toggle}=useTheme();const{status,role}=useAuth();const[open,setOpen]=useState(false);const items=useCartStore(s=>s.items);
 const count=items.reduce((n,i)=>n+i.quantity,0);
 const lang=(e:React.MouseEvent<HTMLButtonElement>)=>{const r=e.currentTarget.getBoundingClientRect();switchLocale(locale==="en"?"ar":"en",{x:(r.left+r.width/2)/innerWidth*100,y:(r.top+r.height/2)/innerHeight*100})};
 return <><header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[color-mix(in_srgb,var(--bg)_88%,transparent)] backdrop-blur-xl"><div className="container-vanta flex min-h-20 items-center justify-between gap-5"><Link href="/" className="shrink-0 text-xl font-black tracking-[.28em]">VANTA</Link><nav className="hidden items-center gap-7 md:flex" aria-label="Primary"><Link href="/" className="text-sm font-medium hover:opacity-60">{t("nav.home")}</Link><Link href="/shop" className="text-sm font-medium hover:opacity-60">{t("nav.shop")}</Link>{status==="authenticated"&&<Link href="/orders" className="text-sm font-medium hover:opacity-60">{t("nav.orders")}</Link>}</nav><div className="flex items-center gap-1"><button className="icon-btn" onClick={onSearch} aria-label={t("nav.search")}><Search size={19}/></button><button className="icon-btn" onClick={()=>toggle()} aria-label="Toggle theme">{theme==="dark"?<Sun size={18}/>:<Moon size={18}/>}</button><button className="icon-btn hidden md:inline-flex" onClick={lang} aria-label="Switch language">{locale==="en"?"ع":"EN"}</button><Link className="icon-btn hidden md:inline-flex" href={status==="authenticated"?"/account":"/login"} aria-label={t("nav.account")}><UserRound size={18}/></Link>{role==="admin"&&<Link className="icon-btn hidden md:inline-flex" href="/admin" aria-label={t("nav.admin")}><ShieldCheck size={18}/></Link>}{status==="authenticated"&&<button className="icon-btn relative" onClick={onCart} aria-label={t("nav.cart")}><ShoppingBag size={19}/>{count>0&&<span className="absolute -top-1 -end-1 min-w-4 bg-[var(--fg)] px-1 text-[10px] leading-4 text-[var(--bg)]">{count>99?"99+":count}</span>}</button>}<button className="icon-btn md:hidden" onClick={()=>setOpen(true)} aria-label={t("nav.menu")}><Menu size={20}/></button></div></div></header><MobileNav open={open} onClose={()=>setOpen(false)}/></>;
}
