"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

type EventData = { target: "light" | "dark"; x: number; y: number };

export function ThemeRipple() {
  const [event, setEvent] = useState<EventData | null>(null);

  useEffect(() => {
    const handler = (e: Event) => setEvent((e as CustomEvent<EventData>).detail);
    window.addEventListener("vanta:theme-transition", handler);
    return () => window.removeEventListener("vanta:theme-transition", handler);
  }, []);

  const bg = event?.target === "dark" ? "#101010" : "#f7f5f0";

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-[190]"
          style={{ background: bg }}
          initial={{ clipPath: "circle(0% at " + event.x + "px " + event.y + "px)" }}
          animate={{ clipPath: "circle(145% at " + event.x + "px " + event.y + "px)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: .72, ease: [0.76,0,0.24,1] }}
          onAnimationComplete={() => setEvent(null)}
          aria-hidden
        />
      )}
    </AnimatePresence>
  );
}
