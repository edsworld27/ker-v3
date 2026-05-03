import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "chatbot",
  name: "Chatbot",
  version: "1.0.0",
  status: "stable",
  category: "support",
  tagline: "AI chatbot widget on the storefront — Claude or GPT-4 backed.",
  description: "Embeddable chat widget that sits in the bottom-right of the site. Supports Claude (Anthropic) or GPT-4 (OpenAI) as backends, custom system prompt, quick replies, and brand-kit theming. Per-site config so different clients can run different prompts.",

  conflicts: [],

  setup: [
    {
      id: "provider",
      title: "Pick a provider",
      description: "Choose which LLM the chatbot calls. You can switch later in settings.",
      fields: [
        { id: "provider", label: "Provider", type: "select", required: true, options: [
          { value: "anthropic", label: "Claude (Anthropic)" },
          { value: "openai", label: "GPT-4 (OpenAI)" },
        ] },
        { id: "apiKey", label: "API key", type: "password", required: true, helpText: "Stored encrypted; only used server-side." },
      ],
    },
  ],

  navItems: [
    { id: "chatbot", label: "Chatbot", href: "/admin/tab/chatbot", order: 0 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "claudeProvider", label: "Claude provider", default: true },
    { id: "openaiProvider", label: "OpenAI provider", default: false },
    { id: "customPrompt", label: "Custom system prompt", default: true },
    { id: "quickReplies", label: "Quick reply chips", default: true },
    { id: "theming", label: "Brand-kit theming", default: true },
    { id: "transcript", label: "Save transcripts", default: false, plans: ["pro", "enterprise"] },
    { id: "humanHandoff", label: "Human handoff", description: "Escalate to support inbox.", default: false, plans: ["enterprise"] },
  ],

  settings: {
    groups: [
      {
        id: "model",
        label: "Model",
        fields: [
          { id: "provider", label: "Provider", type: "select", default: "anthropic", options: [
            { value: "anthropic", label: "Claude (Anthropic)" },
            { value: "openai", label: "GPT-4 (OpenAI)" },
          ] },
          { id: "modelId", label: "Model id", type: "text", default: "claude-sonnet-4-6" },
          { id: "temperature", label: "Temperature", type: "number", default: 0.7 },
          { id: "maxTokens", label: "Max tokens", type: "number", default: 1024 },
        ],
      },
      {
        id: "prompt",
        label: "System prompt",
        fields: [
          { id: "systemPrompt", label: "System prompt", type: "textarea",
            default: "You are a helpful assistant for this site. Be concise and friendly." },
          { id: "greeting", label: "Initial greeting", type: "text", default: "Hi! How can I help?" },
        ],
      },
    ],
  },
};

export default plugin;
