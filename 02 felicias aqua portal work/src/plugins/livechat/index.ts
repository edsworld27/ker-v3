// Live Chat plugin — real-time visitor messaging.
//
// Different from the Chatbot plugin: chatbot is AI-backed, automated;
// Live Chat is human-to-human. Visitor opens a widget, types a
// message, the operator sees it in /admin/livechat and replies.
// Messages persist so a returning visitor sees the thread.

import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "livechat",
  name: "Live Chat",
  version: "0.1.0",
  status: "alpha",
  category: "support",
  tagline: "Real-time human-to-human messaging on the storefront.",
  description: "Drops a chat widget on the storefront. Visitors send messages; operators reply from /admin/livechat. Threads persist so returning visitors see history. Optional canned replies, file attachments, and after-hours auto-responder.",

  conflicts: [],

  navItems: [
    { id: "livechat",        label: "Live chat", href: "/admin/livechat", order: 0, panelId: "store", groupId: "marketing-group" },
    { id: "livechat-canned", label: "Canned replies", href: "/admin/livechat/canned", order: 1 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "widget",           label: "Visitor widget",         default: true },
    { id: "cannedReplies",    label: "Canned reply library",   default: true },
    { id: "attachments",      label: "File attachments",       default: false, plans: ["pro", "enterprise"] },
    { id: "afterHoursAutoresponder", label: "After-hours auto-responder", default: true },
    { id: "unreadBadge",      label: "Operator unread badge",  default: true },
    { id: "visitorTyping",    label: "Visitor typing indicator", default: true },
    { id: "audioNotification", label: "Audio notification on new message", default: true },
  ],

  settings: {
    groups: [
      {
        id: "widget",
        label: "Widget",
        fields: [
          { id: "greeting", label: "Initial greeting", type: "text", default: "Hi! How can we help?" },
          { id: "placeholder", label: "Input placeholder", type: "text", default: "Type your message…" },
          { id: "position", label: "Widget position", type: "select", default: "bottom-right",
            options: [
              { value: "bottom-right", label: "Bottom right" },
              { value: "bottom-left", label: "Bottom left" },
            ] },
        ],
      },
      {
        id: "hours",
        label: "Hours",
        fields: [
          { id: "hoursStart", label: "Start (24h, e.g. 09:00)", type: "text", default: "09:00" },
          { id: "hoursEnd",   label: "End (24h, e.g. 17:00)",   type: "text", default: "17:00" },
          { id: "timezone",   label: "Timezone (IANA, e.g. Europe/London)", type: "text", default: "Europe/London" },
          { id: "afterHoursMessage", label: "After-hours auto-reply", type: "textarea",
            default: "We're offline right now. Leave a message and we'll get back to you tomorrow." },
        ],
      },
    ],
  },
};

export default plugin;
