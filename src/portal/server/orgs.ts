// Server-side org store. Mirrors the per-site server modules
// (tracking.ts, embeds.ts, etc). The agency-owner's "primary" org
// is seeded on first read so callers never have to handle the
// "zero orgs exist" edge case.

import { getState, mutate } from "./storage";
import type { OrgRecord, OrgStatus } from "./types";

export type { OrgRecord, OrgStatus };

const PRIMARY_ID = "agency";
const PRIMARY_SLUG = "agency";

function seedPrimaryIfMissing(state: { orgs: Record<string, OrgRecord> }) {
  if (state.orgs[PRIMARY_ID]) return;
  state.orgs[PRIMARY_ID] = {
    id: PRIMARY_ID,
    name: "Agency",
    slug: PRIMARY_SLUG,
    status: "active",
    isPrimary: true,
    createdAt: Date.now(),
  };
}

export function listOrgs(): OrgRecord[] {
  const state = getState();
  if (!state.orgs[PRIMARY_ID]) {
    mutate(s => seedPrimaryIfMissing(s));
  }
  return Object.values(getState().orgs).sort((a, b) =>
    Number(b.isPrimary) - Number(a.isPrimary) || a.name.localeCompare(b.name),
  );
}

export function getOrg(id: string): OrgRecord | undefined {
  return getState().orgs[id];
}

export function getPrimaryOrg(): OrgRecord {
  const list = listOrgs();
  return list.find(o => o.isPrimary) ?? list[0];
}

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    || `org-${Date.now()}`;
}

export interface CreateOrgInput {
  name: string;
  slug?: string;
  ownerEmail?: string;
  brandColor?: string;
  logoUrl?: string;
}

export function createOrg(input: CreateOrgInput): OrgRecord {
  let saved!: OrgRecord;
  mutate(state => {
    seedPrimaryIfMissing(state);
    let id = slugify(input.slug || input.name);
    if (state.orgs[id]) {
      let i = 2;
      while (state.orgs[`${id}-${i}`]) i++;
      id = `${id}-${i}`;
    }
    saved = {
      id,
      name: input.name,
      slug: id,
      ownerEmail: input.ownerEmail,
      brandColor: input.brandColor,
      logoUrl: input.logoUrl,
      status: "active",
      isPrimary: false,
      createdAt: Date.now(),
    };
    state.orgs[id] = saved;
  });
  return saved;
}

export function updateOrg(id: string, patch: Partial<Omit<OrgRecord, "id" | "createdAt">>): OrgRecord | null {
  let saved: OrgRecord | null = null;
  mutate(state => {
    const existing = state.orgs[id];
    if (!existing) return;
    saved = { ...existing, ...patch };
    state.orgs[id] = saved;
  });
  return saved;
}

export function deleteOrg(id: string): boolean {
  let deleted = false;
  mutate(state => {
    const existing = state.orgs[id];
    if (!existing) return;
    if (existing.isPrimary) return;
    delete state.orgs[id];
    deleted = true;
  });
  return deleted;
}
