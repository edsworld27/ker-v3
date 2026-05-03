// Translations store — backs the i18n plugin's `/admin/i18n` table.
//
// Per-org × per-locale × key → string. The storefront reads via
// resolveTranslation(orgId, locale, key) at render time; the admin
// edits via /admin/i18n.
//
// String keys are arbitrary, but a convention is recommended:
//   `<plugin>.<area>.<element>` — e.g. `website.nav.home`,
//   `ecommerce.cart.checkout`, `forms.signup.submit`.

import "server-only";
import { getState, mutate } from "./storage";

interface TranslationsState {
  // [orgId][locale][key] = value
  translations?: Record<string, Record<string, Record<string, string>>>;
}

export function setTranslation(orgId: string, locale: string, key: string, value: string): void {
  mutate(state => {
    const s = state as unknown as TranslationsState;
    if (!s.translations) s.translations = {};
    if (!s.translations[orgId]) s.translations[orgId] = {};
    if (!s.translations[orgId][locale]) s.translations[orgId][locale] = {};
    s.translations[orgId][locale][key] = value;
  });
}

export function deleteTranslation(orgId: string, locale: string, key: string): void {
  mutate(state => {
    const s = state as unknown as TranslationsState;
    delete s.translations?.[orgId]?.[locale]?.[key];
  });
}

export function getTranslation(orgId: string, locale: string, key: string, fallback?: string): string {
  const s = getState() as unknown as TranslationsState;
  const value = s.translations?.[orgId]?.[locale]?.[key];
  return value ?? fallback ?? key;
}

export function listTranslations(orgId: string, locale: string): Record<string, string> {
  const s = getState() as unknown as TranslationsState;
  return s.translations?.[orgId]?.[locale] ?? {};
}

export function listAllKeys(orgId: string): string[] {
  const s = getState() as unknown as TranslationsState;
  const keys = new Set<string>();
  const byLocale = s.translations?.[orgId] ?? {};
  for (const locale of Object.keys(byLocale)) {
    for (const k of Object.keys(byLocale[locale])) {
      keys.add(k);
    }
  }
  return [...keys].sort();
}

// Bulk import — for CSV upload or operator paste.
export function bulkImport(orgId: string, locale: string, entries: Record<string, string>): void {
  mutate(state => {
    const s = state as unknown as TranslationsState;
    if (!s.translations) s.translations = {};
    if (!s.translations[orgId]) s.translations[orgId] = {};
    if (!s.translations[orgId][locale]) s.translations[orgId][locale] = {};
    Object.assign(s.translations[orgId][locale], entries);
  });
}
