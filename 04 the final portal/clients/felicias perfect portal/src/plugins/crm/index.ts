// CRM plugin — basic contact + deal tracking.
//
// Lighter than Salesforce, heavier than a spreadsheet. Tracks
// contacts (email, phone, name, tags), deals with stages, notes,
// tasks. Pulls in form submissions automatically — every contact
// form submitter becomes a contact.

import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "crm",
  name: "CRM / Contacts",
  version: "0.1.0",
  status: "alpha",
  category: "marketing",
  tagline: "Contacts, deals, notes. Auto-imports from Forms + E-commerce.",
  description: "Lightweight CRM. Contacts (auto-pulled from form submissions and e-commerce orders), deals with custom stages (Lead → Qualified → Won / Lost), notes, tasks with due dates. Bulk export to CSV. Slack-style activity feed per contact.",

  requires: ["website"],

  navItems: [
    { id: "crm",           label: "CRM",       href: "/admin/crm",       order: 0, panelId: "store" },
    { id: "crm-contacts",  label: "Contacts",  href: "/admin/crm/contacts", order: 1 },
    { id: "crm-deals",     label: "Deals",     href: "/admin/crm/deals",  order: 2 },
    { id: "crm-tasks",     label: "Tasks",     href: "/admin/crm/tasks",  order: 3 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "contacts",       label: "Contacts",                  default: true },
    { id: "deals",          label: "Deal pipeline",             default: true },
    { id: "tasks",          label: "Tasks + reminders",         default: true },
    { id: "notes",          label: "Per-contact notes",         default: true },
    { id: "tags",           label: "Tags",                      default: true },
    { id: "autoImport",     label: "Auto-import from Forms + E-commerce", default: true },
    { id: "csvExport",      label: "CSV export",                default: true },
    { id: "leadScoring",    label: "Lead scoring",              default: false, plans: ["pro", "enterprise"] },
    { id: "emailIntegration", label: "Email thread sync",       default: false, plans: ["enterprise"] },
  ],

  settings: {
    groups: [
      {
        id: "stages",
        label: "Deal stages",
        fields: [
          { id: "stages", label: "Pipeline stages (comma-separated)", type: "text",
            default: "Lead,Qualified,Proposal,Negotiation,Won,Lost",
            helpText: "Order matters. First stage is where new deals land." },
        ],
      },
      {
        id: "import",
        label: "Auto-import",
        fields: [
          { id: "importFormSubmissions", label: "Import contact form submissions",  type: "boolean", default: true },
          { id: "importOrderCustomers",  label: "Import e-commerce customers",      type: "boolean", default: true },
          { id: "importNewsletter",      label: "Import newsletter subscribers",    type: "boolean", default: false },
        ],
      },
    ],
  },
};

export default plugin;
