// Backups plugin — scheduled exports of org data.
//
// Daily / weekly / monthly snapshots of the org's storage state +
// uploaded media. Stored in S3-compatible object storage (or
// downloaded as a ZIP). Mandatory for SOC 2 compliance.

import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "backups",
  name: "Backups",
  version: "0.1.0",
  status: "alpha",
  category: "ops",
  tagline: "Scheduled snapshots of your org data + media. Restorable.",
  description: "Automated backups of all org data (state JSON + uploaded media). Daily/weekly/monthly schedules. Stored in S3-compatible object storage with configurable retention. One-click restore in the admin. Required reading for SOC 2.",

  navItems: [
    { id: "backups",        label: "Backups",  href: "/admin/backups",       order: 0 },
    { id: "backups-restore", label: "Restore", href: "/admin/backups/restore", order: 1 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "scheduled",     label: "Scheduled backups",         default: true },
    { id: "manualBackup",  label: "On-demand backup",          default: true },
    { id: "downloadZip",   label: "Download as ZIP",           default: true },
    { id: "s3Compatible",  label: "S3-compatible storage",     default: false, plans: ["pro", "enterprise"] },
    { id: "encryptedAtRest", label: "Encrypted at rest",       default: false, plans: ["enterprise"] },
    { id: "pointInTimeRestore", label: "Point-in-time restore", default: false, plans: ["enterprise"] },
  ],

  settings: {
    groups: [
      {
        id: "schedule",
        label: "Schedule",
        fields: [
          { id: "frequency", label: "Frequency", type: "select", default: "daily",
            options: [
              { value: "daily",   label: "Daily" },
              { value: "weekly",  label: "Weekly" },
              { value: "monthly", label: "Monthly" },
            ] },
          { id: "hour", label: "Hour (24h, UTC)", type: "number", default: 3 },
          { id: "retention", label: "Retain backups (count)", type: "number", default: 14 },
        ],
      },
      {
        id: "storage",
        label: "S3-compatible storage",
        description: "Only used when S3-compatible feature is on.",
        fields: [
          { id: "bucket",      label: "Bucket name",  type: "text" },
          { id: "region",      label: "Region",       type: "text" },
          { id: "endpoint",    label: "Endpoint URL (optional)", type: "url" },
          { id: "accessKeyId", label: "Access key id", type: "text" },
          { id: "secretAccessKey", label: "Secret access key", type: "password" },
        ],
      },
    ],
  },
};

export default plugin;
