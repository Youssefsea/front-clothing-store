"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Package } from "lucide-react";
import { useAuth } from "@/stores/auth-store";
import { useLang } from "@/components/transitions/language-provider";
import { apiRequest } from "@/lib/api";
import type { Order } from "@/types/domain";
import { formatPrice, safeNumber } from "@/lib/utils";
import { ApiError } from "@/types/api";
import { ErrorBlock, LoadingBlock } from "@/components/ui/feedback";

export function OrdersClient(){
  const auth=useAuth();const {t}=useLang();const [orders,setOrders]=useState<Order[]>([]);const [status,setStatus]=useState<"loading"|"success"|"error">("loading");const [error,setError]=useState("");
  useEffect(()=>{if(auth.status!=="authenticated")return;let active=true;apiRequest<{orders?:Order[]}>("/orders/orderForUser").then((r)=>{if(!active)return;setOrders(Array.isArray(r.orders)?r.orders:[]);setStatus("success")}).catch((err)=>{if(!active)return;if(err instanceof ApiError && err.status===401){setStatus("success");setOrders([])}else{setError(err instanceof Error?err.message:t("common.network"));setStatus("error")}});return()=>{active=false}},[auth.status,t]);
  if(auth.status==="unknown"||auth.status==="checking")return <main className="site-container py-12"><LoadingBlock label={t("common.loading")}/></main>;
  if(auth.status!=="authenticated")return <main className="site-container py-20 text-center"><h1 className="text-4xl font-semibold">{t("orders.title")}</h1><p className="mt-4 text-muted-foreground">{t("orders.unauthorized")}</p><Link href="/login" className="mt-7 inline-flex min-h-11 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">{t("nav.login")}</Link></main>;
  return <main className="site-container py-12 md:py-16"><p className="text-xs font-semibold uppercase tracking-[.25em] text-muted-foreground">VANTA / ORDERS</p><h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">{t("orders.title")}</h1><div className="mt-10">{status==="loading"&&<LoadingBlock label={t("common.loading")}/>} {status==="error"&&<ErrorBlock message={error} onRetry={()=>window.location.reload()}/>} {status==="success"&&orders.length===0&&<div className="rounded-3xl border border-border bg-surface p-10 text-center"><Package className="mx-auto size-8 text-muted-foreground" aria-hidden/><p className="mt-4 text-sm text-muted-foreground">{t("orders.empty")}</p><Link href="/shop" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">{t("home.shop")}<ArrowUpRight className="size-4" aria-hidden/></Link></div>} {status==="success"&&orders.length>0&&<div className="grid gap-3">{orders.map(order=><OrderCard key={String(order.id)} order={order}/>)}</div>}</div></main>
}
function OrderCard({order}:{order:Order}){const {t}=useLang();const items=order.items??[];return <article className="surface-card p-5 md:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs text-muted-foreground">{t("orders.order")} #{order.id}</p><p className="mt-1 text-sm font-semibold">{order.created_at?new Date(order.created_at).toLocaleString():"—"}</p></div><div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{order.status}</span><span className="text-sm font-semibold">{formatPrice(safeNumber(order.total))}</span></div></div>{items.length>0&&<div className="mt-5 grid gap-2 border-t border-border pt-5">{items.map((item,i)=><div key={item.product_id+"-"+i} className="flex items-center justify-between gap-4 text-sm"><span className="min-w-0 truncate">{item.title||("Product "+item.product_id)}</span><span className="shrink-0 text-muted-foreground">×{item.quantity}</span></div>)}</div>}</article>}
