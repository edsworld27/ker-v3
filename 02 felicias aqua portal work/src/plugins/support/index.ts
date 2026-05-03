import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "support",
  name: "Support hub",
  version: "1.0.0",
  status: "stable",
  category: "support",
  tagline: "Feature requests, meeting bookings, invoices, knowledge base.",
  description: "Client-facing support area: submit feature requests, book onboarding/strategy meetings, view invoices, browse curated resources. Used by agency clients to get help without email ping-pong.",

  navItems: [
    { id: "support", label: "Support", href: "/admin/support", order: 0 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "featureRequests", label: "Feature requests inbox", default: true },
    { id: "meetings", label: "Meeting bookings", default: true },
    { id: "invoices", label: "Invoices view", default: true },
    { id: "resources", label: "Resources library", default: true },
    { id: "ticketing", label: "Support ticketing", default: false, plans: ["pro", "enterprise"] },
    { id: "slackBridge", label: "Slack bridge", default: false, plans: ["enterprise"] },
  ],

  settings: {
    groups: [
      {
        id: "meetings",
        label: "Meeting links",
        fields: [
          { id: "calendlyUrl", label: "Calendly URL", type: "url" },
          { id: "googleMeetUrl", label: "Google Meet room", type: "url" },
        ],
      },
    ],
  },
};

export default plugin;
