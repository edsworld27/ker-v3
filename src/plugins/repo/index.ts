import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "repo",
  name: "Repo Browser",
  version: "1.0.0",
  status: "beta",
  category: "ops",
  tagline: "Browse and edit the connected GitHub repository.",
  description: "Power-user plugin. Browse the connected GitHub repo's file tree, view files, run small edits and push commits. Useful when a client's site started outside Aqua and the operator needs to keep the codebase in sync.",

  setup: [
    {
      id: "github",
      title: "GitHub access",
      description: "Personal access token with repo scope. Stored encrypted, used server-side only.",
      fields: [
        { id: "token", label: "GitHub token (ghp_…)", type: "password", required: true },
        { id: "repoUrl", label: "Repo URL", type: "url", required: true, placeholder: "https://github.com/org/repo" },
      ],
    },
  ],

  navItems: [
    { id: "repo", label: "Repo browser", href: "/admin/repo", order: 0 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "browse", label: "Browse files", default: true },
    { id: "viewFile", label: "View file content", default: true },
    { id: "editFile", label: "Edit + commit", default: false, plans: ["pro", "enterprise"] },
    { id: "triggerDeploy", label: "Trigger Vercel deploy", default: false, plans: ["pro", "enterprise"] },
  ],

  settings: {
    groups: [
      {
        id: "github",
        label: "GitHub",
        fields: [
          { id: "repoUrl", label: "Repo URL", type: "url" },
          { id: "defaultBranch", label: "Default branch", type: "text", default: "main" },
          { id: "token", label: "Access token", type: "password" },
        ],
      },
    ],
  },
};

export default plugin;
