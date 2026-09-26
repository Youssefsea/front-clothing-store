"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, CircleOff } from "lucide-react";
import type { Product } from "@/types/domain";
import { discountPrice, formatPrice, parseList, productImages } from "@/lib/utils";
import { MediaImage } from "@/components/ui/media";
import { useLang } from "@/components/transitions/language-provider";

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { t } = useLang();
  const images = useMemo(() => productImages(product.image_url), [product.image_url]);
  const [index, setIndex] = useState(0);
  const discount = Number(product.discount) || 0;
  const price = Number(product.price) || 0;
  const sale = discountPrice(price, discount);
  const colors = parseList(product.colors);
  const unavailable = !product.is_active || product.stock <= 0;

  return (
    <article className="group min-w-0">
      <Link href={"/product/"+product.id} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[22px] bg-muted">
          {images[index] ? <MediaImage src={images[index]} alt={product.title} fill sizes="(max-width:768px) 50vw, 25vw" priority={priority} className="object-cover transition duration-700 ease-out group-hover:scale-[1.025]" /> : <div className="absolute inset-0 grid place-items-center text-muted-foreground"><CircleOff className="size-8" aria-hidden /></div>}
          {discount > 0 && <span className="absolute start-3 top-3 rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-primary-foreground">-{discount}%</span>}
          {unavailable && <span className="absolute end-3 top-3 rounded-full bg-background/90 px-3 py-1 text-[10px] font-semibold">{t("product.out")}</span>}
          {images.length > 1 && (
            <div className="absolute inset-x-3 bottom-3 flex gap-1.5">
              {images.slice(0,4).map((_, i) => <button key={i} type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIndex(i); }} aria-label={"View image "+(i+1)} className={"h-1 flex-1 rounded-full " + (i===index ? "bg-white" : "bg-white/40")} />)}
            </div>
          )}
          <span className="absolute bottom-4 end-4 grid size-10 translate-y-2 place-items-center rounded-full bg-white text-black opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="size-4" aria-hidden />
          </span>
        </div>
      </Link>
      <div className="pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={"/product/"+product.id} className="line-clamp-2 text-sm font-semibold hover:underline">{product.title}</Link>
            <p className="mt-1 text-xs text-muted-foreground">{product.category_name}</p>
          </div>
          <div className="shrink-0 text-end text-sm font-semibold">
            <div>{formatPrice(sale)}</div>
            {discount > 0 && <div className="text-xs font-normal text-muted-foreground line-through">{formatPrice(price)}</div>}
          </div>
        </div>
        {colors.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{colors.slice(0,4).map((c) => <span key={c} className="text-[10px] text-muted-foreground">{c}</span>)}</div>}
      </div>
    </article>
  );
}
