// Brand Kit — core plugin. Auto-installed on every org, can't be removed.
// Owns logo, colour palette, fonts, favicon. Everything else (Website,
// E-commerce, etc) reads from this plugin's config to stay on-brand.

import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "brand",
  name: "Brand Kit",
  version: "1.0.0",
  status: "stable",
  category: "core",
  core: true,
  tagline: "Logo, palette, fonts — the visual identity every other plugin reads from.",
  description: "Centralised brand assets for the org. Other plugins (Website, E-commerce, Email, Chatbot) inherit colours, fonts and logo from here so the whole portal stays on-brand without per-plugin duplication.",

  navItems: [
    { id: "brand", label: "Brand kit", href: "/admin/customise", order: 0 },
    { id: "themes", label: "Themes", href: "/admin/themes", order: 1 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "logoUpload", label: "Logo upload", default: true },
    { id: "paletteEditor", label: "Palette editor", default: true },
    { id: "fontPicker", label: "Font picker", default: true },
    { id: "faviconUpload", label: "Favicon upload", default: true },
    { id: "darkLightVariants", label: "Light/dark logo variants", default: false },
  ],

  settings: {
    groups: [
      {
        id: "identity",
        label: "Identity",
        fields: [
          { id: "panelName", label: "Portal name", type: "text", default: "Aqua" },
          { id: "shortName", label: "Short name (sidebar)", type: "text", default: "AQUA" },
          { id: "logoUrl", label: "Logo URL", type: "url" },
          { id: "faviconUrl", label: "Favicon URL", type: "url" },
        ],
      },
      {
        id: "palette",
        label: "Colour palette",
        fields: [
          { id: "primary", label: "Primary", type: "color", default: "#06b6d4" },
          { id: "accent", label: "Accent", type: "color", default: "#f59e0b" },
          { id: "background", label: "Background", type: "color", default: "#06121f" },
          { id: "surface", label: "Surface", type: "color", default: "#0f1828" },
        ],
      },
      {
        id: "typography",
        label: "Typography",
        fields: [
          { id: "fontDisplay", label: "Display font", type: "text", default: "Playfair Display" },
          { id: "fontBody", label: "Body font", type: "text", default: "DM Sans" },
        ],
      },
    ],
  },
};

export default plugin;
