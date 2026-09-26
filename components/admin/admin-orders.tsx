"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Search, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useLang } from "@/components/transitions/language-provider";
import type { Order } from "@/types/domain";
import { formatPrice, safeNumber } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorBlock, LoadingBlock } from "@/components/ui/feedback";

export function AdminOrders(){
  const {t}=useLang();const [orders,setOrders]=useState<Order[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState("");const [query,setQuery]=useState("");
  const load=useCallback(()=>{setLoading(true);apiRequest<{orders?:Order[]}>("/admin/orders").then(r=>setOrders(Array.isArray(r.orders)?r.orders:[])).catch(e=>setError(e instanceof Error?e.message:t("common.network"))).finally(()=>setLoading(false))},[t]);
  useEffect(()=>{void load()},[load]);
  const visible=useMemo(()=>orders.filter(o=>[o.id,o.customer_name,o.customer_email,o.status].some(v=>String(v??"").toLowerCase().includes(query.toLowerCase()))),[orders,query]);
  const update=async(id:Order["id"],status:string)=>{try{await apiRequest("/admin/orders/status",{method:"PUT",body:{order_id:Number(id),status}});setOrders(prev=>prev.map(o=>o.id===id?{...o,status}:o))}catch(err){setError(err instanceof Error?err.message:t("common.error"))}};
  return <div><div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.25em] text-muted-foreground">VANTA / ADMIN</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">{t("admin.orders")}</h1></div><Button variant="secondary" onClick={load}><RefreshCw className="size-4" aria-hidden/>{t("common.retry")}</Button></div>{error&&<div className="mt-5"><ErrorBlock message={error}/></div>}<div className="mt-7 flex max-w-xl items-center gap-2"><Search className="size-4 text-muted-foreground" aria-hidden/><Input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder={t("admin.search")+"…"}/></div>{loading?<div className="mt-5"><LoadingBlock label={t("common.loading")}/></div>:<div className="mt-5 overflow-x-auto rounded-3xl border border-border bg-surface"><table className="min-w-[900px] w-full text-sm"><thead><tr className="border-b border-border text-xs text-muted-foreground"><th className="px-5 py-4 text-start">ID</th><th className="px-5 py-4 text-start">Customer</th><th className="px-5 py-4 text-start">Date</th><th className="px-5 py-4 text-start">Total</th><th className="px-5 py-4 text-start">Status</th></tr></thead><tbody>{visible.map(o=><tr key={String(o.id)} className="border-b border-border last:border-0"><td className="px-5 py-4 font-semibold">#{o.id}</td><td className="px-5 py-4"><p>{o.customer_name||"—"}</p><p className="mt-1 text-xs text-muted-foreground">{o.customer_email||"—"}</p></td><td className="px-5 py-4 text-muted-foreground">{o.created_at?new Date(o.created_at).toLocaleString():"—"}</td><td className="px-5 py-4 font-semibold">{formatPrice(safeNumber(o.total))}</td><td className="px-5 py-4"><select value={o.status} onChange={(e)=>void update(o.id,e.target.value)} className="min-h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold"><option value={o.status}>{o.status}</option>{ORDER_STATUSES.filter(s=>s!==o.status).map(s=><option key={s} value={s}>{s}</option>)}</select></td></tr>)}</tbody></table></div>}</div>;
}
