"use client";
import {createContext,useCallback,useContext,useEffect,useMemo,useState} from "react";
import type {AuthStatus,Role,User} from "@/types";
import {authService} from "@/services/auth";
import {ApiError} from "@/services/api";
import {safeReadJson,safeRemove,safeWriteString} from "@/lib/storage";
type Ctx={status:AuthStatus;user:User|null;role:Role|null;sessionError:string|null;refresh:()=>Promise<void>;setAdminRole:()=>void;login:(b:{email:string;password:string})=>Promise<User>;logout:()=>Promise<void>};
const C=createContext<Ctx|null>(null);
export function AuthProvider({children}:{children:React.ReactNode}){
 const[status,setStatus]=useState<AuthStatus>("unknown");const[user,setUser]=useState<User|null>(null);const[role,setRole]=useState<Role|null>(null);const[sessionError,setSessionError]=useState<string|null>(null);
 const refresh=useCallback(async()=>{setStatus("unknown");setSessionError(null);try{const s=await authService.session();const saved=safeReadJson<{id?:number|string;phone?:string;role?:Role}>(sessionStorage,"vanta-session",{});setUser({name:s.name,email:s.email,id:saved.id,phone:saved.phone,role:saved.role});setRole(saved.role??null);setStatus("authenticated")}catch(e){if(e instanceof ApiError&&e.status===401){setUser(null);setRole(null);setSessionError(null);setStatus("unauthenticated")}else{setUser(null);setRole(null);setSessionError(e instanceof Error?e.message:"NETWORK_ERROR");setStatus("unauthenticated")}}},[]);
 useEffect(()=>{void refresh()},[refresh]);
 const login=useCallback(async(b:{email:string;password:string})=>{const r=await authService.login(b);setUser(r.user);setRole(r.user.role??null);setSessionError(null);safeWriteString(sessionStorage,"vanta-session",JSON.stringify({id:r.user.id,phone:r.user.phone,role:r.user.role}));setStatus("authenticated");return r.user},[]);
 const logout=useCallback(async()=>{try{await authService.logout()}finally{safeRemove(sessionStorage,"vanta-session");setUser(null);setRole(null);setSessionError(null);setStatus("unauthenticated")}},[]);
 const setAdminRole=useCallback(()=>{setRole("admin");setUser(u=>u?{...u,role:"admin"}:u);const current=safeReadJson<Record<string,unknown>>(sessionStorage,"vanta-session",{});safeWriteString(sessionStorage,"vanta-session",JSON.stringify({...current,role:"admin"}))},[]);
 return <C.Provider value={useMemo(()=>({status,user,role,sessionError,refresh,setAdminRole,login,logout}),[status,user,role,sessionError,refresh,setAdminRole,login,logout])}>{children}</C.Provider>;
}
export function useAuth(){const c=useContext(C);if(!c)throw new Error("useAuth outside provider");return c;}
