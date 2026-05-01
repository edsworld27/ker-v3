"use client";

// Wraps a block's rendered children with an IntersectionObserver
// transition so admin-configured `styles.animate` types ("fade-in",
// "slide-up", etc.) play once when the block scrolls into view. Used
// only by the host-side BlockRenderer — the editor canvas always shows
// the resting state so layout work is precise.

import { useEffect, useRef, useState } from "react";

type AnimateKind = "fade-in" | "slide-up" | "slide-left" | "slide-right" | "zoom-in";

const REST: Record<AnimateKind, React.CSSProperties> = {
  "fade-in":     { opacity: 1, transform: "none" },
  "slide-up":    { opacity: 1, transform: "none" },
  "slide-left":  { opacity: 1, transform: "none" },
  "slide-right": { opacity: 1, transform: "none" },
  "zoom-in":     { opacity: 1, transform: "none" },
};

const HIDDEN: Record<AnimateKind, React.CSSProperties> = {
  "fade-in":     { opacity: 0,             transform: "none" },
  "slide-up":    { opacity: 0,             transform: "translateY(24px)" },
  "slide-left":  { opacity: 0,             transform: "translateX(-24px)" },
  "slide-right": { opacity: 0,             transform: "translateX(24px)" },
  "zoom-in":     { opacity: 0,             transform: "scale(0.96)" },
};

const TRANSITION = "opacity 600ms ease-out, transform 600ms ease-out";

export default function AnimateOnScroll({ animate, children }: { animate: AnimateKind; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setShown(true);
          obs.disconnect();
          break;
        }
      }
    }, { threshold: 0.15 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        ...(shown ? REST[animate] : HIDDEN[animate]),
        transition: TRANSITION,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
