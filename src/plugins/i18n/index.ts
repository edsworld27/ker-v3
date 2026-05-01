// i18n plugin — multi-language storefront support.
//
// Adds locale switching, per-locale page content, RTL handling, and a
// translations store. The Website plugin's pages get a per-locale
// override layer; the storefront resolves locale from the URL prefix
// (/en, /fr, /de, …) or a cookie + Accept-Language header.
//
// Out of scope for v1: machine translation. Operators paste their own
// translations via the admin (or an export/import flow). DeepL /
// Google Translate connectors slot in as v2 settings.

import type { AquaPlugin } from "../_types";

const plugin: AquaPlugin = {
  id: "i18n",
  name: "i18n / Translations",
  version: "0.1.0",
  status: "alpha",
  category: "content",
  tagline: "Multi-language storefront with per-locale content and RTL support.",
  description: "Adds language switching to the storefront, per-locale page overrides, RTL support, and an admin translations table for static strings. Locale resolves from URL prefix (/fr/...) first, then a cookie, then Accept-Language. Falls back to the site's default locale when no translation exists.",

  requires: ["website"],

  navItems: [
    { id: "i18n",         label: "Translations", href: "/admin/i18n", order: 0 },
    { id: "i18n-locales", label: "Locales",      href: "/admin/i18n/locales", order: 1 },
  ],

  pages: [],
  api: [],

  features: [
    { id: "localePrefix", label: "URL prefix routing", description: "/fr/products, /es/blog, etc.", default: true },
    { id: "cookieLocale", label: "Cookie locale memory", default: true },
    { id: "autoDetect",   label: "Auto-detect from Accept-Language", default: true },
    { id: "rtlSupport",   label: "Right-to-left layouts (Arabic, Hebrew)", default: false },
    { id: "machineTranslate", label: "Machine translation (DeepL / Google)", default: false, plans: ["pro", "enterprise"] },
    { id: "perLocaleSEO", label: "Per-locale SEO meta", default: true },
  ],

  settings: {
    groups: [
      {
        id: "locales",
        label: "Locales",
        fields: [
          { id: "defaultLocale", label: "Default locale", type: "select", default: "en", options: [
            { value: "en", label: "English" },
            { value: "fr", label: "French" },
            { value: "es", label: "Spanish" },
            { value: "de", label: "German" },
            { value: "it", label: "Italian" },
            { value: "pt", label: "Portuguese" },
            { value: "nl", label: "Dutch" },
            { value: "pl", label: "Polish" },
            { value: "sv", label: "Swedish" },
            { value: "ja", label: "Japanese" },
            { value: "ko", label: "Korean" },
            { value: "zh", label: "Chinese" },
            { value: "ar", label: "Arabic" },
            { value: "he", label: "Hebrew" },
          ] },
          { id: "enabledLocales", label: "Enabled locales (comma-separated)", type: "text", default: "en,fr,es", helpText: "Visitor sees a switcher with these options. Default locale is always enabled." },
        ],
      },
      {
        id: "fallback",
        label: "Fallback behaviour",
        fields: [
          { id: "fallbackToDefault", label: "Fall back to default when missing translation", type: "boolean", default: true },
          { id: "showMissingMarkers", label: "Mark untranslated strings (admin preview only)", type: "boolean", default: false },
        ],
      },
      {
        id: "machine",
        label: "Machine translation",
        description: "Only used when Machine translation feature is on.",
        fields: [
          { id: "deeplApiKey", label: "DeepL API key", type: "password" },
          { id: "googleApiKey", label: "Google Translate API key", type: "password" },
        ],
      },
    ],
  },
};

export default plugin;
