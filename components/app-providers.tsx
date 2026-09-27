"use client";
import {ThemeProvider} from "@/components/theme-provider";
import {LocaleProvider} from "@/components/locale-provider";
import {AuthProvider} from "@/components/auth-provider";
import {LanguageTransition} from "@/components/language-transition";
export function AppProviders({children}:{children:React.ReactNode}){return <ThemeProvider><LocaleProvider><AuthProvider><LanguageTransition/>{children}</AuthProvider></LocaleProvider></ThemeProvider>;}
