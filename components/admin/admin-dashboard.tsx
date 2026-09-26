"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Boxes, ShoppingCart, Users } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { useLang } from "@/components/transitions/language-provider";
import type { Product, Order, AdminUser } from "@/types/domain";
import { formatPrice, safeNumber } from "@/lib/utils";
import { LoadingBlock, ErrorBlock } from "@/components/ui/feedback";

export function AdminDashboard(){
  const {t}=useLang();const [data,setData]=useState<{products:Product[];orders:Order[];users:AdminUser[]}|null>(null);const [error,setError]=useState("");
  useEffect(()=>{let active=true;Promise.all([apiRequest<{allProducts?:Product[]}>("/products"),apiRequest<{orders?:Order[]}>("/admin/orders"),apiRequest<{users?:AdminUser[]}>("/admin/users")]).then(([p,o,u])=>{if(!active)return;setData({products:Array.isArray(p.allProducts)?p.allProducts:[],orders:Array.isArray(o.orders)?o.orders:[],users:Array.isArray(u.users)?u.users:[]})}).catch((err)=>{if(active)setError(err instanceof Error?err.message:t("common.network"))});return()=>{active=false}},[t]);
  if(!data&&!error)return <LoadingBlock label={t("admin.load")}/>;
  if(error)return <ErrorBlock message={error} onRetry={()=>window.location.reload()}/>;
  const total=data?.orders.reduce((sum,o)=>sum+safeNumber(o.total),0)??0;
  const metrics=[[t("admin.totalProducts"),data?.products.length??0,Boxes], [t("admin.totalOrders"),data?.orders.length??0,ShoppingCart], [t("admin.totalUsers"),data?.users.length??0,Users], [t("admin.revenue"),formatPrice(total),ArrowUpRight]] as const;
  return <div><div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.25em] text-muted-foreground">VANTA / ADMIN</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">{t("admin.dashboard")}</h1></div><p className="text-sm text-muted-foreground">{t("admin.metrics")}</p></div><div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label,value,Icon])=><div key={label} className="surface-card p-5"><Icon className="size-5 text-muted-foreground" aria-hidden/><p className="mt-5 text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>)}</div><div className="mt-8 grid gap-3 md:grid-cols-3">{[[t("admin.products"),"/admin/products"],[t("admin.orders"),"/admin/orders"],[t("admin.users"),"/admin/users"]].map(([label,href])=><Link key={href} href={href} className="surface-card flex min-h-28 items-end justify-between p-5 hover:border-foreground"><span className="text-sm font-semibold">{label}</span><ArrowUpRight className="size-4" aria-hidden/></Link>)}</div></div>;
}
