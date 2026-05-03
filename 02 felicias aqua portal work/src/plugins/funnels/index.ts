import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "funnels",
  name: "Funnels & A/B",
  version: "1.0.0",
  status: "stable",
  category: "marketing",
  tagline: "Multi-step funnels, split tests, conversion goals.",
  description: "Build multi-step funnels (landing → opt-in → thank-you) in the editor, run A/B tests on any block group, define conversion goals tied to product purchases or form submissions, see lift over time.",

  requires: ["website"],

  navItems: [
    { id: "funnels", label: "Funnels", href: "/admin/funnels", order: 0 },
    { id: "splitTests", label: "Split tests", href: "/admin/split-tests", order: 1, requiresFeature: "splitTests" },
  ],

  pages: [],
  api: [],

  features: [
    { id: "splitTests", label: "A/B split tests", default: true },
    { id: "funnels", label: "Multi-step funnels", default: true },
    { id: "conversionGoals", label: "Conversion goals", default: true },
    { id: "multivariate", label: "Multivariate (>2 variants)", default: false, plans: ["pro", "enterprise"] },
    { id: "geoTargeting", label: "Geo-targeted variants", default: false, plans: ["enterprise"] },
  ],

  settings: {
    groups: [
      {
        id: "general",
        label: "General",
        fields: [
          { id: "minSampleSize", label: "Min sample size before declaring winner", type: "number", default: 200 },
          { id: "confidenceThreshold", label: "Confidence threshold (%)", type: "number", default: 95 },
        ],
      },
    ],
  },
};

export default plugin;
