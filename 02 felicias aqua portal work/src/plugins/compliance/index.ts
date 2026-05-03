import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "compliance",
  name: "Compliance",
  version: "1.0.0",
  status: "stable",
  category: "support",
  tagline: "GDPR cookie banner, privacy policy, terms generator.",
  description: "Per-site cookie consent popup with GDPR-correct decline path, dynamic privacy policy and terms-of-service pages, data subject access request handling.",

  navItems: [
    { id: "compliance", label: "Compliance", href: "/admin/compliance", order: 0 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "cookiePopup", label: "Cookie consent popup", default: true },
    { id: "gdprMode", label: "GDPR-strict mode", description: "Block tracking until consent.", default: true },
    { id: "privacyPolicy", label: "Privacy policy generator", default: true },
    { id: "termsGenerator", label: "Terms of service generator", default: true },
    { id: "dsar", label: "DSAR (data subject access requests)", default: false, plans: ["pro", "enterprise"] },
    { id: "ccpa", label: "CCPA mode (California)", default: false, plans: ["enterprise"] },
  ],

  settings: {
    groups: [
      {
        id: "popup",
        label: "Cookie popup",
        fields: [
          { id: "bannerText", label: "Banner text", type: "textarea",
            default: "We use cookies to improve your experience. Accept all, or pick which ones you allow." },
          { id: "acceptLabel", label: "Accept-all label", type: "text", default: "Accept all" },
          { id: "declineLabel", label: "Decline label", type: "text", default: "Reject non-essential" },
          { id: "manageLabel", label: "Manage label", type: "text", default: "Manage preferences" },
        ],
      },
      {
        id: "legal",
        label: "Legal entities",
        fields: [
          { id: "companyName", label: "Company name", type: "text" },
          { id: "companyAddress", label: "Registered address", type: "textarea" },
          { id: "dpoEmail", label: "Data Protection Officer email", type: "email" },
        ],
      },
    ],
  },
};

export default plugin;
