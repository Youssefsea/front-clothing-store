"use client";
import {createContext,useContext,useEffect,useMemo,useState} from "react";
import type {AuthStatus,Role,User} from "@/types";
import {authService} from "@/services/auth";
import {ApiError} from "@/services/api";
import {safeReadJson,safeRemove,safeWriteString} from "@/lib/storage";
type Ctx={status:AuthStatus;user:User|null;role:Role|null;refresh:()=>Promise<void>;login:(b:{email:string;password:string})=>Promise<User>;logout:()=>Promise<void>};
const C=createContext<Ctx|null>(null);
export function AuthProvider({children}:{children:React.ReactNode}){
 const [status,setStatus]=useState<AuthStatus>("unknown");const [user,setUser]=useState<User|null>(null);const [role,setRole]=useState<Role|null>(null);
 const refresh=async()=>{setStatus("unknown");try{const s=await authService.session();const saved=safeReadJson<{id?:number|string;phone?:string;role?:Role}>(sessionStorage,"vanta-session",{});setUser({name:s.name,email:s.email,id:saved.id,phone:saved.phone,role:saved.role});setRole(saved.role??null);setStatus("authenticated")}catch(e){if(e instanceof ApiError&&e.status===401){setUser(null);setRole(null)}else{setUser(null);setRole(null)}setStatus("unauthenticated")}};
 useEffect(()=>{void refresh()},[]);
 const login=async(b:{email:string;password:string})=>{const r=await authService.login(b);setUser(r.user);setRole(r.user.role??null);safeWriteString(sessionStorage,"vanta-session",JSON.stringify({id:r.user.id,phone:r.user.phone,role:r.user.role}));setStatus("authenticated");return r.user;};
 const logout=async()=>{try{await authService.logout()}finally{safeRemove(sessionStorage,"vanta-session");setUser(null);setRole(null);setStatus("unauthenticated")}};
 return <C.Provider value={useMemo(()=>({status,user,role,refresh,login,logout}),[status,user,role])}>{children}</C.Provider>;
}
export function useAuth(){const c=useContext(C);if(!c)throw new Error("useAuth outside provider");return c;}
