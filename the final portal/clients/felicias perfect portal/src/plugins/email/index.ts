// Email plugin — NEW. Fills the current "no email infra" gap.
// Transactional email via Resend or Postmark, with reusable templates.
// E-commerce uses this for order confirmations + digital delivery;
// Forms uses it for submission notifications; Blog uses it for
// newsletter dispatches.

import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "email",
  name: "Email",
  version: "0.1.0",
  status: "alpha",
  category: "marketing",
  tagline: "Transactional email, templates, newsletter. Resend or Postmark.",
  description: "Send transactional email (order confirmations, password resets, form notifications, digital download links). Built-in template library with {{variable}} interpolation. Optional newsletter mode for blog post dispatch and segment-based sends.",

  setup: [
    {
      id: "provider",
      title: "Email provider",
      description: "Aqua sends via your provider — we don't relay. Resend is the simplest to set up.",
      fields: [
        { id: "provider", label: "Provider", type: "select", required: true, options: [
          { value: "resend", label: "Resend" },
          { value: "postmark", label: "Postmark" },
          { value: "smtp", label: "SMTP (custom)" },
        ] },
        { id: "apiKey", label: "API key", type: "password", required: true },
        { id: "fromAddress", label: "From address", type: "email", required: true, placeholder: "hello@yourbrand.com" },
        { id: "replyTo", label: "Reply-to", type: "email" },
      ],
    },
  ],

  navItems: [
    { id: "email", label: "Email", href: "/admin/email", order: 0 },
    { id: "templates", label: "Templates", href: "/admin/email/templates", order: 1 },
    { id: "newsletter", label: "Newsletter", href: "/admin/email/newsletter", order: 2, requiresFeature: "newsletter" },
  ],

  pages: [],
  api: [],

  features: [
    { id: "transactional", label: "Transactional sends", default: true },
    { id: "templates", label: "Template library", default: true },
    { id: "newsletter", label: "Newsletter mode", default: false, plans: ["pro", "enterprise"] },
    { id: "segments", label: "Audience segments", default: false, plans: ["enterprise"] },
    { id: "automations", label: "Drip automations", default: false, plans: ["enterprise"] },
  ],

  settings: {
    groups: [
      {
        id: "provider",
        label: "Provider",
        fields: [
          { id: "provider", label: "Provider", type: "select", default: "resend", options: [
            { value: "resend", label: "Resend" },
            { value: "postmark", label: "Postmark" },
            { value: "smtp", label: "SMTP" },
          ] },
          { id: "apiKey", label: "API key", type: "password" },
          { id: "fromAddress", label: "From address", type: "email" },
          { id: "fromName", label: "From name", type: "text" },
          { id: "replyTo", label: "Reply-to", type: "email" },
        ],
      },
      {
        id: "smtp",
        label: "SMTP",
        description: "Only used when provider = SMTP.",
        fields: [
          { id: "smtpHost", label: "Host", type: "text" },
          { id: "smtpPort", label: "Port", type: "number", default: 587 },
          { id: "smtpUser", label: "User", type: "text" },
          { id: "smtpPass", label: "Password", type: "password" },
        ],
      },
    ],
  },
};

export default plugin;
