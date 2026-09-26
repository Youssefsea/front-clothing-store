"use client";

import { useLang } from "@/components/transitions/language-provider";
import { RotateCcw } from "lucide-react";

export default function AdminError({ reset }: { reset: () => void }) {
  const { t } = useLang();
  return (
    <main className="p-6">
      <div className="surface-card mx-auto max-w-xl p-8 text-center" role="alert">
        <h1 className="text-2xl font-semibold">{t("admin.errorTitle")}</h1>
        <p className="mt-3 text-muted-foreground">{t("admin.errorDescription")}</p>
        <button type="button" onClick={reset} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">
          <RotateCcw className="size-4" aria-hidden />
          {t("common.retry")}
        </button>
      </div>
    </main>
  );
}
