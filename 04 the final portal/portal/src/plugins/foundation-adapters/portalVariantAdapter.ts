import "server-only";
// PortalVariantPort stub — until T3's website-editor plugin replaces the
// body, applying a starter variant just records the call to the activity
// log and returns ok. Phase transitions don't fail when no editor is
// installed — callers tolerate the soft-fail per the architecture
// (04-plugin-fulfillment.md §"Transition algorithm" step 3).

import type { PortalVariantPort } from "@/plugins/_types";
import { logActivity } from "@/server/activity";

export const portalVariantAdapter: PortalVariantPort = {
  async applyStarterVariant({ agencyId, clientId, role, variantId, actor }) {
    logActivity({
      agencyId,
      clientId,
      actorUserId: actor,
      category: "system",
      action: "variant.apply.stub",
      message: `Starter variant '${variantId}' for portal role '${role}' acknowledged (T3 stub).`,
      metadata: { variantId, role },
    });
    return { ok: true, variantId };
  },
};
