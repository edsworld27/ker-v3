"use client";

import { useEffect } from "react";
import { resolveSiteByHost, onSitesChange, type Site } from "@/lib/admin/sites";

// Resolves the visitor's hostname to a registered site and exposes it via:
//   - <html data-site="luvandker"> for CSS targeting
//   - window.__site for component-level access
//   - localStorage("lk_resolved_site") so SSR can read it on next nav
//
// This runs on every page so a visitor staying on luvandker.com always sees
// the Luv & Ker brand, and a visitor on felicia.com sees Felicia's.

declare global {
  interface Window {
    __site?: Site;
  }
}

export default function SiteResolver() {
  useEffect(() => {
    function resolve() {
      const host = window.location.hostname;
      const site = resolveSiteByHost(host);
      document.documentElement.setAttribute("data-site", site.id);
      window.__site = site;
      try {
        localStorage.setItem("lk_resolved_site", JSON.stringify({ id: site.id, name: site.name, ts: Date.now() }));
      } catch {}
    }
    resolve();
    return onSitesChange(resolve);
  }, []);

  return null;
}
