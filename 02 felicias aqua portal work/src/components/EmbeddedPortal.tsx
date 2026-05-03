"use client";

// Embed the Aqua portal as an iframe inside any host site.
//
// Felicia's storefront (or any site) drops this on a route, and it
// loads the portal's /embed/login (or /admin) at the right URL. The
// iframe is first-party from its own origin: cookies, sessions, API
// calls all live in portal.aqua.com. Same model as Intercom, Crisp,
// Calendly — host sites embed; we run our own world inside.
//
// Usage:
//   <EmbeddedPortal />                  default: /embed/login
//   <EmbeddedPortal mode="admin" />     route into /admin once signed in
//   <EmbeddedPortal siteId="felicia" /> tells the portal which tenant
//
// Communication: the embedded portal posts "ready" / "resize" /
// "auth-changed" via window.postMessage. We listen and resize the
// iframe accordingly. We never read tokens.

import { useEffect, useRef, useState } from "react";

interface Props {
  /** The portal origin. Defaults to NEXT_PUBLIC_AQUA_PORTAL_URL or window.location.origin. */
  portalUrl?: string;
  /** Which page to load — "login" boots the embed-friendly sign-in. "admin" lands directly in /admin. */
  mode?: "login" | "admin";
  /** Tenant id this site belongs to. Forwarded as ?siteId= so the portal can scope. */
  siteId?: string;
  /** Override starting height; we resize after the portal posts a "ready" message. */
  initialHeight?: number;
  /** Where to send the visitor if they hit "Back" inside the portal. Defaults to current page. */
  back?: string;
  className?: string;
}

interface ParentSignal {
  source: "portal-embed";
  type: "ready" | "resize" | "auth-changed";
  height?: number;
  authed?: boolean;
}

export default function EmbeddedPortal({
  portalUrl,
  mode = "login",
  siteId,
  initialHeight = 640,
  back,
  className,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(initialHeight);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    const origin = portalUrl
      ?? process.env.NEXT_PUBLIC_AQUA_PORTAL_URL
      ?? (typeof window !== "undefined" ? window.location.origin : "");
    if (!origin) return;
    const path = mode === "admin" ? "/admin" : "/embed/login";
    const params = new URLSearchParams();
    if (siteId) params.set("siteId", siteId);
    if (back ?? typeof window !== "undefined") {
      params.set("back", back ?? window.location.href);
    }
    const qs = params.toString();
    setSrc(`${origin}${path}${qs ? `?${qs}` : ""}`);
  }, [portalUrl, mode, siteId, back]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data as ParentSignal | undefined;
      if (!data || data.source !== "portal-embed") return;
      if (data.type === "ready" || data.type === "resize") {
        if (typeof data.height === "number" && data.height > 0) {
          setHeight(Math.max(360, data.height));
        }
      }
      // "auth-changed" deliberately ignored at the host layer — the
      // host doesn't manage portal sessions. Surface it via a custom
      // event for sites that want a UI hint ("Open admin →" badge etc).
      if (data.type === "auth-changed") {
        window.dispatchEvent(new CustomEvent("aqua-portal-auth", { detail: { authed: !!data.authed } }));
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!src) {
    return (
      <div
        className={className}
        style={{
          height: initialHeight,
          background: "rgba(0,0,0,0.04)",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          color: "rgba(0,0,0,0.5)",
        }}
      >
        Loading portal…
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      src={src}
      title="Aqua portal"
      // Allow forms (sign-in posts), same-origin (cookies inside the
      // iframe origin), modals, and clipboard for copy-link buttons
      // inside the portal admin. No payment / camera / geolocation —
      // portal doesn't need them.
      sandbox="allow-forms allow-same-origin allow-scripts allow-popups allow-modals allow-clipboard-write"
      style={{
        width: "100%",
        height,
        border: "none",
        borderRadius: 12,
        background: "transparent",
      }}
      className={className}
      // Hint to lazy-load when scrolled into view; the portal is
      // typically not above the fold on a marketing site.
      loading="lazy"
    />
  );
}
