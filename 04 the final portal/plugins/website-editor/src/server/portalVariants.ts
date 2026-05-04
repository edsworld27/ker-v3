// Portal-variant operations.
//
// Owns: apply a starter variant (block tree from `src/starters/*.json`) to
// a client; list/get/set the active variant for a (siteId, role) pair.
//
// **STUB** — full implementation lands in step 7 once `pages.ts` is in
// place. The signatures here are the public contract T2 calls.

import type { AgencyId, ClientId, UserId } from "../lib/tenancy";
import type { PortalRole } from "../lib/portalRole";
import type { PluginStorage } from "../lib/aquaPluginTypes";
import type { EditorPage } from "../types/editorPage";

export interface ApplyStarterVariantInput {
  agencyId: AgencyId;
  clientId: ClientId;
  role: PortalRole;
  variantId: string;
  actor?: UserId;
}

export type ApplyStarterVariantResult =
  | { ok: true; variantId: string; pageId: string; siteId: string }
  | { ok: false; error: string };

export async function applyStarterVariant(
  _input: ApplyStarterVariantInput,
  _storage: PluginStorage,
): Promise<ApplyStarterVariantResult> {
  return {
    ok: false,
    error: "applyStarterVariant: not implemented yet (step 7)",
  };
}

export async function listVariantsForPortal(
  _storage: PluginStorage,
  _siteId: string,
  _role: PortalRole,
): Promise<EditorPage[]> {
  return [];
}

export async function getActivePortalVariant(
  _storage: PluginStorage,
  _siteId: string,
  _role: PortalRole,
): Promise<EditorPage | null> {
  return null;
}

export async function setActivePortalVariant(
  _storage: PluginStorage,
  _siteId: string,
  _role: PortalRole,
  _pageId: string | null,
): Promise<boolean> {
  return false;
}
