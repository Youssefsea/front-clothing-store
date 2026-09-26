"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Package, ShoppingBag } from "lucide-react";
import { apiRequest } from "@/lib/api";
import type { Product } from "@/types/domain";
import { discountPrice, formatPrice, parseList, productImages, safeNumber } from "@/lib/utils";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductOptions } from "@/components/product/product-options";
import { QuantityControl } from "@/components/product/quantity-control";
import { ProductCard } from "@/components/product/product-card";
import { useCart } from "@/stores/cart-store";
import { useAuth } from "@/stores/auth-store";
import { useLang } from "@/components/transitions/language-provider";
import { ErrorBlock, LoadingBlock } from "@/components/ui/feedback";
import { Button } from "@/components/ui/button";

export function ProductDetailsClient({ productId }: { productId:string }) {
  const { t, locale } = useLang();
  const auth = useAuth();
  const cart = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [status, setStatus] = useState<"loading"|"success"|"error"|"notFound">("loading");
  const [error, setError] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let active=true;
    apiRequest<{ allProducts?: Product[] }>("/products").then((data)=>{
      if(!active)return;
      const list=Array.isArray(data.allProducts)?data.allProducts:[];
      setProducts(list);
      const found=list.find((item)=>String(item.id)===String(productId));
      if(!found){setStatus("notFound");return;}
      setProduct(found);
      const sizes=parseList(found.sizes);
      const colors=parseList(found.colors);
      if(sizes.length===1)setSize(sizes[0]);
      if(colors.length===1)setColor(colors[0]);
      setStatus("success");
    }).catch((err)=>{
      if(!active)return;
      setError(err instanceof Error?err.message:t("common.network"));
      setStatus("error");
    });
    return()=>{active=false;};
  },[productId,t]);

  const related=useMemo(()=>products.filter((item)=>item.id!==product?.id&&item.category_name===product?.category_name).slice(0,4),[products,product]);

  if(status==="loading") return <main className="site-container py-10"><LoadingBlock label={t("common.loading")}/></main>;
  if(status==="error") return <main className="site-container py-10"><ErrorBlock message={error} onRetry={()=>window.location.reload()}/></main>;
  if(status==="notFound" || !product) return <main className="site-container py-20 text-center"><h1 className="text-3xl font-semibold">404</h1><p className="mt-3 text-muted-foreground">{t("error.notFound")}</p><Link href="/shop" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">{t("product.back")}</Link></main>;

  const discount=Number(product.discount)||0;
  const price=safeNumber(product.price);
  const sale=discountPrice(price,discount);
  const colors=parseList(product.colors);
  const sizes=parseList(product.sizes);
  const canAdd=auth.status==="authenticated"&&!adding&&!(!product.is_active||product.stock<=0)&&(!sizes.length||!!size)&&(!colors.length||!!color);

  const add=async()=>{
    if(auth.status!=="authenticated"){window.location.href="/login";return;}
    if(!canAdd)return;
    try{
      setAdding(true);setAdded(false);
      await cart.add({product_id:product.id,quantity,size:size||sizes[0]||"M",color:color||colors[0]||"Default"});
      setAdded(true);
      window.setTimeout(()=>setAdded(false),2200);
    }catch(err){setError(err instanceof Error?err.message:t("common.error"))}
    finally{setAdding(false);}
  };

  return (
    <main className="site-container py-8 md:py-12">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        {locale==="ar"?<ArrowRight className="size-4"/>:<ArrowLeft className="size-4"/>}
        <Link href="/shop" className="hover:text-foreground">{t("product.back")}</Link>
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(340px,.88fr)] lg:gap-14">
        <ProductGallery urls={productImages(product.image_url)} title={product.title}/>
        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="text-xs uppercase tracking-[.25em] text-muted-foreground">{product.category_name}</div>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">{product.title}</h1>
          <div className="mt-5 flex items-end gap-3"><div className="text-2xl font-semibold">{formatPrice(sale)}</div>{discount>0&&<div className="text-sm text-muted-foreground line-through">{formatPrice(price)}</div>}{discount>0&&<span className="rounded-full bg-danger/10 px-2.5 py-1 text-[10px] font-bold text-danger">-{discount}%</span>}</div>
          {product.stock>0&&product.stock<=5&&<p className="mt-2 text-xs font-semibold text-warning">{t("product.lowStock")}: {product.stock}</p>}
          <div className="mt-8 border-t border-border pt-7">
            <p className="text-sm leading-7 text-muted-foreground">{product.description||"—"}</p>
          </div>
          <div className="mt-8"><ProductOptions product={product} size={size} color={color} setSize={setSize} setColor={setColor}/></div>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <QuantityControl value={quantity} min={1} max={Math.max(1,product.stock)} onChange={setQuantity}/>
            <Button onClick={add} disabled={!canAdd} className="min-w-48">{adding?t("auth.signing"):product.stock<=0?t("product.out"):auth.status!=="authenticated"?t("nav.login"):t("product.add")}<ShoppingBag className="size-4" aria-hidden/></Button>
          </div>
          {added&&<div className="mt-4 flex items-center gap-2 rounded-2xl border border-success/20 bg-success/10 p-4 text-sm"><Check className="size-4 text-success" aria-hidden/>{t("common.success")}</div>}
          {error&&<div className="mt-4"><ErrorBlock message={error}/></div>}
          <div className="mt-8 grid gap-3 border-t border-border pt-7">
            <div className="flex items-start gap-3"><Package className="mt-0.5 size-4" aria-hidden/><div><p className="text-sm font-semibold">{t("product.shipping")}</p><p className="mt-1 text-xs leading-6 text-muted-foreground">{t("product.shippingBody")}</p></div></div>
          </div>
        </div>
      </div>
      {related.length>0&&<section className="mt-20 border-t border-border pt-12"><h2 className="text-2xl font-semibold">{t("product.related")}</h2><div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 md:gap-x-5">{related.map((item,i)=><ProductCard key={item.id} product={item} priority={i===0}/>)}</div></section>}
    </main>
  );
}
