// Audit log plugin — every admin mutation gets a row.
//
// Compliance-grade audit trail. Records who did what, when, from
// which IP. Hooks into the event bus + extends with admin-action
// events. Required for SOC 2 / HIPAA-conscious orgs (the
// Compliance plugin auto-enables it under HIPAA mode).

import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "auditlog",
  name: "Audit log",
  version: "0.1.0",
  status: "alpha",
  category: "ops",
  tagline: "Compliance-grade activity log for every admin action.",
  description: "Records every admin-side mutation: logins, role changes, plugin installs, settings updates, content publishes, customer data exports. Each entry has actor, IP, timestamp, target resource, before/after diff. Filterable by actor / resource / date range. Mandatory for SOC 2 + HIPAA modes.",

  navItems: [
    { id: "auditlog", label: "Audit log", href: "/admin/auditlog", order: 0 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "adminActions",   label: "Admin action logging",       default: true },
    { id: "loginAttempts",  label: "Login attempts (success + failure)", default: true },
    { id: "dataExports",    label: "Data export logging",        default: true },
    { id: "configChanges",  label: "Plugin config change logging", default: true },
    { id: "diffViewer",     label: "Before/after diff viewer",   default: false, plans: ["pro", "enterprise"] },
    { id: "siemExport",     label: "SIEM export (Splunk / Datadog)", default: false, plans: ["enterprise"] },
  ],

  settings: {
    groups: [
      {
        id: "retention",
        label: "Retention",
        fields: [
          { id: "retentionDays", label: "Retention (days)", type: "number", default: 365,
            helpText: "HIPAA requires 6 years (2190 days)." },
        ],
      },
      {
        id: "siem",
        label: "SIEM export",
        description: "Only used when SIEM export feature is on.",
        fields: [
          { id: "siemEndpoint", label: "Endpoint URL",  type: "url" },
          { id: "siemToken",    label: "Auth token",   type: "password" },
        ],
      },
    ],
  },
};

export default plugin;
