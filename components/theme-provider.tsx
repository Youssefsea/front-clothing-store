"use client";
import {createContext,useContext,useEffect,useMemo,useState} from "react";
import type {ThemeMode} from "@/types";
import {safeWriteString} from "@/lib/storage";
const C=createContext<{theme:ThemeMode;toggle:()=>void}|null>(null);
export function ThemeProvider({children}:{children:React.ReactNode}){
 const [theme,setTheme]=useState<ThemeMode>("light");
 useEffect(()=>{setTheme(document.documentElement.dataset.theme==="dark"?"dark":"light");},[]);
 const toggle=()=>{const next=theme==="dark"?"light":"dark";const apply=()=>{document.documentElement.dataset.theme=next;setTheme(next);safeWriteString(localStorage,"vanta-theme",next)};const doc=document as Document&{startViewTransition?: (cb:()=>void)=>unknown};if(doc.startViewTransition)doc.startViewTransition(apply);else apply();};
 return <C.Provider value={useMemo(()=>({theme,toggle}),[theme])}>{children}</C.Provider>;
}
export function useTheme(){const c=useContext(C);if(!c)throw new Error("useTheme outside provider");return c;}
