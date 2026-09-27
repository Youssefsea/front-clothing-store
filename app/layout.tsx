import type {Metadata} from "next";
import "./globals.css";
import {AppProviders} from "@/components/app-providers";
import {SiteShell} from "@/components/site-shell";
export const metadata:Metadata={title:"VANTA — Modern Essentials",description:"A premium clothing storefront powered by the VANTA API."};
const bootstrap="(()=>{try{const l=localStorage.getItem('vanta-locale');if(l==='ar'||l==='en'){document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr'}const t=localStorage.getItem('vanta-theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch{}})()";
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" dir="ltr" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:bootstrap}}/></head><body suppressHydrationWarning><AppProviders><SiteShell>{children}</SiteShell></AppProviders></body></html>;}
