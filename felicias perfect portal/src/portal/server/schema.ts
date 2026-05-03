// Server-side store for the manifest schema. Each site can upload a
// portal.config.ts via the CLI (scripts/portal-sync.mjs); the schema
// describes every editable region grouped into named sections, which
// the admin uses to render a structured editor instead of the flat
// auto-discovered key list.
//
// Storage piggy-backs on PortalState.schemas (declared in storage.ts).
// The override store from content.ts is the source of truth for *values*
// — the schema only carries structure, defaults and field metadata.

import { getState, mutate } from "./storage";
import type { ManifestField, ManifestSchema, SiteManifestSchema } from "./types";

export type { ManifestField, ManifestSchema, SiteManifestSchema };

export function getSchema(siteId: string): SiteManifestSchema | null {
  return getState().schemas[siteId] ?? null;
}

export function listSchemas(): SiteManifestSchema[] {
  return Object.values(getState().schemas);
}

export function setSchema(
  siteId: string,
  schema: ManifestSchema,
  uploadedFrom?: string,
): SiteManifestSchema {
  let saved!: SiteManifestSchema;
  mutate(state => {
    saved = {
      siteId,
      schema,
      uploadedAt: Date.now(),
      uploadedFrom,
    };
    state.schemas[siteId] = saved;
  });
  return saved;
}

export function clearSchema(siteId: string): void {
  mutate(state => { delete state.schemas[siteId]; });
}

// Turn { hero: { headline: {…} } } into { "hero.headline": {…} } so the
// admin (and any value-resolver) can speak the same dot-keyed language
// the override store uses.
export function flattenSchema(schema: ManifestSchema): Record<string, ManifestField> {
  const out: Record<string, ManifestField> = {};
  for (const [section, fields] of Object.entries(schema)) {
    if (!fields || typeof fields !== "object") continue;
    for (const [key, field] of Object.entries(fields)) {
      if (!field || typeof field !== "object") continue;
      out[`${section}.${key}`] = field;
    }
  }
  return out;
}
