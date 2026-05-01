"use client";

import { useEffect, useState } from "react";
import { getValue, onContentChange } from "@/lib/admin/content";
import { resolveMediaRef, onMediaChange } from "@/lib/admin/media";
import {
  getPortalValue, loadPortalCache, onPortalCacheChange,
} from "@/lib/portalCache";

// Returns an editable text/value. Three-tier lookup so the love-and-ker
// storefront runs dual-mode during the migration:
//
//   1. portal published   — fetched once on hydration, refreshed on
//                            publish events (other tabs, host clicks
//                            window.__portal.refresh, etc.)
//   2. legacy localStorage CMS — getValue(key)
//   3. fallback string from the call site
//
// Initial render uses the fallback so SSR matches the first client paint.
// On hydration we kick off the portal cache load and re-render once it
// resolves, so the visible value flips from default → portal in <100ms.
//
// Component code does NOT change — every existing useContent call site
// gets portal lookup for free.
export function useContent(key: string, fallback: string): string {
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    // Kick off the shared portal cache fetch (idempotent + cached across
    // every useContent call on the page).
    void loadPortalCache();

    const update = () => {
      const portalHit = getPortalValue(key);
      if (portalHit !== undefined) { setValue(portalHit); return; }
      setValue(getValue(key) ?? fallback);
    };
    update();

    const off1 = onContentChange(update);
    const off2 = onPortalCacheChange(update);
    return () => { off1(); off2(); };
  }, [key, fallback]);

  return value;
}

// Same as useContent, but also resolves media library refs ("media:abc123")
// to the actual data URL. Use for image src strings.
export function useContentImage(key: string, fallback: string): string {
  const [value, setValue] = useState(fallback);

  useEffect(() => {
    void loadPortalCache();
    const update = () => {
      const portalHit = getPortalValue(key);
      if (portalHit !== undefined) { setValue(resolveMediaRef(portalHit)); return; }
      const raw = getValue(key) ?? fallback;
      setValue(resolveMediaRef(raw));
    };
    update();
    const off1 = onContentChange(update);
    const off2 = onMediaChange(update);
    const off3 = onPortalCacheChange(update);
    return () => { off1(); off2(); off3(); };
  }, [key, fallback]);

  return value;
}
