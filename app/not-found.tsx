import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getServerDictionary } from "@/lib/i18n";

export default async function NotFound() {
  const copy = getServerDictionary("en");
  return (
    <main className="site-container flex min-h-[65vh] items-center justify-center py-16">
      <section className="max-w-xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[.3em] text-muted-foreground">VANTA</p>
        <h1 className="mt-4 text-6xl font-semibold tracking-tight">404</h1>
        <p className="mt-4 text-muted-foreground">{copy["error.notFound"]}</p>
        <Link href="/" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground">
          {copy["nav.home"]}
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </section>
    </main>
  );
}
