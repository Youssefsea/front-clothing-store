"use client";

import { useState } from "react";
import { MediaImage } from "@/components/ui/media";
import { productImages } from "@/lib/utils";

export function ProductGallery({ urls, title }: { urls: string[]; title: string }) {
  const images = productImages(urls);
  const [active, setActive] = useState(0);
  const shown = images[active];

  return (
    <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_88px]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[26px] bg-muted md:aspect-[3/4]">
        {shown ? <MediaImage src={shown} alt={title} fill priority sizes="(max-width:768px) 100vw, 66vw" className="object-cover" /> : <div className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">VANTA</div>}
      </div>
      {images.length > 1 && (
        <div className="order-2 grid grid-cols-4 gap-2 md:order-none md:grid-cols-1">
          {images.map((url, index) => (
            <button type="button" key={url} onClick={() => setActive(index)} className={"relative aspect-[4/5] overflow-hidden rounded-xl border " + (index===active ? "border-foreground" : "border-border opacity-70 hover:opacity-100")} aria-label={"Show image "+(index+1)}>
              <MediaImage src={url} alt="" fill sizes="88px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
