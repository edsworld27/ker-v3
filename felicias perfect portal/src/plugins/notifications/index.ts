// Notifications plugin — in-app + email + browser push.
//
// Adds a notification bell to the admin chrome, an in-app
// notification centre at /admin/notifications, an email digest
// at configurable cadence, and Web Push API integration for
// browser-level push. Drives off the same event bus as
// Webhooks / Automation, so any plugin event can become a
// notification.

import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "notifications",
  name: "Notifications",
  version: "0.1.0",
  status: "alpha",
  category: "ops",
  tagline: "In-app, email and browser-push notifications for any event.",
  description: "Subscribes to the event bus and converts events into notifications. Per-user feed in the admin (bell icon + /admin/notifications). Optional email digest (immediate / hourly / daily). Browser push via the Web Push API for desktop + mobile notifications even when the admin tab is closed.",

  navItems: [
    { id: "notifications",          label: "Notifications", href: "/admin/notifications", order: 0, panelId: "settings" },
    { id: "notifications-settings", label: "Preferences",   href: "/admin/notifications/preferences", order: 1 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "inApp",          label: "In-app notification bell",        default: true },
    { id: "emailDigest",    label: "Email digest",                    default: true },
    { id: "browserPush",    label: "Browser push notifications",      default: false, plans: ["pro", "enterprise"] },
    { id: "smsAlerts",      label: "SMS alerts (Twilio)",             default: false, plans: ["enterprise"] },
    { id: "perUserPrefs",   label: "Per-user notification preferences", default: true },
    { id: "soundEffects",   label: "Sound effects on new notification", default: false },
  ],

  settings: {
    groups: [
      {
        id: "digest",
        label: "Email digest",
        fields: [
          { id: "digestFrequency", label: "Digest frequency", type: "select", default: "immediate",
            options: [
              { value: "immediate", label: "Immediate (every event)" },
              { value: "hourly",    label: "Hourly" },
              { value: "daily",     label: "Daily" },
              { value: "weekly",    label: "Weekly" },
              { value: "off",       label: "Off" },
            ] },
          { id: "digestRecipients", label: "Default digest recipients (csv emails)", type: "text" },
        ],
      },
      {
        id: "events",
        label: "Which events trigger notifications",
        fields: [
          { id: "notifyOnOrders",          label: "Orders (created / paid / refunded)", type: "boolean", default: true },
          { id: "notifyOnFormSubmissions", label: "Form submissions",                   type: "boolean", default: true },
          { id: "notifyOnBookings",        label: "Bookings (created / cancelled)",      type: "boolean", default: true },
          { id: "notifyOnSubscriptions",   label: "Subscription events",                type: "boolean", default: true },
          { id: "notifyOnNewsletter",      label: "Newsletter signups",                 type: "boolean", default: false },
          { id: "notifyOnPluginInstalls",  label: "Plugin installs / config changes",   type: "boolean", default: false },
        ],
      },
      {
        id: "push",
        label: "Browser push",
        description: "Only used when Browser push feature is on.",
        fields: [
          { id: "vapidPublicKey",  label: "VAPID public key",  type: "text" },
          { id: "vapidPrivateKey", label: "VAPID private key", type: "password" },
          { id: "pushSubject",     label: "Subject (mailto:…)", type: "text", placeholder: "mailto:admin@example.com" },
        ],
      },
    ],
  },
};

export default plugin;
