"use client";
import {createContext,useContext,useEffect,useMemo,useState,useTransition} from "react";
import type {Locale} from "@/types";
import {createT,type TKey} from "@/lib/i18n";
import {safeReadString,safeWriteString} from "@/lib/storage";
type Ctx={locale:Locale;dir:"ltr"|"rtl";t:(key:TKey)=>string;switchLocale:(next:Locale,point?:{x:number;y:number})=>void;transitioning:boolean;origin:{x:number;y:number}};
const C=createContext<Ctx|null>(null);
export function LocaleProvider({children}:{children:React.ReactNode}){
 const [locale,setLocale]=useState<Locale>("en");const [transitioning,setTransitioning]=useState(false);const [origin,setOrigin]=useState({x:50,y:50});const [,startTransition]=useTransition();
 useEffect(()=>{const next=safeReadString(localStorage,"vanta-locale")==="ar"?"ar":"en";setLocale(next);document.documentElement.lang=next;document.documentElement.dir=next==="ar"?"rtl":"ltr";},[]);
 const switchLocale=(next:Locale,point={x:50,y:50})=>{if(next===locale||transitioning)return;setOrigin(point);setTransitioning(true);window.setTimeout(()=>{startTransition(()=>setLocale(next));document.documentElement.lang=next;document.documentElement.dir=next==="ar"?"rtl":"ltr";safeWriteString(localStorage,"vanta-locale",next)},300);window.setTimeout(()=>setTransitioning(false),760);};
 const value=useMemo(()=>({locale,dir:locale==="ar"?"rtl":"ltr",t:createT(locale),switchLocale,transitioning,origin}),[locale,transitioning,origin]);
 return <C.Provider value={value}>{children}</C.Provider>;
}
export function useLocale(){const c=useContext(C);if(!c)throw new Error("useLocale outside provider");return c;}
