/* eslint-disable react-hooks/set-state-in-effect -- async remote-state lifecycle is intentional in this client feature */
"use client";
import {createContext,useContext,useEffect,useState} from "react";
import {api,ApiError} from "../lib/api";
import {translate} from "../lib/i18n";
import type {AuthStatus,Locale,Theme,User} from "../lib/types";
import {safeJsonParse} from "../lib/utils";
import {useCartStore,useUiStore} from "../stores/store";

type Point={x:number;y:number};
interface LocaleValue{locale:Locale;direction:"ltr"|"rtl";t:(key:string)=>string;switchLocale:(point?:Point)=>void;transitioning:boolean}
interface ThemeValue{theme:Theme;toggleTheme:(point?:Point)=>void;transitioning:boolean}
interface AuthValue{user:User|null;status:AuthStatus;error:string|null;refresh:()=>Promise<void>;login:(email:string,password:string)=>Promise<User>;logout:()=>Promise<void>;setUser:(user:User)=>void}
const LocaleCtx=createContext<LocaleValue|null>(null);
const ThemeCtx=createContext<ThemeValue|null>(null);
const AuthCtx=createContext<AuthValue|null>(null);

function persistCookie(name:string,value:string){document.cookie=`${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax`}

export function AppProviders({children,initialLocale,initialTheme}:{children:React.ReactNode;initialLocale:Locale;initialTheme:Theme}){
  const[locale,setLocale]=useState(initialLocale);const[theme,setTheme]=useState(initialTheme);
  const[localeTransitioning,setLocaleTransitioning]=useState(false);const[themeTransitioning,setThemeTransitioning]=useState(false);
  const[user,setUserState]=useState<User|null>(null);const[status,setStatus]=useState<AuthStatus>("checking");const[error,setError]=useState<string|null>(null);

  useEffect(()=>{document.documentElement.lang=locale;document.documentElement.dir=locale==="ar"?"rtl":"ltr";persistCookie("vanta_locale",locale)},[locale]);
  useEffect(()=>{document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;persistCookie("vanta_theme",theme)},[theme]);

  const animateToggle=(id:string,point:Point,duration:number,change:()=>void,done:()=>void)=>{
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){change();done();return}
    const el=document.getElementById(id);
    if(!el){change();done();return}
    el.style.setProperty("--wave-x",point.x+"px");el.style.setProperty("--wave-y",point.y+"px");el.style.display="block";
    setTimeout(change,duration);setTimeout(()=>{el.style.display="none";done()},duration+480)
  };
  const switchLocale=(point:Point={x:window.innerWidth/2,y:52})=>{if(localeTransitioning)return;setLocaleTransitioning(true);const next=locale==="en"?"ar":"en";animateToggle("vanta-locale-wave",point,250,()=>setLocale(next),()=>setLocaleTransitioning(false))};
  const toggleTheme=(point:Point={x:window.innerWidth-70,y:52})=>{if(themeTransitioning)return;setThemeTransitioning(true);const next=theme==="light"?"dark":"light";animateToggle("vanta-theme-wave",point,220,()=>setTheme(next),()=>setThemeTransitioning(false))};

  const setUser=(next:User)=>{setUserState(next);sessionStorage.setItem("vanta_session",JSON.stringify(next))};
  const refresh=useCallback(async()=>{
    try{
      const session=await api.auth.session();
      const stored=safeJsonParse<User|null>(sessionStorage.getItem("vanta_session"),null);
      const next:User={id:stored?.id||0,name:session.name,email:session.email,phone:stored?.phone,role:stored?.role};
      setUserState(next);sessionStorage.setItem("vanta_session",JSON.stringify(next));setError(null);setStatus("authenticated");
      await useCartStore.getState().sync();
    }catch(e){
      if(e instanceof ApiError&&e.status===401){setUserState(null);sessionStorage.removeItem("vanta_session");useCartStore.getState().clear();setError(null);setStatus("unauthenticated")}
      else {setError(e instanceof Error?e.message:"Could not verify your session.");setStatus("error")}
    }
  };
  useEffect(()=>{void refresh()},[]);

  const login=async(email:string,password:string)=>{const response=await api.auth.login(email,password);setUser(response.user);setError(null);setStatus("authenticated");await useCartStore.getState().sync();return response.user};
  const logout=async()=>{try{await api.auth.logout()}finally{setUserState(null);sessionStorage.removeItem("vanta_session");useCartStore.getState().clear();setError(null);setStatus("unauthenticated")}};

  const localeValue:LocaleValue={locale,direction:locale==="ar"?"rtl":"ltr",t:(key)=>translate(locale,key),switchLocale,transitioning:localeTransitioning};
  const themeValue:ThemeValue={theme,toggleTheme,transitioning:themeTransitioning};
  const authValue:AuthValue={user,status,error,refresh,login,logout,setUser};
  return <LocaleCtx.Provider value={localeValue}><ThemeCtx.Provider value={themeValue}><AuthCtx.Provider value={authValue}>{children}</AuthCtx.Provider></ThemeCtx.Provider></LocaleCtx.Provider>;
}
export function useI18n(){const value=useContext(LocaleCtx);if(!value)throw new Error("useI18n must be used within AppProviders");return value}
export function useTheme(){const value=useContext(ThemeCtx);if(!value)throw new Error("useTheme must be used within AppProviders");return value}
export function useAuth(){const value=useContext(AuthCtx);if(!value)throw new Error("useAuth must be used within AppProviders");return value}
export function ToastViewport(){const{toasts,dismiss}=useUiStore();return <div className="toast-viewport" aria-live="polite" aria-atomic="false">{toasts.map(toast=><button type="button" key={toast.id} className={"toast toast-"+toast.tone} onClick={()=>dismiss(toast.id)}>{toast.message}</button>)}</div>}
