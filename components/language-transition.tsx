"use client";
import {useLocale} from "@/components/locale-provider";
export function LanguageTransition(){const {transitioning,origin}=useLocale();if(!transitioning)return null;return <div className="ripple-root" style={{"--rx":origin.x+"%","--ry":origin.y+"%"} as React.CSSProperties} aria-hidden="true"><div className="ripple-wave"/></div>;}
