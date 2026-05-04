// EditorPage — primary unit of the website editor. Adapted from
// `02 felicias aqua portal work/src/portal/server/types.ts` and
// re-scoped for 04's three-tier tenancy:
// - 02: keyed by `siteId`
// - 04: still keyed by `siteId`, but every Site row carries
//   `{ agencyId, clientId }` so queries can be tenant-scoped.

import type { AgencyId, ClientId } from "../lib/tenancy";
import type { PortalRole } from "../lib/portalRole";
import type { Block } from "./block";

export type EditorPageStatus = "draft" | "published";

export interface EditorPage {
  id: string;
  siteId: string;
  agencyId: AgencyId;
  clientId: ClientId;

  slug: string;
  title: string;
  description?: string;

  status: EditorPageStatus;
  isHomepage?: boolean;

  // Portal-variant identity. When set, the page is one of (potentially many)
  // candidates for the customer-facing route at this role. Exactly zero or
  // one variant per (siteId, role) may have `isActivePortal=true`.
  portalRole?: PortalRole;
  isActivePortal?: boolean;
  variantId?: string; // matches `src/starters/<id>.json` key

  blocks: Block[];
  draftBlocks?: Block[];

  themeId?: string;
  customCSS?: string;
  headInjection?: string;
  layoutOverrides?: Record<string, unknown>;

  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
}

export interface CreatePageInput {
  siteId: string;
  agencyId: AgencyId;
  clientId: ClientId;
  slug?: string;
  title: string;
  description?: string;
  blocks?: Block[];
  portalRole?: PortalRole;
  isActivePortal?: boolean;
  variantId?: string;
  themeId?: string;
  isHomepage?: boolean;
}

export interface UpdatePagePatch {
  title?: string;
  slug?: string;
  description?: string;
  blocks?: Block[];
  draftBlocks?: Block[];
  themeId?: string;
  customCSS?: string;
  headInjection?: string;
  layoutOverrides?: Record<string, unknown>;
  portalRole?: PortalRole;
  isActivePortal?: boolean;
  isHomepage?: boolean;
}
