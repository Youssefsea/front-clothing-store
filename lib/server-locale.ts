import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n";

export async function getInitialLocale(): Promise<Locale> {
  const value = (await cookies()).get("vanta-locale")?.value;
  return value === "ar" ? "ar" : "en";
}
