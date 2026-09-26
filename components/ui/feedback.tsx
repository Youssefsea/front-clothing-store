"use client";

import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";
import { useLang } from "@/components/transitions/language-provider";

export function LoadingBlock({ label }: { label?: string }) {
  return (
    <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-surface" aria-live="polite" aria-busy="true">
      <LoaderCircle className="size-6 animate-spin text-muted-foreground" aria-hidden />
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
    </div>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useLang();
  return (
    <div className="rounded-3xl border border-danger/25 bg-danger/5 p-6" role="alert">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-semibold">{message}</p>
          {onRetry && <button type="button" onClick={onRetry} className="mt-3 min-h-10 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground">{t("common.retry")}</button>}
        </div>
      </div>
    </div>
  );
}

export function SuccessNotice({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-success/20 bg-success/10 p-4 text-sm text-foreground" role="status">
      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
      <span>{message}</span>
    </div>
  );
}
