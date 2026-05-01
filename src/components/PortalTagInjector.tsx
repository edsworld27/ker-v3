"use client";

import { useEffect } from "react";

// Injects the portal loader script (`/portal/tag.js`) into the host
// site's <head> on mount. Lives in the root layout so every storefront
// page gets the tag — heartbeats, tracker aggregator, and content
// overrides all hang off this single tag.
//
// The data-portal-site attribute is read by both the tag itself (for
// heartbeats + content fetches) and our local portalCache module (which
// looks for a script element with this attribute to pick up the active
// site id).
//
// Idempotent: if a tag is already present we don't add another.

const SITE_ID = "luvandker";          // primary site for this storefront
const TAG_ID  = "portal-tag";

export default function PortalTagInjector() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(TAG_ID)) return;
    const s = document.createElement("script");
    s.id = TAG_ID;
    s.src = "/portal/tag.js";
    s.async = true;
    s.setAttribute("data-site", SITE_ID);
    s.setAttribute("data-portal-site", SITE_ID);   // read by portalCache
    document.head.appendChild(s);
    // We deliberately don't remove on unmount — the tag should persist
    // for the lifetime of the page even if React re-renders the root.
  }, []);
  return null;
}
