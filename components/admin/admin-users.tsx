"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Trash2, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useLang } from "@/components/transitions/language-provider";
import type { AdminUser } from "@/types/domain";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorBlock, LoadingBlock } from "@/components/ui/feedback";

export function AdminUsers(){
  const {t}=useLang();const [users,setUsers]=useState<AdminUser[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState("");const [query,setQuery]=useState("");
  const load=useCallback(()=>{apiRequest<{users?:AdminUser[]}>("/admin/users").then(r=>setUsers(Array.isArray(r.users)?r.users:[])).catch(e=>setError(e instanceof Error?e.message:t("common.network"))).finally(()=>setLoading(false))},[t]);
  useEffect(()=>{void load()},[load]);
  const visible=useMemo(()=>users.filter(u=>[u.name,u.email,u.phone,u.role].some(v=>String(v??"").toLowerCase().includes(query.toLowerCase()))),[users,query]);
  const remove=async(id:number)=>{const confirmed=window.confirm("Delete this user?");if(!confirmed)return;try{await apiRequest("/admin/users/delete",{method:"DELETE",body:{user_id:id}});setUsers(prev=>prev.filter(u=>u.id!==id))}catch(err){setError(err instanceof Error?err.message:t("common.error"))}};
  return <div><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.25em] text-muted-foreground">VANTA / ADMIN</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">{t("admin.users")}</h1></div><Button variant="secondary" onClick={load}><RefreshCw className="size-4" aria-hidden/>{t("common.retry")}</Button></div>{error&&<div className="mt-5"><ErrorBlock message={error}/></div>}<div className="mt-7 flex max-w-xl items-center gap-2"><Search className="size-4 text-muted-foreground" aria-hidden/><Input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder={t("admin.search")+"…"}/></div>{loading?<div className="mt-5"><LoadingBlock label={t("common.loading")}/></div>:<div className="mt-5 overflow-x-auto rounded-3xl border border-border bg-surface"><table className="min-w-[820px] w-full text-sm"><thead><tr className="border-b border-border text-xs text-muted-foreground"><th className="px-5 py-4 text-start">{t("admin.user")}</th><th className="px-5 py-4 text-start">{t("admin.phone")}</th><th className="px-5 py-4 text-start">{t("admin.role")}</th><th className="px-5 py-4 text-end">{t("admin.action")}</th></tr></thead><tbody>{visible.map(u=><tr key={u.id} className="border-b border-border last:border-0"><td className="px-5 py-4"><p className="font-semibold">{u.name}</p><p className="mt-1 text-xs text-muted-foreground">{u.email}</p></td><td className="px-5 py-4">{u.phone||"—"}</td><td className="px-5 py-4"><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">{u.role}</span></td><td className="px-5 py-4 text-end"><button type="button" onClick={()=>void remove(Number(u.id))} className="grid size-9 ms-auto place-items-center rounded-full text-danger hover:bg-danger/10" aria-label={t("admin.delete")}><Trash2 className="size-4" aria-hidden/></button></td></tr>)}</tbody></table></div>}</div>;
}
