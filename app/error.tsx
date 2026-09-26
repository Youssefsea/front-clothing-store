"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useLang } from "@/components/transitions/language-provider";

export default function GlobalError({ reset }: { reset: () => void }) {
  const { t } = useLang();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") console.error("[APP] route error boundary mounted");
  }, []);

  return (
    <main className="site-container flex min-h-[70vh] items-center justify-center py-16">
      <section className="surface-card max-w-xl p-8 text-center md:p-12" role="alert">
        <AlertTriangle className="mx-auto size-10 text-danger" aria-hidden />
        <h1 className="mt-5 text-2xl font-semibold">{t("error.title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("error.description")}</p>
        <button type="button" onClick={reset} className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">
          <RotateCcw className="size-4" aria-hidden />
          {t("common.retry")}
        </button>
      </section>
    </main>
  );
}
