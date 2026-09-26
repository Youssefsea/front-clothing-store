"use client";

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { ChevronDown, Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import type { Product } from "@/types/domain";
import { parseList, safeNumber } from "@/lib/utils";
import { useLang } from "@/components/transitions/language-provider";
import { ProductCard } from "@/components/product/product-card";
import { ErrorBlock, LoadingBlock } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
import { SUPPORTED_SIZES } from "@/lib/constants";

type SortMode="newest"|"price-low"|"price-high";

export function ShopClient() {
  const { t } = useLang();
  const params=useSearchParams();
  const router=useRouter();
  const [products,setProducts]=useState<Product[]>([]);
  const [status,setStatus]=useState<"loading"|"success"|"error">("loading");
  const [error,setError]=useState("");
  const [filtersOpen,setFiltersOpen]=useState(false);
  const [query,setQuery]=useState(params.get("q")||"");
  const [category,setCategory]=useState(params.get("category")||"");
  const [color,setColor]=useState(params.get("color")||"");
  const [size,setSize]=useState(params.get("size")||"");
  const [minPrice,setMinPrice]=useState(params.get("min")||"");
  const [maxPrice,setMaxPrice]=useState(params.get("max")||"");
  const [sort,setSort]=useState<SortMode>((params.get("sort") as SortMode)||"newest");

  useEffect(()=>{let active=true;apiRequest<{allProducts?:Product[]}>("/products").then((data)=>{if(!active)return;setProducts(Array.isArray(data.allProducts)?data.allProducts:[]);setStatus("success")}).catch((err)=>{if(!active)return;setError(err instanceof Error?err.message:t("common.network"));setStatus("error")});return()=>{active=false}},[t]);

  useEffect(()=>{
    const next=new URLSearchParams();
    if(query.trim())next.set("q",query.trim());
    if(category)next.set("category",category);
    if(color)next.set("color",color);
    if(size)next.set("size",size);
    if(minPrice)next.set("min",minPrice);
    if(maxPrice)next.set("max",maxPrice);
    if(sort!=="newest")next.set("sort",sort);
    router.replace("/shop"+(next.toString()?"?"+next.toString():""),{scroll:false});
  },[query,category,color,size,minPrice,maxPrice,sort,router]);

  const categories=useMemo(()=>[...new Set(products.map(p=>p.category_name).filter(Boolean))],[products]);
  const colors=useMemo(()=>[...new Set(products.flatMap(p=>parseList(p.colors)))],[products]);
  const filtered=useMemo(()=>{
    const q=query.trim().toLowerCase();
    return products.filter(p=>{
      if(!p.is_active)return false;
      if(q&&!p.title.toLowerCase().includes(q))return false;
      if(category&&p.category_name!==category)return false;
      if(color&&!parseList(p.colors).includes(color))return false;
      if(size&&!parseList(p.sizes).includes(size))return false;
      const price=safeNumber(p.price);
      if(minPrice&&price<safeNumber(minPrice))return false;
      if(maxPrice&&price>safeNumber(maxPrice))return false;
      return true;
    }).sort((a,b)=>sort==="price-low"?safeNumber(a.price)-safeNumber(b.price):sort==="price-high"?safeNumber(b.price)-safeNumber(a.price):safeNumber(b.id)-safeNumber(a.id));
  },[products,query,category,color,size,minPrice,maxPrice,sort]);

  const clear=()=>{setQuery("");setCategory("");setColor("");setSize("");setMinPrice("");setMaxPrice("");setSort("newest")};

  return (
    <main className="site-container py-10 md:py-14">
      <header className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div><p className="text-xs font-semibold uppercase tracking-[.28em] text-muted-foreground">VANTA / SHOP</p><h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">{t("shop.title")}</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">{t("shop.description")}</p></div>
        <button type="button" onClick={()=>setFiltersOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border px-5 text-sm font-semibold lg:hidden"><Filter className="size-4" aria-hidden/>{t("shop.filters")}</button>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <FilterPanel {...{t,query,setQuery,category,setCategory,color,setColor,size,setSize,minPrice,setMinPrice,maxPrice,setMaxPrice,sort,setSort,categories,colors,clear}} />
        </aside>
        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <span className="text-sm text-muted-foreground">{filtered.length} {t("shop.results")}</span>
            <div className="flex items-center gap-2 text-sm"><SlidersHorizontal className="size-4" aria-hidden/><select value={sort} onChange={(e)=>setSort(e.target.value as SortMode)} className="bg-transparent outline-none"><option value="newest">{t("shop.newest")}</option><option value="price-low">{t("shop.priceLow")}</option><option value="price-high">{t("shop.priceHigh")}</option></select><ChevronDown className="size-4" aria-hidden/></div>
          </div>
          {status==="loading"&&<LoadingBlock label={t("common.loading")}/>}
          {status==="error"&&<ErrorBlock message={error} onRetry={()=>window.location.reload()}/>}
          {status==="success"&&filtered.length===0&&<div className="rounded-3xl border border-border bg-surface p-10 text-center"><p className="text-sm text-muted-foreground">{t("shop.empty")}</p><button type="button" onClick={clear} className="mt-5 min-h-10 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground">{t("shop.clear")}</button></div>}
          {status==="success"&&filtered.length>0&&<div className="grid grid-cols-2 gap-x-3 gap-y-9 md:grid-cols-3 md:gap-x-5 md:gap-y-12">{filtered.map((product,i)=><ProductCard key={product.id} product={product} priority={i<4}/>)}</div>}
        </section>
      </div>

      {filtersOpen&&<div className="fixed inset-0 z-[90] lg:hidden"><button className="absolute inset-0 bg-black/55" onClick={()=>setFiltersOpen(false)} aria-label={t("common.close")}/><aside className="absolute inset-y-0 end-0 w-[min(92vw,390px)] overflow-y-auto bg-background p-6 shadow-2xl"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold">{t("shop.filters")}</h2><button type="button" onClick={()=>setFiltersOpen(false)} className="grid size-10 place-items-center rounded-full bg-muted" aria-label={t("common.close")}><X className="size-5" aria-hidden/></button></div><div className="mt-8"><FilterPanel {...{t,query,setQuery,category,setCategory,color,setColor,size,setSize,minPrice,setMinPrice,maxPrice,setMaxPrice,sort,setSort,categories,colors,clear}}/><button type="button" onClick={()=>setFiltersOpen(false)} className="mt-7 min-h-11 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground">Done</button></div></aside></div>}
    </main>
  );
}

type FilterPanelProps={
  t:(key:string)=>string;
  query:string;setQuery:Dispatch<SetStateAction<string>>;
  category:string;setCategory:Dispatch<SetStateAction<string>>;
  color:string;setColor:Dispatch<SetStateAction<string>>;
  size:string;setSize:Dispatch<SetStateAction<string>>;
  minPrice:string;setMinPrice:Dispatch<SetStateAction<string>>;
  maxPrice:string;setMaxPrice:Dispatch<SetStateAction<string>>;
  sort:SortMode;setSort:Dispatch<SetStateAction<SortMode>>;
  categories:string[];colors:string[];clear:()=>void;
};
function FilterPanel({t,query,setQuery,category,setCategory,color,setColor,size,setSize,minPrice,setMinPrice,maxPrice,setMaxPrice,sort,setSort,categories,colors,clear}:FilterPanelProps){
  return <div className="space-y-7">
    <div><label className="text-xs font-semibold uppercase tracking-[.18em] text-muted-foreground">{t("shop.search")}</label><div className="mt-2 relative"><Search className="absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden/><Input value={query} onChange={(e)=>setQuery(e.target.value)} className="ps-10" placeholder={t("search.placeholder")}/></div></div>
    <SelectField label={t("shop.category")} value={category} setValue={setCategory} options={categories}/><SelectField label={t("shop.color")} value={color} setValue={setColor} options={colors}/><SelectField label={t("shop.size")} value={size} setValue={setSize} options={SUPPORTED_SIZES.slice()}/>
    <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-muted-foreground">{t("shop.minPrice")} / {t("shop.maxPrice")}</p><div className="mt-2 grid grid-cols-2 gap-2"><Input inputMode="numeric" value={minPrice} onChange={(e)=>setMinPrice(e.target.value.replace(/\D/g,""))} placeholder="0"/><Input inputMode="numeric" value={maxPrice} onChange={(e)=>setMaxPrice(e.target.value.replace(/\D/g,""))} placeholder="∞"/></div></div>
    <button type="button" onClick={clear} className="text-xs font-semibold underline underline-offset-4">{t("shop.clear")}</button>
    <select className="sr-only" aria-hidden tabIndex={-1} value={sort} onChange={(e)=>setSort(e.target.value)}><option value="newest">newest</option><option value="price-low">price-low</option><option value="price-high">price-high</option></select>
  </div>;
}
function SelectField({label,value,setValue,options}:{label:string;value:string;setValue:(v:string)=>void;options:string[]}){return <div><label className="text-xs font-semibold uppercase tracking-[.18em] text-muted-foreground">{label}</label><select value={value} onChange={(e)=>setValue(e.target.value)} className="mt-2 min-h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm outline-none focus:border-ring"><option value="">All</option>{options.map((o)=><option key={o} value={o}>{o}</option>)}</select></div>}
