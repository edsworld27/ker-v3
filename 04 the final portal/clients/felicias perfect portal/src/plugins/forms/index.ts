import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "forms",
  name: "Forms",
  version: "1.0.0",
  status: "stable",
  category: "content",
  tagline: "Login, signup, contact and custom forms — drag into any page.",
  description: "Form blocks (login, signup, social-auth, contact, custom) for the visual editor. Submissions land in a per-org inbox; webhook notifications dispatch on submit; spam protection via honeypot + optional Turnstile.",

  requires: ["website"],

  navItems: [
    { id: "forms", label: "Forms", href: "/admin/forms", order: 0 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "loginForm", label: "Login form block", default: true },
    { id: "signupForm", label: "Signup form block", default: true },
    { id: "socialAuth", label: "Social auth (Google, GitHub)", default: false, plans: ["pro", "enterprise"] },
    { id: "customForms", label: "Custom forms", description: "Build arbitrary forms with the form builder.", default: true },
    { id: "webhooks", label: "Webhook on submit", default: false, plans: ["pro", "enterprise"] },
    { id: "turnstile", label: "Cloudflare Turnstile spam protection", default: false },
    { id: "honeypot", label: "Honeypot fields", default: true },
  ],

  settings: {
    groups: [
      {
        id: "delivery",
        label: "Submission delivery",
        fields: [
          { id: "notifyEmail", label: "Notify email", type: "email", helpText: "Where new submissions are emailed." },
          { id: "webhookUrl", label: "Webhook URL", type: "url" },
          { id: "webhookSecret", label: "Webhook signing secret", type: "password" },
        ],
      },
      {
        id: "spam",
        label: "Spam protection",
        fields: [
          { id: "turnstileSiteKey", label: "Turnstile site key", type: "text" },
          { id: "turnstileSecret", label: "Turnstile secret", type: "password" },
        ],
      },
    ],
  },
};

export default plugin;
