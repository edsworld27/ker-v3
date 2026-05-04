// Portal-variant operations.
//
// `applyStarterVariant` is the public contract T2's fulfillment plugin
// calls during phase transitions. It loads a JSON starter tree from
// `src/starters/<variantId>.json`, creates a new EditorPage scoped to
// (agencyId, clientId, siteId, role), flags it as the active variant for
// that role, and returns the new ID triple.
//
// The function is fail-safe: catches and returns `{ ok: false, error }`
// rather than throwing, so a failed variant apply doesn't break a phase
// transition.

import type { PluginStorage } from "../lib/aquaPluginTypes";
import type { AgencyId, ClientId, UserId } from "../lib/tenancy";
import type { PortalRole } from "../lib/portalRole";
import type { EditorPage } from "../types/editorPage";
import type { Block } from "../types/block";
import { portalRoleLabel } from "../lib/portalRole";
import { variantId as makeVariantRunId } from "../lib/ids";
import { createPage, listVariantsForPortal, getActivePortalVariant, setActivePortalVariant } from "./pages";
import { getOrCreateDefaultSite } from "./sites";
import { loadStarterTree, type StarterTreeFile } from "./starterLoader";

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
  input: ApplyStarterVariantInput,
  storage: PluginStorage,
): Promise<ApplyStarterVariantResult> {
  try {
    const starter: StarterTreeFile | null = await loadStarterTree(input.variantId);
    if (!starter) {
      return { ok: false, error: `unknown variantId: ${input.variantId}` };
    }
    if (starter.role && starter.role !== input.role) {
      return {
        ok: false,
        error: `variantId ${input.variantId} is for role ${starter.role}, called with ${input.role}`,
      };
    }

    const site = await getOrCreateDefaultSite(
      storage,
      input.agencyId,
      input.clientId,
      input.clientId,
    );

    const blocks: Block[] = starter.blocks ?? [];
    const title = starter.title ?? `${portalRoleLabel(input.role)} portal`;
    const slug = `_portal-${input.role}-${makeVariantRunId().slice(0, 6)}`;

    const page = await createPage(storage, {
      siteId: site.id,
      agencyId: input.agencyId,
      clientId: input.clientId,
      title,
      slug,
      blocks,
      portalRole: input.role,
      isActivePortal: false, // setActivePortalVariant flips this atomically
      variantId: input.variantId,
    });

    const flipped = await setActivePortalVariant(
      storage,
      input.agencyId,
      input.clientId,
      site.id,
      input.role,
      page.id,
    );
    if (!flipped) {
      return { ok: false, error: `failed to set active variant for ${input.role}` };
    }

    return { ok: true, variantId: input.variantId, pageId: page.id, siteId: site.id };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, error: message };
  }
}

// Re-export the helpers from `pages.ts` so consumers can import the full
// portal-variant surface from a single module.
export {
  listVariantsForPortal,
  getActivePortalVariant,
  setActivePortalVariant,
};
