// Site — a tenant's website. In 02 keyed by `siteId` only; in 04 every
// Site row carries `agencyId + clientId` so queries scope through the
// foundation's `requireRole()` session.

import type { AgencyId, ClientId, EntityStatus } from "../lib/tenancy";

export interface Site {
  id: string;
  agencyId: AgencyId;
  clientId: ClientId;
  name: string;
  slug: string;
  // Optional custom domain. Round-2 plugin supplies host-matching; for
  // Round 1 sites are reached via `/portal/clients/[clientId]/<page>`.
  customDomain?: string;
  defaultThemeId?: string;
  status: EntityStatus;
  createdAt: number;
  updatedAt: number;
  // Per-site published/preview state (lifted from 02's pages.ts).
  publishedSnapshotAt?: number;
}

export interface CreateSiteInput {
  agencyId: AgencyId;
  clientId: ClientId;
  name: string;
  slug?: string;
  defaultThemeId?: string;
}

export interface UpdateSitePatch {
  name?: string;
  slug?: string;
  customDomain?: string;
  defaultThemeId?: string;
  status?: EntityStatus;
}
