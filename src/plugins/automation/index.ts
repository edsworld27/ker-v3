// Marketing-automation plugin — drip campaigns and rule-based actions.
//
// "When [event] then [action]" automation. Send welcome-series emails
// over 7 days after signup, tag a contact when they purchase a
// specific product, escalate to a Slack message on form submission
// from a high-value lead, etc.

import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "automation",
  name: "Marketing automation",
  version: "0.1.0",
  status: "alpha",
  category: "marketing",
  tagline: "Drip campaigns + rule-based actions: when X happens, do Y.",
  description: "Build automation rules with a no-code if-this-then-that editor. Triggers (form submitted, order paid, newsletter signup, anniversary date) → actions (send email, add tag, send webhook, wait N days, branch on condition). Drip campaigns = sequences of email sends with delays.",

  requires: ["website", "email"],

  navItems: [
    { id: "automation",       label: "Automations", href: "/admin/automation",          order: 0 },
    { id: "automation-runs",  label: "Run history", href: "/admin/automation/runs",     order: 1 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "dripCampaigns",  label: "Drip campaigns",                 default: true },
    { id: "ifThenThat",     label: "If-this-then-that automations",  default: true },
    { id: "delayedActions", label: "Wait N hours/days before action", default: true },
    { id: "branchingLogic", label: "Branching (if/else)",            default: false, plans: ["pro", "enterprise"] },
    { id: "smsActions",     label: "SMS as an action",               default: false, plans: ["enterprise"] },
    { id: "abPath",         label: "A/B path inside automation",     default: false, plans: ["enterprise"] },
  ],

  settings: {
    groups: [
      {
        id: "limits",
        label: "Limits",
        fields: [
          { id: "maxRulesPerOrg", label: "Max active rules", type: "number", default: 50 },
          { id: "maxRunsPerDay",  label: "Max automation runs / day", type: "number", default: 5000 },
        ],
      },
    ],
  },
};

export default plugin;
