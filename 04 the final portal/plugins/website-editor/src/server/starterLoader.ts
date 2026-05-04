// Loads starter trees from `src/starters/<variantId>.json` at runtime.
//
// In a Next.js context this resolves via dynamic import; in a Node smoke
// test it resolves via fs. Both paths share the same shape.

import type { Block } from "../types/block";
import type { PortalRole } from "../lib/portalRole";

export interface StarterTreeFile {
  variantId: string;
  role: PortalRole;
  title: string;
  description?: string;
  blocks: Block[];
}

// Statically import the round-1 set so the bundler picks them up.
// Round-2 grows the set; the loader walks `import.meta.glob` once T1
// confirms the bundler.
import loginDefault from "../starters/login-default.json" with { type: "json" };
import loginOnboarding from "../starters/login-onboarding.json" with { type: "json" };
import loginDesign from "../starters/login-design.json" with { type: "json" };
import affiliatesDefault from "../starters/affiliates-default.json" with { type: "json" };
import ordersDefault from "../starters/orders-default.json" with { type: "json" };
import accountDefault from "../starters/account-default.json" with { type: "json" };

const STARTERS: Record<string, StarterTreeFile> = {
  "login-default": loginDefault as StarterTreeFile,
  "login-onboarding": loginOnboarding as StarterTreeFile,
  "login-design": loginDesign as StarterTreeFile,
  "affiliates-default": affiliatesDefault as StarterTreeFile,
  "orders-default": ordersDefault as StarterTreeFile,
  "account-default": accountDefault as StarterTreeFile,
};

export async function loadStarterTree(variantId: string): Promise<StarterTreeFile | null> {
  return STARTERS[variantId] ?? null;
}

export function listStarterIds(): string[] {
  return Object.keys(STARTERS);
}
