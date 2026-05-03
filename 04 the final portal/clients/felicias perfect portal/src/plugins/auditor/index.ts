import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "auditor",
  name: "Site Auditor",
  version: "1.0.0",
  status: "stable",
  category: "ops",
  tagline: "PageSpeed Insights + Claude-formatted audit reports.",
  description: "Run on-demand or scheduled audits against the live site. Pulls Lighthouse scores from PageSpeed Insights and asks Claude to write an 8-section action report with prioritised fixes.",

  requires: ["website"],

  setup: [
    {
      id: "keys",
      title: "API keys",
      description: "Both keys are optional in dev (mock data is used) but required in production.",
      optional: true,
      fields: [
        { id: "psiApiKey", label: "PageSpeed Insights API key", type: "password" },
        { id: "anthropicApiKey", label: "Anthropic API key", type: "password" },
      ],
    },
  ],

  navItems: [
    { id: "auditor", label: "Site auditor", href: "/admin/site-test", order: 0 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "pagespeed", label: "PageSpeed Insights", default: true },
    { id: "claudeReports", label: "Claude-formatted reports", default: true },
    { id: "scheduledRuns", label: "Scheduled audits", default: false, plans: ["pro", "enterprise"] },
    { id: "competitorAudit", label: "Competitor benchmarking", default: false, plans: ["enterprise"] },
  ],

  settings: {
    groups: [
      {
        id: "limits",
        label: "Quotas",
        fields: [
          { id: "monthlyQuota", label: "Monthly audit quota", type: "number", default: 10 },
        ],
      },
      {
        id: "schedule",
        label: "Scheduled audits",
        description: "Only used when Scheduled audits feature is on.",
        fields: [
          { id: "frequency", label: "Frequency", type: "select", default: "weekly", options: [
            { value: "daily", label: "Daily" }, { value: "weekly", label: "Weekly" }, { value: "monthly", label: "Monthly" },
          ] },
          { id: "notifyEmail", label: "Notify email", type: "email" },
        ],
      },
    ],
  },
};

export default plugin;
