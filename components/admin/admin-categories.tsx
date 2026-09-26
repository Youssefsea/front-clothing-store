"use client";

import { useEffect, useMemo, useState } from "react";
import { Tags } from "lucide-react";
import { apiRequest } from "@/lib/api";
import type { Product } from "@/types/domain";
import { LoadingBlock, ErrorBlock } from "@/components/ui/feedback";
import { useLang } from "@/components/transitions/language-provider";

export function AdminCategories(){
  const {t}=useLang();const [products,setProducts]=useState<Product[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
  useEffect(()=>{apiRequest<{allProducts?:Product[]}>("/products").then(r=>setProducts(Array.isArray(r.allProducts)?r.allProducts:[])).catch(e=>setError(e instanceof Error?e.message:t("common.network"))).finally(()=>setLoading(false))},[t]);
  const categories=useMemo(()=>{const map=new Map<string,number>();products.forEach(p=>map.set(p.category_name,(map.get(p.category_name)||0)+1));return [...map.entries()].sort((a,b)=>a[0].localeCompare(b[0]))},[products]);
  if(loading)return <LoadingBlock label={t("common.loading")}/>;
  if(error)return <ErrorBlock message={error}/>;
  return <div><p className="text-xs font-semibold uppercase tracking-[.25em] text-muted-foreground">VANTA / ADMIN</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">{t("admin.categories")}</h1><div className="mt-5 rounded-3xl border border-border bg-muted p-5"><p className="text-sm leading-7 text-foreground">{t("admin.noCategoryApi")}</p></div><div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{categories.map(([name,count])=><div key={name} className="surface-card p-6"><Tags className="size-5 text-muted-foreground" aria-hidden/><h2 className="mt-5 text-lg font-semibold">{name}</h2><p className="mt-1 text-sm text-muted-foreground">{count} product(s)</p></div>)}</div></div>;
}
