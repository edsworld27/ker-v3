"use client";

// Auto-tracker for the Analytics plugin. Drop this in the storefront
// layout (or via the plugin's headInjection) and it sends a pageview
// every time the visitor navigates plus auto-instrumented click,
// scroll-depth and form-submit events.
//
// Reads the active org from a `data-org-id` attribute on <html> set
// by SiteResolver, falls back to a runtime-injected window var.
//
// Honours a localStorage opt-out flag (`lk_analytics_off=1`) so a
// visitor who declined cookies can still browse without their visit
// counting.

import { useEffect, useRef } from "react";

interface Props {
  // Pass orgId explicitly when the resolver isn't available
  // (e.g. on /admin pages). Empty disables tracking entirely.
  orgId?: string;
}

declare global {
  interface Window {
    __aquaSessionId?: string;
    __aquaAnalytics?: {
      track: (type: string, payload?: Record<string, unknown>) => void;
    };
  }
}

function getSessionId(): string {
  if (window.__aquaSessionId) return window.__aquaSessionId;
  let id = sessionStorage.getItem("lk_aqua_session");
  if (!id) {
    id = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem("lk_aqua_session", id);
  }
  window.__aquaSessionId = id;
  return id;
}

function isOptedOut(): boolean {
  try {
    return localStorage.getItem("lk_analytics_off") === "1";
  } catch { return false; }
}

export default function AnalyticsTracker({ orgId }: Props) {
  const lastPathRef = useRef<string | null>(null);
  const maxScrollRef = useRef(0);

  useEffect(() => {
    if (!orgId) return;
    if (isOptedOut()) return;

    function send(type: string, payload?: Record<string, unknown>, name?: string) {
      const path = window.location.pathname + window.location.search;
      void fetch("/api/portal/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          type,
          name,
          path,
          sessionId: getSessionId(),
          payload,
          referrer: document.referrer || undefined,
        }),
        keepalive: true,
      }).catch(() => undefined);
    }

    // Initial pageview
    function pageview() {
      const path = window.location.pathname + window.location.search;
      if (lastPathRef.current === path) return;
      lastPathRef.current = path;
      maxScrollRef.current = 0;
      send("pageview");
    }
    pageview();

    // Expose for manual `track('event_name')` calls.
    window.__aquaAnalytics = {
      track(type, payload) { send("custom", payload, type); },
    };

    // SPA navigation hook — Next.js dispatches a popstate; we also
    // monkey-patch pushState/replaceState so client-side route changes
    // emit a pageview.
    const origPush = history.pushState;
    const origReplace = history.replaceState;
    history.pushState = function (...args) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = origPush.apply(this, args as any);
      pageview();
      return result;
    };
    history.replaceState = function (...args) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = origReplace.apply(this, args as any);
      pageview();
      return result;
    };
    window.addEventListener("popstate", pageview);

    // Click tracking — anchor + button by default; pass an opt-out
    // class to skip elements (data-no-track or class="no-track").
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const trackable = target.closest("a, button, [data-track]") as HTMLElement | null;
      if (!trackable) return;
      if (trackable.matches(".no-track, [data-no-track]")) return;
      const rect = trackable.getBoundingClientRect();
      send("click", {
        tag: trackable.tagName.toLowerCase(),
        text: (trackable.textContent ?? "").trim().slice(0, 80),
        href: (trackable as HTMLAnchorElement).href,
        x: e.pageX,
        y: e.pageY,
        elX: Math.round(rect.left + rect.width / 2),
        elY: Math.round(rect.top + rect.height / 2),
      });
    }

    // Form submit
    function onSubmit(e: SubmitEvent) {
      const target = e.target as HTMLFormElement | null;
      if (!target) return;
      send("form-submit", {
        formId: target.id || target.getAttribute("name") || "anon",
        action: target.action || undefined,
      });
    }

    // Scroll-depth — emit at 25/50/75/100% thresholds.
    const SCROLL_MARKS = [25, 50, 75, 100];
    function onScroll() {
      const h = document.documentElement;
      const scrolled = h.scrollTop + window.innerHeight;
      const total = h.scrollHeight;
      if (total <= 0) return;
      const pct = Math.min(100, Math.round((scrolled / total) * 100));
      for (const mark of SCROLL_MARKS) {
        if (pct >= mark && maxScrollRef.current < mark) {
          maxScrollRef.current = mark;
          send("scroll", { depth: mark });
        }
      }
    }

    document.addEventListener("click", onClick, { capture: true });
    document.addEventListener("submit", onSubmit, { capture: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("submit", onSubmit, { capture: true });
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("popstate", pageview);
      history.pushState = origPush;
      history.replaceState = origReplace;
      delete window.__aquaAnalytics;
    };
  }, [orgId]);

  return null;
}
