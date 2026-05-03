// Server-side store for per-site embed registries (chatbots, calendars,
// video players, custom HTML). Backed by the shared portal storage so
// embeds configured by the admin survive dev-server restarts.
//
// Mirrors the public-API shape of tracking.ts:
//   getEmbeds / setEmbeds / getEmbed / getPublicEmbeds
//
// Validation lives at the route boundary — these helpers trust their
// inputs and just persist them. Throwing here would couple the storage
// layer to HTTP error semantics.

import { getState, mutate } from "./storage";
import type { Embed } from "./types";

export type { Embed };

export function getEmbeds(siteId: string): Embed[] {
  return getState().embeds[siteId] ?? [];
}

export function setEmbeds(siteId: string, embeds: Embed[]): Embed[] {
  let saved!: Embed[];
  mutate(state => {
    saved = embeds.map(normaliseEmbed);
    state.embeds[siteId] = saved;
  });
  return saved;
}

export function getEmbed(siteId: string, embedId: string): Embed | undefined {
  return getEmbeds(siteId).find(e => e.id === embedId);
}

// Public projection — what the React renderer receives. Strips admin-only
// metadata (`label`, internal flags) and excludes disabled embeds so the
// client doesn't have to filter.
export type PublicEmbed = Pick<Embed, "id" | "provider" | "value" | "position" | "consentCategory" | "settings">;

export function getPublicEmbeds(siteId: string): PublicEmbed[] {
  return getEmbeds(siteId)
    .filter(e => e.enabled && !!e.value)
    .map(e => ({
      id: e.id,
      provider: e.provider,
      value: e.value,
      position: e.position,
      consentCategory: e.consentCategory,
      settings: e.settings,
    }));
}

function normaliseEmbed(e: Embed): Embed {
  return {
    id: e.id,
    provider: e.provider,
    enabled: !!e.enabled,
    value: typeof e.value === "string" ? e.value.trim() : "",
    position: e.position,
    consentCategory: e.consentCategory,
    settings: e.settings && typeof e.settings === "object" ? e.settings : undefined,
    label: e.label?.trim() || undefined,
  };
}
