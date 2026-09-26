"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Languages, Moon, Sun, X } from "lucide-react";
import { useLang } from "@/components/transitions/language-provider";
import { useTheme } from "@/components/transitions/theme-provider";
import { useAuth } from "@/stores/auth-store";

export function MobileMenu({ open, onClose }: { open:boolean; onClose:()=>void }) {
  const { t, locale, switchLocale, switching: localeSwitching } = useLang(); const { theme, switchTheme, switching: themeSwitching } = useTheme(); const auth=useAuth(); const closeRef=useRef<HTMLButtonElement>(null);
  useEffect(()=>{if(open)closeRef.current?.focus()},[open]);
  const links=[["/",t("nav.home")],["/shop",t("nav.shop")],...(auth.status==="authenticated"?[["/orders",t("nav.orders")],["/account",t("nav.account")]]:[["/login",t("nav.login")]]),...(auth.user?.role==="admin"?[["/admin",t("nav.admin")]]:[])] as Array<[string,string]>;
  return <AnimatePresence>{open&&<motion.div className="fixed inset-0 z-[70] lg:hidden" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><button type="button" className="absolute inset-0 bg-black/60" onClick={onClose} aria-label={t("common.close")}/><motion.aside initial={{x:locale==="ar"?"100%":"-100%"}} animate={{x:0}} exit={{x:locale==="ar"?"100%":"-100%"}} transition={{type:"spring",stiffness:340,damping:32}} className="absolute inset-y-0 start-0 flex w-[min(88vw,380px)] flex-col bg-background p-6 text-foreground shadow-2xl" role="dialog" aria-modal="true" aria-label={t("nav.mobile")}><div className="flex items-center justify-between"><Link href="/" onClick={onClose} className="text-lg font-black tracking-[.22em]">VANTA</Link><button ref={closeRef} type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full bg-muted" aria-label={t("common.close")}><X className="size-5" aria-hidden/></button></div><nav className="mt-10 grid gap-2" aria-label={t("nav.primary")}>{links.map(([href,label])=><Link key={href} href={href} onClick={onClose} className="flex min-h-12 items-center justify-between rounded-2xl px-4 text-lg font-semibold hover:bg-muted">{label}</Link>)}</nav><div className="mt-auto grid gap-2 border-t border-border pt-4"><button type="button" disabled={themeSwitching} onClick={(e)=>switchTheme({x:e.clientX,y:e.clientY})} className="flex min-h-12 items-center justify-between rounded-2xl px-4 hover:bg-muted disabled:opacity-50"><span className="flex items-center gap-3">{theme==="dark"?<Sun className="size-4"/>:<Moon className="size-4"/>}{t("nav.theme")}</span><span className="text-xs text-muted-foreground">{theme}</span></button><button type="button" disabled={localeSwitching} onClick={(e)=>switchLocale({x:e.clientX,y:e.clientY})} className="flex min-h-12 items-center justify-between rounded-2xl px-4 hover:bg-muted disabled:opacity-50"><span className="flex items-center gap-3"><Languages className="size-4"/>{t("nav.language")}</span><span className="text-xs text-muted-foreground">{locale==="en"?"AR":"EN"}</span></button></div></motion.aside></motion.div>}</AnimatePresence>
}
