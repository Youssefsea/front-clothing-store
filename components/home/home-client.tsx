"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, PlayCircle } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { HERO_IMAGE_FALLBACK, HERO_VIDEO_URL } from "@/lib/constants";
import { productImages, safeNumber } from "@/lib/utils";
import { useLang } from "@/components/transitions/language-provider";
import { ProductCard } from "@/components/product/product-card";
import { ErrorBlock, LoadingBlock } from "@/components/ui/feedback";
import type { Product } from "@/types/domain";
import { MediaImage } from "@/components/ui/media";

export function HomeClient() {
  const { t } = useLang();
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<"loading"|"success"|"error">("loading");
  const [error, setError] = useState("Unable to load products.");

  useEffect(() => {
    let active = true;
    apiRequest<{ allProducts?: Product[] }>("/products").then((data) => {
      if (!active) return;
      setProducts(Array.isArray(data.allProducts) ? data.allProducts : []);
      setStatus("success");
    }).catch((err) => {
      if (!active) return;
      setError(err instanceof Error ? err.message : t("common.network"));
      setStatus("error");
    });
    return () => { active = false; };
  }, [t]);

  const categories = useMemo(() => {
    const map = new Map<string, Product>();
    products.forEach((product) => { if (product.category_name && !map.has(product.category_name)) map.set(product.category_name, product); });
    return [...map.entries()].slice(0, 4);
  }, [products]);

  const featured = useMemo(() => [...products].sort((a,b) => safeNumber(b.id)-safeNumber(a.id)).slice(0,4), [products]);

  return (
    <div>
      <section className="relative isolate min-h-[min(86vh,860px)] overflow-hidden bg-black text-white">
        <div className="absolute inset-0">
          <MediaImage src={HERO_IMAGE_FALLBACK} alt="" fill priority sizes="100vw" className="object-cover" />
          {HERO_VIDEO_URL && (
            <video className="absolute inset-0 size-full object-cover" autoPlay muted loop playsInline poster={HERO_IMAGE_FALLBACK} onError={(e) => { e.currentTarget.style.display = "none"; }} aria-hidden>
              <source src={HERO_VIDEO_URL} />
            </video>
          )}
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
        </div>

        <div className="site-container relative flex min-h-[min(86vh,860px)] items-end pb-16 pt-28 md:pb-20">
          <motion.div initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }} transition={{ duration:.75 }} className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[.35em] text-white/70">{t("home.eyebrow")}</p>
            <h1 className="mt-5 max-w-3xl text-balance text-5xl font-semibold leading-[.95] tracking-[-.05em] sm:text-6xl md:text-8xl">{t("home.title")}</h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-white/75 md:text-base">{t("home.description")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90">{t("home.shop")}<ArrowUpRight className="size-4" aria-hidden /></Link>
              <a href="#featured" className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/30 px-6 text-sm font-semibold transition hover:bg-white/10">{t("home.discover")}<ArrowDownRight className="size-4" aria-hidden /></a>
            </div>
            {HERO_VIDEO_URL && <div className="mt-6 inline-flex items-center gap-2 text-xs text-white/60"><PlayCircle className="size-4" aria-hidden /> Campaign media</div>}
          </motion.div>
        </div>
      </section>

      <section className="site-container py-16 md:py-24">
        <div className="flex items-end justify-between gap-5"><div><p className="text-xs font-semibold uppercase tracking-[.25em] text-muted-foreground">{t("home.categories")}</p></div><Link href="/shop" className="inline-flex items-center gap-1 text-sm font-semibold hover:underline">{t("home.viewAll")}<ArrowUpRight className="size-4" aria-hidden /></Link></div>
        <div className="mt-7 grid gap-3 md:grid-cols-4">
          {categories.length ? categories.map(([name, product], index) => (
            <Link key={name} href={"/shop?category="+encodeURIComponent(name)} className="group relative aspect-[4/5] overflow-hidden rounded-[22px] bg-muted">
              {productImages(product.image_url)[0] ? <MediaImage src={productImages(product.image_url)[0]} alt="" fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-105" /> : <div className="absolute inset-0 bg-secondary" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" /><div className="absolute inset-x-0 bottom-0 p-5 text-white"><span className="text-xs text-white/60">0{index+1}</span><h2 className="mt-1 text-xl font-semibold">{name}</h2></div>
            </Link>
          )) : [1,2,3,4].map((n) => <div key={n} className="aspect-[4/5] animate-pulse rounded-[22px] bg-muted" />)}
        </div>
      </section>

      <section id="featured" className="border-y border-border bg-surface-secondary/55">
        <div className="site-container py-16 md:py-24">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.25em] text-muted-foreground">{t("home.featured")}</p><h2 className="mt-3 text-4xl font-semibold tracking-tight">{t("home.values")}</h2></div><p className="max-w-md text-sm leading-7 text-muted-foreground">{t("home.valuesBody")}</p></div>
          <div className="mt-9">{status==="loading"&&<LoadingBlock label={t("common.loading")}/>} {status==="error"&&<ErrorBlock message={error} onRetry={()=>window.location.reload()}/>} {status==="success"&&<div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-5">{featured.map((product,i)=><ProductCard key={product.id} product={product} priority={i<2}/>)}</div>}</div>
          <div className="mt-12 overflow-hidden rounded-[28px] bg-primary p-8 text-primary-foreground md:p-12"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[.25em] opacity-60">VANTA</p><h3 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">{t("home.editorial")}</h3><p className="mt-4 max-w-lg text-sm leading-7 opacity-70">{t("home.editorialBody")}</p><Link href="/shop" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary-foreground px-5 text-sm font-semibold text-primary transition hover:opacity-90">{t("home.cta")}<ArrowUpRight className="size-4" aria-hidden /></Link></div></div>
        </div>
      </section>
    </div>
  );
}
