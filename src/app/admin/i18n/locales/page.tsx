"use client";

// /admin/i18n/locales — Locale enable/disable + per-locale defaults.
// Manage which languages your storefront supports, default locale,
// and URL-prefix settings.

import PluginPageScaffold from "@/components/admin/PluginPageScaffold";

export default function LocalesPage() {
  return (
    <PluginPageScaffold
      pluginId="i18n"
      eyebrow="i18n"
      title="Locales"
      description="Which languages your storefront supports, default locale, and URL-prefix routing. The Translations tab is where strings get edited."
      backHref="/admin/i18n"
      backLabel="Translations"
      emptyTitle="Default locale only"
      emptyHint="Add locales (fr, es, de, …) here. Each locale gets its own translations table and an optional URL prefix (/fr/products)."
    />
  );
}
