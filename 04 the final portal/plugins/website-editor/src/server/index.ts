// Public server-side surface for `@aqua/plugin-website-editor/server`.
//
// T2's fulfillment plugin and T1's foundation reach into this module to
// call into editor-owned operations (apply starter variant, list pages,
// publish a draft, etc.). All exports are explicit — no re-export of
// internal helpers.

export { applyStarterVariant } from "./portalVariants";
export {
  listVariantsForPortal,
  getActivePortalVariant,
  setActivePortalVariant,
} from "./portalVariants";

export type {
  ApplyStarterVariantInput,
  ApplyStarterVariantResult,
} from "./portalVariants";

export type { PortalVariantPort } from "./ports";
