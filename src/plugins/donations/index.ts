// Donations plugin — for charity / non-profit / creator sites.
//
// One-off and recurring donations via Stripe. Suggested amounts,
// custom amount input, donation goals with progress bar, donor
// recognition (with opt-in display), Gift Aid for UK charities.

import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "donations",
  name: "Donations",
  version: "0.1.0",
  status: "alpha",
  category: "commerce",
  tagline: "One-off + recurring donations. Goals, donor wall, Gift Aid.",
  description: "Add donation buttons / forms to any page. One-off or recurring (via Subscriptions plugin). Suggested amounts + free-text input. Optional donation goals with a progress bar. Donor recognition wall with opt-in. UK Gift Aid claim helpers.",

  requires: ["website", "ecommerce"],

  navItems: [
    { id: "donations",       label: "Donations", href: "/admin/donations",          order: 0 },
    { id: "donation-goals",  label: "Goals",     href: "/admin/donations/goals",    order: 1 },
    { id: "donors",          label: "Donors",    href: "/admin/donations/donors",   order: 2 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "oneOff",           label: "One-off donations",         default: true },
    { id: "recurring",        label: "Recurring donations",       default: false, requires: [] },
    { id: "goals",            label: "Donation goals",            default: true },
    { id: "donorWall",        label: "Donor recognition wall",    default: false },
    { id: "anonymousOption",  label: "Anonymous donation toggle", default: true },
    { id: "giftAid",          label: "UK Gift Aid claims",        default: false },
    { id: "messageWithDonation", label: "Donor message field",    default: true },
    { id: "matchedGiving",    label: "Employer match lookup",     default: false, plans: ["enterprise"] },
  ],

  settings: {
    groups: [
      {
        id: "amounts",
        label: "Suggested amounts",
        fields: [
          { id: "currency", label: "Currency", type: "select", default: "gbp", options: [
            { value: "gbp", label: "GBP" }, { value: "usd", label: "USD" }, { value: "eur", label: "EUR" },
          ] },
          { id: "amounts", label: "Comma-separated amounts (in major units)", type: "text", default: "5,10,25,50,100" },
          { id: "allowCustomAmount", label: "Allow custom amount", type: "boolean", default: true },
          { id: "minimumAmount", label: "Minimum amount", type: "number", default: 1 },
        ],
      },
      {
        id: "thanks",
        label: "Thank you",
        fields: [
          { id: "successHeadline", label: "Success page headline", type: "text", default: "Thank you for your support" },
          { id: "successMessage",  label: "Success page message",  type: "textarea",
            default: "Your generosity makes our work possible. We'll send a receipt to your email shortly." },
        ],
      },
      {
        id: "giftaid",
        label: "Gift Aid",
        description: "UK only. Only used when Gift Aid feature is on.",
        fields: [
          { id: "charityNumber", label: "Registered charity number", type: "text" },
          { id: "claimingHmrc",  label: "Charity name on HMRC", type: "text" },
        ],
      },
    ],
  },
};

export default plugin;
