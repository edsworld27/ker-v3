// Webhooks plugin — outbound event dispatcher.
//
// Lets the operator point external systems at Aqua's internal
// events (order.created, form.submitted, subscription.cancelled,
// page.published, …) without writing a single line of code. Each
// configured webhook signs its payload with HMAC-SHA256 + the
// operator's secret so the receiver can verify authenticity.

import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "webhooks",
  name: "Webhooks",
  version: "0.1.0",
  status: "alpha",
  category: "ops",
  tagline: "Outbound webhooks for every internal event. HMAC-signed, retried, logged.",
  description: "Subscribe external systems to Aqua events. Configure URL + event filter + HMAC secret in the admin; we POST signed JSON on every match. Failed deliveries auto-retry with exponential backoff (3 attempts max). Per-org delivery log shows status, response code, payload preview.",

  navItems: [
    { id: "webhooks",     label: "Webhooks", href: "/admin/webhooks", order: 0, panelId: "settings" },
    { id: "webhook-log",  label: "Delivery log", href: "/admin/webhooks/log", order: 1 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "hmacSigning",  label: "HMAC-SHA256 signing",          default: true },
    { id: "retries",      label: "Auto-retry on failure",        default: true },
    { id: "filters",      label: "Per-webhook event filters",    default: true },
    { id: "transformations", label: "Payload transformations",   default: false, plans: ["pro", "enterprise"] },
    { id: "rateLimiting", label: "Per-receiver rate limiting",   default: false, plans: ["enterprise"] },
  ],

  settings: {
    groups: [
      {
        id: "defaults",
        label: "Defaults",
        fields: [
          { id: "maxRetries", label: "Max retry attempts", type: "number", default: 3 },
          { id: "timeoutMs",  label: "Request timeout (ms)", type: "number", default: 5000 },
          { id: "userAgent",  label: "User-Agent header", type: "text", default: "Aqua-Webhooks/0.1" },
        ],
      },
    ],
  },
};

export default plugin;
