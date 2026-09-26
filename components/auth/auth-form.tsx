"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/stores/auth-store";
import { useLang } from "@/components/transitions/language-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorBlock, SuccessNotice } from "@/components/ui/feedback";
import type { User } from "@/types/domain";

export function AuthForm({ mode }: { mode:"login"|"signup" }) {
  const {t}=useLang();const router=useRouter();const auth=useAuth();
  const [name,setName]=useState("");const [email,setEmail]=useState("");const [password,setPassword]=useState("");const [phone,setPhone]=useState("");const [otp,setOtp]=useState("");const [otpStage,setOtpStage]=useState(false);const [show,setShow]=useState(false);const [loading,setLoading]=useState(false);const [error,setError]=useState("");const [notice,setNotice]=useState("");
  useEffect(()=>{if(mode==="login"&&window.location.search.includes("created=1"))setNotice(t("auth.signupSuccess"))},[mode,t]);

  const submitLogin=async()=>{
    if(!email||password.length<6){setError(t("common.required"));return;}
    try{setLoading(true);setError("");const response=await apiRequest<{user:User}>("/login",{method:"POST",body:{email,password}});auth.setUser(response.user);setNotice(t("auth.loginSuccess"));router.push("/account");}catch(err){setError(err instanceof Error?err.message:t("common.error"))}finally{setLoading(false)}
  };
  const sendOtp=async()=>{
    if(!email||!phone){setError(t("common.required"));return;}
    try{setLoading(true);setError("");await apiRequest("/send-otp",{method:"POST",body:{email,phone}});setOtpStage(true);setNotice(t("auth.otpSent"));}catch(err){setError(err instanceof Error?err.message:t("common.error"))}finally{setLoading(false)}
  };
  const submitSignup=async()=>{
    if(!name||!email||phone.length<10||password.length<6||!/^\d{6}$/.test(otp)){setError(t("common.required"));return;}
    try{setLoading(true);setError("");await apiRequest("/signup",{method:"POST",body:{name,email,password,phone,otp}});router.replace("/login?created=1");}catch(err){setError(err instanceof Error?err.message:t("common.error"))}finally{setLoading(false)}
  };

  return (
    <main className="site-container flex min-h-[76vh] items-center py-14">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[30px] border border-border bg-surface shadow-[var(--shadow)] md:grid-cols-[.9fr_1.1fr]">
        <div className="hidden min-h-[560px] bg-primary p-10 text-primary-foreground md:flex md:flex-col md:justify-between"><span className="text-xl font-black tracking-[.22em]">VANTA</span><div><p className="text-xs uppercase tracking-[.25em] opacity-60">VANTA / MEMBER AREA</p><p className="mt-3 text-4xl font-semibold leading-tight">{mode==="login"?t("auth.login"):t("auth.signup")}</p></div></div>
        <div className="p-6 sm:p-10 md:p-12">
          <div><p className="text-xs font-semibold uppercase tracking-[.22em] text-muted-foreground">VANTA</p><h1 className="mt-3 text-3xl font-semibold tracking-tight">{mode==="login"?t("auth.login"):t("auth.signup")}</h1></div>
          {notice&&<div className="mt-6"><SuccessNotice message={notice}/></div>}{error&&<div className="mt-6"><ErrorBlock message={error}/></div>}
          <form className="mt-7 space-y-5" onSubmit={(e)=>{e.preventDefault();void(mode==="login"?submitLogin():(otpStage?submitSignup():sendOtp()))}}>
            {mode==="signup"&&<Field label={t("auth.name")} value={name} onChange={setName} icon={<UserRound className="size-4" aria-hidden/>} autoComplete="name"/>}
            <Field label={t("auth.email")} value={email} onChange={setEmail} type="email" icon={<Mail className="size-4" aria-hidden/>} autoComplete="email"/>
            {mode==="signup"&&<Field label={t("auth.phone")} value={phone} onChange={(v)=>setPhone(v.replace(/\D/g,"").slice(0,15))} icon={<Phone className="size-4" aria-hidden/>} inputMode="tel" autoComplete="tel"/>}
            <div><label className="text-sm font-semibold">{t("auth.password")}</label><div className="relative mt-2"><LockKeyhole className="absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden/><Input type={show?"text":"password"} value={password} onChange={(e)=>setPassword(e.target.value)} minLength={6} className="ps-10 pe-11" autoComplete={mode==="login"?"current-password":"new-password"} placeholder={t("auth.passwordHint")}/><button type="button" onClick={()=>setShow(v=>!v)} className="absolute end-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full hover:bg-muted" aria-label={show?"Hide password":"Show password"}>{show?<EyeOff className="size-4"/>:<Eye className="size-4"/>}</button></div></div>
            {mode==="signup"&&otpStage&&<Field label={t("auth.otp")} value={otp} onChange={(v)=>setOtp(v.replace(/\D/g,"").slice(0,6))} icon={<Mail className="size-4" aria-hidden/>} inputMode="numeric" autoComplete="one-time-code" maxLength={6}/>}
            <Button disabled={loading} type="submit" className="w-full">{loading?t("auth.signing"):mode==="login"?t("auth.login"):(otpStage?t("auth.create"):t("auth.sendOtp"))}</Button>
          </form>
          <p className="mt-7 text-sm text-muted-foreground">{mode==="login"?t("auth.noAccount"):t("auth.haveAccount")} <Link href={mode==="login"?"/signup":"/login"} className="font-semibold text-foreground underline underline-offset-4">{mode==="login"?t("auth.signup"):t("auth.login")}</Link></p>
        </div>
      </div>
    </main>
  );
}

function Field({label,value,onChange,icon,type="text",...props}:{label:string;value:string;onChange:(v:string)=>void;icon:React.ReactNode;type?:string}&Omit<React.InputHTMLAttributes<HTMLInputElement>,"value"|"onChange"|"type">){
  return <div><label className="text-sm font-semibold">{label}</label><div className="relative mt-2"><span className="absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span><Input type={type} value={value} onChange={(e)=>onChange(e.target.value)} className="ps-10" {...props}/></div></div>;
}
