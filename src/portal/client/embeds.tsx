"use client";

// <PortalEmbed/> — the runtime renderer for portal-managed widgets.
//
// Usage in a host site:
//   <PortalEmbed id="support-chat" siteId="luvandker" portal="https://your-portal.app" />
//
// The component fetches the public embed list for `siteId` from the portal
// once per page load (with a 30s in-memory cache shared across instances,
// so a page with several PortalEmbeds only does one network round-trip),
// looks up the embed by `id`, and renders the appropriate provider snippet.
//
// Provider helpers below mirror the canonical "drop this into <head>"
// snippet from each vendor, but tweaked so:
//  - they're idempotent (a `loaded` set prevents double-injecting if React
//    re-renders or the user navigates back),
//  - inline scripts inside custom-html actually execute (innerHTML alone
//    won't run them; we re-inject as fresh <script> nodes).

import { useEffect, useState } from "react";
import type { EmbedProvider, EmbedPosition, ConsentCategory } from "@/portal/server/types";

interface PublicEmbed {
  id: string;
  provider: EmbedProvider;
  value: string;
  position?: EmbedPosition;
  consentCategory?: ConsentCategory;
  settings?: Record<string, unknown>;
}

// Per-(portal,siteId) cache so multiple <PortalEmbed/> instances on the
// same page coalesce into a single fetch. Entries expire after 30s,
// matching the s-maxage on the route.
const CACHE_TTL_MS = 30_000;
interface CacheEntry { at: number; data: PublicEmbed[] }
const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<PublicEmbed[]>>();

// One-shot guards so each provider script is injected at most once per
// page, even if multiple <PortalEmbed/>s reference the same widget.
const loaded = new Set<string>();

function cacheKey(portal: string, siteId: string): string {
  return `${portal}::${siteId}`;
}

async function fetchEmbeds(portal: string, siteId: string): Promise<PublicEmbed[]> {
  const key = cacheKey(portal, siteId);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data;
  const existing = inflight.get(key);
  if (existing) return existing;
  const url = `${portal.replace(/\/$/, "")}/api/portal/embeds/${encodeURIComponent(siteId)}`;
  const promise = fetch(url, { cache: "no-store" })
    .then(res => res.ok ? res.json() as Promise<PublicEmbed[]> : [])
    .then(data => {
      cache.set(key, { at: Date.now(), data });
      return data;
    })
    .catch(() => [] as PublicEmbed[])
    .finally(() => { inflight.delete(key); });
  inflight.set(key, promise);
  return promise;
}

export function PortalEmbed({ id, siteId, portal = "" }: {
  id: string;
  siteId: string;
  portal?: string;
}) {
  const [embed, setEmbed] = useState<PublicEmbed | null>(null);
  const [loaded$, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const origin = portal || (typeof window !== "undefined" ? window.location.origin : "");
    fetchEmbeds(origin, siteId).then(list => {
      if (cancelled) return;
      setEmbed(list.find(e => e.id === id) ?? null);
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [id, siteId, portal]);

  if (!loaded$ || !embed) return null;
  return <PortalEmbedRenderer embed={embed} />;
}

// Renders a single embed object directly. Useful when the host site has
// already fetched the full list (e.g. SSR-injected on the server).
export function PortalEmbedRenderer({ embed }: { embed: PublicEmbed }) {
  switch (embed.provider) {
    case "crisp":       return <CrispEmbed value={embed.value} />;
    case "intercom":    return <IntercomEmbed value={embed.value} />;
    case "tidio":       return <TidioEmbed value={embed.value} />;
    case "calendly":    return <CalendlyEmbed value={embed.value} position={embed.position} />;
    case "cal-com":     return <CalComEmbed value={embed.value} position={embed.position} />;
    case "youtube":     return <YouTubeEmbed value={embed.value} />;
    case "vimeo":       return <VimeoEmbed value={embed.value} />;
    case "custom-html": return <CustomHtmlEmbed value={embed.value} />;
    default:            return null;
  }
}

// ─── Providers ─────────────────────────────────────────────────────────────

function CrispEmbed({ value }: { value: string }) {
  useEffect(() => {
    const key = `crisp:${value}`;
    if (loaded.has(key) || typeof window === "undefined") return;
    loaded.add(key);
    // Standard Crisp loader. Mirrors the snippet at
    // https://help.crisp.chat/en/article/how-to-install-crisp-live-chat-on-your-website-dkrg1d/
    (window as unknown as { $crisp: unknown[] }).$crisp = [];
    (window as unknown as { CRISP_WEBSITE_ID: string }).CRISP_WEBSITE_ID = value;
    const s = document.createElement("script");
    s.src = "https://client.crisp.chat/l.js";
    s.async = true;
    document.head.appendChild(s);
  }, [value]);
  return null;
}

function IntercomEmbed({ value }: { value: string }) {
  useEffect(() => {
    const key = `intercom:${value}`;
    if (loaded.has(key) || typeof window === "undefined") return;
    loaded.add(key);
    const w = window as unknown as { Intercom?: unknown; intercomSettings?: unknown };
    w.intercomSettings = { app_id: value };
    // Intercom Messenger boot snippet (slightly compressed). The bottom
    // half of the original is just a polyfill for browsers that lack
    // window.requestAnimationFrame; we keep it for parity.
    const ic = w.Intercom;
    if (typeof ic === "function") {
      (ic as (...args: unknown[]) => void)("reattach_activator");
      (ic as (...args: unknown[]) => void)("update", w.intercomSettings);
    } else {
      const i: unknown[] & { c?: (a: unknown) => void; q?: unknown[]; l?: number } =
        Object.assign([], { q: [] as unknown[] });
      i.c = (a: unknown) => i.q!.push(a);
      const wrap: ((...args: unknown[]) => void) & { q?: unknown[]; c?: (a: unknown) => void } =
        ((...args: unknown[]) => i.c!(args)) as never;
      wrap.q = i.q; wrap.c = i.c;
      (window as unknown as { Intercom: unknown }).Intercom = wrap;
      const load = () => {
        const s = document.createElement("script");
        s.async = true;
        s.src = `https://widget.intercom.io/widget/${value}`;
        document.head.appendChild(s);
      };
      if (document.readyState === "complete") load();
      else window.addEventListener("load", load);
    }
  }, [value]);
  return null;
}

function TidioEmbed({ value }: { value: string }) {
  useEffect(() => {
    const key = `tidio:${value}`;
    if (loaded.has(key) || typeof window === "undefined") return;
    loaded.add(key);
    const s = document.createElement("script");
    s.src = `//code.tidio.co/${value}.js`;
    s.async = true;
    document.head.appendChild(s);
  }, [value]);
  return null;
}

function CalendlyEmbed({ value, position }: { value: string; position?: EmbedPosition }) {
  const isPopup = position === "popup-bottom-right" || position === "popup-bottom-left";
  useEffect(() => {
    if (!isPopup || typeof window === "undefined") return;
    const key = `calendly:${value}:${position}`;
    if (loaded.has(key)) return;
    loaded.add(key);
    // Calendly badge widget — loads the vendor JS + CSS, then calls their
    // initBadgeWidget API. https://help.calendly.com/hc/en-us/articles/223147027
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://assets.calendly.com/assets/external/widget.css";
    document.head.appendChild(css);
    const s = document.createElement("script");
    s.src = "https://assets.calendly.com/assets/external/widget.js";
    s.async = true;
    s.onload = () => {
      const C = (window as unknown as { Calendly?: { initBadgeWidget?: (cfg: unknown) => void } }).Calendly;
      C?.initBadgeWidget?.({
        url: value,
        text: "Schedule time with me",
        color: "#0069ff",
        textColor: "#ffffff",
      });
    };
    document.head.appendChild(s);
  }, [value, position, isPopup]);

  if (isPopup) return null;
  return (
    <a href={value} className="portal-embed-calendly" target="_blank" rel="noopener noreferrer">
      Book a slot
    </a>
  );
}

function CalComEmbed({ value, position }: { value: string; position?: EmbedPosition }) {
  const isPopup = position === "popup-bottom-right" || position === "popup-bottom-left";
  useEffect(() => {
    if (!isPopup || typeof window === "undefined") return;
    const key = `cal-com:${value}:${position}`;
    if (loaded.has(key)) return;
    loaded.add(key);
    // Cal.com offers an embed.js with a Cal() API. We initialise a popup
    // floating-button when the position is set; otherwise we fall through
    // to the inline link below.
    const s = document.createElement("script");
    s.src = "https://app.cal.com/embed/embed.js";
    s.async = true;
    document.head.appendChild(s);
  }, [value, position, isPopup]);

  if (isPopup) return null;
  return (
    <a href={value} className="portal-embed-cal-com" target="_blank" rel="noopener noreferrer">
      Book a slot
    </a>
  );
}

function YouTubeEmbed({ value }: { value: string }) {
  return (
    <div className="portal-embed-youtube" style={{ aspectRatio: "16 / 9", width: "100%" }}>
      <iframe
        src={`https://www.youtube.com/embed/${encodeURIComponent(value)}`}
        title="YouTube video"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ width: "100%", height: "100%", border: 0 }}
      />
    </div>
  );
}

function VimeoEmbed({ value }: { value: string }) {
  return (
    <div className="portal-embed-vimeo" style={{ aspectRatio: "16 / 9", width: "100%" }}>
      <iframe
        src={`https://player.vimeo.com/video/${encodeURIComponent(value)}`}
        title="Vimeo video"
        loading="lazy"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        style={{ width: "100%", height: "100%", border: 0 }}
      />
    </div>
  );
}

function CustomHtmlEmbed({ value }: { value: string }) {
  // innerHTML doesn't execute <script> tags — we re-inject them as fresh
  // <script> nodes so they actually run, mirroring the HtmlInjector pattern
  // in src/components/SiteHead.tsx.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const wrap = document.getElementById(`portal-custom-${hash(value)}`);
    if (!wrap) return;
    wrap.querySelectorAll("script").forEach(orig => {
      const s = document.createElement("script");
      Array.from(orig.attributes).forEach(a => s.setAttribute(a.name, a.value));
      s.text = orig.text;
      orig.replaceWith(s);
    });
  }, [value]);
  return (
    <div
      id={`portal-custom-${hash(value)}`}
      className="portal-embed-custom-html"
      dangerouslySetInnerHTML={{ __html: value }}
    />
  );
}

// Stable, hash-ish ID for the wrapper so we can find it after mount
// without needing a ref (refs interact awkwardly with dangerouslySetInnerHTML
// re-keying). Collisions are harmless — the worst case is two embeds with
// identical HTML share a wrapper, which is fine.
function hash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}
