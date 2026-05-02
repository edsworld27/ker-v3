// Reservations plugin — booking system for time-based services.
//
// Use cases: restaurant tables, hair salon appointments, hotel
// rooms, doctor's office, event tickets, equipment rentals.
//
// Resources have availability windows; visitors pick a slot from
// the storefront. Booking confirmations and reminders go via the
// Email plugin.

import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "reservations",
  name: "Reservations / Bookings",
  version: "0.1.0",
  status: "alpha",
  category: "commerce",
  tagline: "Time-slot bookings for tables, rooms, services or events.",
  description: "Define resources (tables, rooms, services, equipment) with availability windows and capacity. Visitors pick a slot from the storefront; the system blocks double-bookings, sends confirmations + reminders via Email, and lets the operator manage the calendar from /admin/reservations.",

  requires: ["website", "email"],

  navItems: [
    { id: "reservations", label: "Reservations", href: "/admin/reservations", order: 0, panelId: "store", groupId: "members-group" },
    { id: "resources",    label: "Resources",    href: "/admin/reservations/resources", order: 1 },
    { id: "calendar",     label: "Calendar",     href: "/admin/reservations/calendar", order: 2 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "calendarView",     label: "Calendar view",                 default: true },
    { id: "groupBookings",    label: "Group / party-size bookings",   default: true },
    { id: "depositPayments",  label: "Require deposit at booking",    default: false, plans: ["pro", "enterprise"] },
    { id: "reminders",        label: "Email reminders (24h before)",  default: true },
    { id: "smsReminders",     label: "SMS reminders",                 default: false, plans: ["enterprise"] },
    { id: "waitlist",         label: "Waitlist for fully-booked slots", default: false },
    { id: "recurring",        label: "Recurring bookings",            default: false, plans: ["pro", "enterprise"] },
  ],

  settings: {
    groups: [
      {
        id: "general",
        label: "General",
        fields: [
          { id: "bookingPath",     label: "Booking URL path",            type: "text", default: "/book" },
          { id: "leadTimeMinutes", label: "Min lead time (minutes)",     type: "number", default: 60,
            helpText: "Don't allow bookings starting within this window." },
          { id: "maxFutureDays",   label: "Max days into the future",    type: "number", default: 90 },
          { id: "slotDuration",    label: "Default slot duration (min)", type: "number", default: 30 },
        ],
      },
      {
        id: "policies",
        label: "Policies",
        fields: [
          { id: "cancellationPolicy", label: "Cancellation policy", type: "textarea",
            default: "Cancel any time up to 24 hours before your booking for a full refund." },
          { id: "noShowPolicy", label: "No-show policy", type: "textarea" },
        ],
      },
    ],
  },
};

export default plugin;
