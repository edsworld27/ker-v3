// Analytics plugin — NEW. Fills the current "no real analytics" gap
// in the codebase. Self-hosted page-view + event tracking with
// privacy-friendly defaults, plus optional integrations with Google
// Analytics and PostHog for clients who want a third-party stack.
//
// Heatmaps land here too as a feature toggle (Pro+) — visit-replay
// style click + scroll heatmaps, generated server-side from raw
// event streams to avoid third-party trackers.

import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "analytics",
  name: "Analytics",
  version: "0.1.0",
  status: "alpha",
  category: "marketing",
  tagline: "Pageviews, events, heatmaps. Privacy-friendly by default.",
  description: "Self-hosted analytics — pageviews, custom events, conversion tracking, scroll-depth, click heatmaps. No cookies in the default setup; opt-in to GDPR mode if you want consent-gated tracking. Optional Google Analytics + PostHog passthrough for clients with existing dashboards.",

  navItems: [
    { id: "analytics", label: "Analytics", href: "/admin/analytics", order: 0 },
    { id: "heatmaps", label: "Heatmaps", href: "/admin/analytics/heatmaps", order: 1, requiresFeature: "heatmaps" },
  ],

  pages: [],
  api: [],

  features: [
    { id: "pageviews", label: "Page views", default: true },
    { id: "events", label: "Custom events", default: true },
    { id: "scrollTracking", label: "Scroll depth tracking", default: true },
    { id: "heatmaps", label: "Click heatmaps", default: false, plans: ["pro", "enterprise"] },
    { id: "sessionRecording", label: "Session replay", default: false, plans: ["enterprise"] },
    { id: "funnelTracking", label: "Funnel tracking", default: true },
    { id: "googleAnalytics", label: "Google Analytics passthrough", default: false },
    { id: "posthog", label: "PostHog passthrough", default: false },
    { id: "gdprMode", label: "Consent-gated tracking (GDPR)", default: false },
  ],

  settings: {
    groups: [
      {
        id: "general",
        label: "General",
        fields: [
          { id: "retentionDays", label: "Event retention (days)", type: "number", default: 90 },
          { id: "samplingRate", label: "Sampling rate (%)", type: "number", default: 100,
            helpText: "Drop a percentage of events to save storage on high-traffic sites." },
        ],
      },
      {
        id: "ga",
        label: "Google Analytics",
        fields: [
          { id: "gaTrackingId", label: "GA4 measurement ID", type: "text", placeholder: "G-XXXXXXXXXX" },
        ],
      },
      {
        id: "posthog",
        label: "PostHog",
        fields: [
          { id: "posthogProjectKey", label: "Project API key", type: "password" },
          { id: "posthogHost", label: "Host", type: "url", default: "https://app.posthog.com" },
        ],
      },
    ],
  },
};

export default plugin;
