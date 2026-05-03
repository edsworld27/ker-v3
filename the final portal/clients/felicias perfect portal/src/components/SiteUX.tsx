"use client";

// Reads the active Site (set by SiteResolver) and applies two
// optional UX toggles globally:
//   1. Smooth scrolling — sets html { scroll-behavior: smooth } so
//      anchor links + JS scrolls glide instead of jumping.
//   2. Custom cursor — replaces the system pointer with a small dot /
//      ring / blur element that follows the mouse. Pure CSS + a tiny
//      pointermove handler; no third-party library.

import { useEffect, useRef, useState } from "react";
import type { Site } from "@/lib/admin/sites";

declare global {
  interface Window { __site?: Site }
}

export default function SiteUX() {
  const [site, setSite] = useState<Site | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function read() { setSite((typeof window !== "undefined" ? window.__site : undefined) ?? null); }
    read();
    // SiteResolver sets __site on mount; poll briefly for hydration.
    const id = window.setInterval(read, 500);
    window.setTimeout(() => window.clearInterval(id), 3000);
    return () => window.clearInterval(id);
  }, []);

  // Smooth scrolling — toggle the root attribute. Reverts on unmount.
  useEffect(() => {
    if (!site) return;
    const html = document.documentElement;
    const prev = html.style.scrollBehavior;
    if (site.smoothScroll) html.style.scrollBehavior = "smooth";
    else html.style.scrollBehavior = "";
    return () => { html.style.scrollBehavior = prev; };
  }, [site?.smoothScroll]);

  // Custom cursor — listens once, throttles via rAF.
  useEffect(() => {
    if (!site || !site.customCursor || site.customCursor === "default") return;
    const node = cursorRef.current;
    if (!node) return;

    let frame = 0;
    let x = 0, y = 0;
    function onMove(e: PointerEvent) {
      x = e.clientX; y = e.clientY;
      if (!frame) {
        frame = requestAnimationFrame(() => {
          if (cursorRef.current) cursorRef.current.style.transform = `translate(${x}px, ${y}px)`;
          frame = 0;
        });
      }
    }
    window.addEventListener("pointermove", onMove);
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [site?.customCursor]);

  if (!site) return null;
  if (!site.customCursor || site.customCursor === "default") return null;

  const color = site.cursorColor ?? "#ff6b35";
  const styles =
    site.customCursor === "dot"  ? { width: 10, height: 10, background: color, borderRadius: "50%" }
    : site.customCursor === "ring"? { width: 28, height: 28, border: `2px solid ${color}`, borderRadius: "50%", background: "transparent" }
    : { width: 60, height: 60, background: color, borderRadius: "50%", filter: "blur(20px)", opacity: 0.55 };

  return (
    <>
      {/* Hide default pointer site-wide when a custom cursor is on. */}
      <style dangerouslySetInnerHTML={{ __html: `html, body, * { cursor: none !important; } a, button, [role="button"] { cursor: none !important; }` }} />
      <div
        ref={cursorRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          marginLeft: -((styles.width as number) / 2),
          marginTop: -((styles.height as number) / 2),
          pointerEvents: "none",
          zIndex: 999999,
          transition: "width 150ms, height 150ms, opacity 150ms",
          ...styles,
        }}
      />
    </>
  );
}
