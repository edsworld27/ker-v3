"use client";

// Streams Core Web Vitals (LCP, CLS, INP, FCP, TTFB, FID) into the
// portal's heartbeat endpoint so each connected site builds up a
// rolling picture of real-user perf without an extra dependency.
//
// Implementation notes:
//   - `useReportWebVitals` from `next/web-vitals` ships with Next; no
//     new package is added.
//   - We piggy-back on `/api/portal/heartbeat` (already CORS-open, body-
//     capped, rate-limited) by sending a heartbeat-shaped envelope with
//     `event: "web-vitals"` and the metric serialised in `title`. The
//     heartbeat handler doesn't (yet) persist these as first-class data,
//     but they show up in the activity stream, which is enough to spot
//     regressions until a dedicated metrics sink is added.
//   - `navigator.sendBeacon` keeps the report alive across pagehide; we
//     fall back to `fetch(... keepalive: true)` when the API isn't
//     present (older Safari, embedded webviews).

import { useReportWebVitals } from "next/web-vitals";

interface WebVitalMetric {
  id: string;
  name: string;
  value: number;
  rating?: "good" | "needs-improvement" | "poor";
  delta?: number;
  navigationType?: string;
}

function siteIdFromTag(): string {
  if (typeof document === "undefined") return "luvandker";
  const tag = document.querySelector<HTMLScriptElement>("script[data-portal-site]");
  return tag?.getAttribute("data-portal-site") ?? "luvandker";
}

function postMetric(metric: WebVitalMetric) {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify({
    siteId: siteIdFromTag(),
    event: "web-vitals",
    url: window.location.href,
    // The heartbeat schema accepts `title` as a free-form string. We
    // pack the metric details into it so the report flows through with
    // no API change required.
    title: JSON.stringify({
      name: metric.name,
      value: Math.round(metric.value * 100) / 100,
      rating: metric.rating,
      navigationType: metric.navigationType,
    }),
    path: window.location.pathname,
  });

  try {
    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "text/plain" });
      const ok = navigator.sendBeacon("/api/portal/heartbeat", blob);
      if (ok) return;
    }
  } catch {
    /* fall through to fetch */
  }

  // Best-effort fallback. `keepalive` lets the request survive a
  // navigation; we swallow errors so a flaky network never breaks the
  // page.
  try {
    void fetch("/api/portal/heartbeat", {
      method: "POST",
      body: payload,
      keepalive: true,
      headers: { "Content-Type": "text/plain" },
    }).catch(() => { /* ignore */ });
  } catch {
    /* ignore */
  }
}

export default function WebVitalsReporter() {
  useReportWebVitals((metric: WebVitalMetric) => {
    postMetric(metric);
  });
  return null;
}
