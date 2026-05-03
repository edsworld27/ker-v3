// Server-side store for per-site tracking configuration. Backed by the
// shared portal storage so trackers configured by the admin are durable
// across dev-server restarts.
//
// The public facing GET endpoint at /api/portal/config/[siteId] returns
// only the fields the loader needs (no admin-only metadata), so the data
// shape sent over the wire is intentionally narrow.

import { getState, mutate } from "./storage";
import type { SiteTrackingConfig, Tracker } from "./types";

export type { SiteTrackingConfig, Tracker };

const defaultConfig = (siteId: string): SiteTrackingConfig => ({
  siteId,
  requireConsent: true,
  trackers: [],
  updatedAt: 0,
});

export function getConfig(siteId: string): SiteTrackingConfig {
  return getState().configs[siteId] ?? defaultConfig(siteId);
}

export function listConfigs(): SiteTrackingConfig[] {
  return Object.values(getState().configs);
}

export function setConfig(siteId: string, partial: Partial<SiteTrackingConfig>): SiteTrackingConfig {
  let saved!: SiteTrackingConfig;
  mutate(state => {
    const existing = state.configs[siteId] ?? defaultConfig(siteId);
    saved = {
      ...existing,
      ...partial,
      siteId,
      updatedAt: Date.now(),
    };
    state.configs[siteId] = saved;
  });
  return saved;
}

// Public projection — what the tag.js loader receives. Strips fields that
// shouldn't leak (e.g. admin-only labels, updatedAt) and excludes disabled
// trackers so the loader doesn't even have to filter.
export interface PublicConfig {
  siteId: string;
  requireConsent: boolean;
  trackers: Array<Pick<Tracker, "id" | "provider" | "consentCategory" | "value">>;
}

export function getPublicConfig(siteId: string): PublicConfig {
  const cfg = getConfig(siteId);
  return {
    siteId: cfg.siteId,
    requireConsent: cfg.requireConsent,
    trackers: cfg.trackers
      .filter(t => t.enabled && !!t.value)
      .map(t => ({
        id: t.id,
        provider: t.provider,
        consentCategory: t.consentCategory,
        value: t.value,
      })),
  };
}
