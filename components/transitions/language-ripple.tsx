"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

type EventData = { target: "en" | "ar"; x: number; y: number };

export function LanguageRipple() {
  const [event, setEvent] = useState<EventData | null>(null);

  useEffect(() => {
    const handler = (e: Event) => setEvent((e as CustomEvent<EventData>).detail);
    window.addEventListener("vanta:locale-transition", handler);
    return () => window.removeEventListener("vanta:locale-transition", handler);
  }, []);

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[200] overflow-hidden bg-foreground"
          initial={{ clipPath: "circle(0% at " + event.x + "px " + event.y + "px)" }}
          animate={{ clipPath: "circle(145% at " + event.x + "px " + event.y + "px)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: .72, ease: [0.76,0,0.24,1] }}
          onAnimationComplete={() => setEvent(null)}
          aria-hidden
        >
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-[10px] font-semibold uppercase tracking-[.5em] text-background">{event.target === "ar" ? "العربية" : "ENGLISH"}</div>
          </div>
          <motion.div className="absolute inset-x-0 top-1/2 h-24 -translate-y-1/2 rounded-[50%] border-y border-background/20" initial={{ scaleX: .2, opacity: 0 }} animate={{ scaleX: 1.4, opacity: .9 }} transition={{ duration: .45, ease: "easeOut" }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
