"use client";

import { useMemo } from "react";
import type { Product } from "@/types/domain";
import { parseList } from "@/lib/utils";
import { SUPPORTED_SIZES } from "@/lib/constants";
import { useLang } from "@/components/transitions/language-provider";

export function ProductOptions({ product, size, color, setSize, setColor }: { product:Product; size:string; color:string; setSize:(v:string)=>void; setColor:(v:string)=>void }) {
  const { t } = useLang();
  const sizes = useMemo(() => parseList(product.sizes).filter((s) => SUPPORTED_SIZES.includes(s as typeof SUPPORTED_SIZES[number])), [product.sizes]);
  const colors = useMemo(() => parseList(product.colors), [product.colors]);

  return (
    <div className="space-y-6">
      {sizes.length > 0 && (
        <fieldset>
          <legend className="text-sm font-semibold">{t("product.size")}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((item) => <button type="button" key={item} onClick={() => setSize(item)} className={"min-w-12 rounded-full border px-4 py-2.5 text-sm transition " + (size===item ? "border-foreground bg-primary text-primary-foreground" : "border-border hover:bg-muted")} aria-pressed={size===item}>{item}</button>)}
          </div>
          {!size && <p className="mt-2 text-xs text-danger">{t("product.selectSize")}</p>}
        </fieldset>
      )}
      {colors.length > 0 && (
        <fieldset>
          <legend className="text-sm font-semibold">{t("product.color")}</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {colors.map((item) => <button type="button" key={item} onClick={() => setColor(item)} className={"rounded-full border px-4 py-2.5 text-sm transition " + (color===item ? "border-foreground bg-muted" : "border-border hover:bg-muted")} aria-pressed={color===item}>{item}</button>)}
          </div>
          {!color && <p className="mt-2 text-xs text-danger">{t("product.selectColor")}</p>}
        </fieldset>
      )}
    </div>
  );
}
