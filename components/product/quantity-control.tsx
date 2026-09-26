"use client";

import { Minus, Plus } from "lucide-react";

export function QuantityControl({ value, min=1, max=99, onChange }: { value:number; min?:number; max?:number; onChange:(value:number)=>void }) {
  return (
    <div className="inline-flex h-11 items-center rounded-full border border-border bg-surface">
      <button type="button" className="grid size-11 place-items-center rounded-full hover:bg-muted disabled:opacity-40" onClick={() => onChange(Math.max(min,value-1))} disabled={value <= min} aria-label="Decrease quantity"><Minus className="size-4" aria-hidden /></button>
      <span className="w-9 text-center text-sm font-semibold" aria-live="polite">{value}</span>
      <button type="button" className="grid size-11 place-items-center rounded-full hover:bg-muted disabled:opacity-40" onClick={() => onChange(Math.min(max,value+1))} disabled={value >= max} aria-label="Increase quantity"><Plus className="size-4" aria-hidden /></button>
    </div>
  );
}
