// Client-side starter loader. Reads the same JSON used by the server
// `applyStarterVariant` so the admin "create variant" flow can preview
// trees before committing.
//
// Adapted from `02/src/lib/admin/portalStarters.ts` `starterForRole()`
// switch — round-1 keeps the embedded list parallel to
// `src/starters/*.json`.

import type { PortalRole } from "./portalRole";

export interface StarterSummary {
  variantId: string;
  role: PortalRole;
  title: string;
  description?: string;
}

export const STARTERS: StarterSummary[] = [
  { variantId: "login-default", role: "login", title: "Login", description: "Minimal sign-in surface." },
  { variantId: "login-onboarding", role: "login", title: "Login (onboarding)", description: "Welcome-first variant." },
  { variantId: "login-design", role: "login", title: "Login (design-forward)", description: "Marketing split layout." },
  { variantId: "affiliates-default", role: "affiliates", title: "Affiliates", description: "Stats + signup." },
  { variantId: "orders-default", role: "orders", title: "Orders", description: "Banner + support CTA." },
  { variantId: "account-default", role: "account", title: "Account", description: "4-card hub." },
];

export function listStartersForRole(role: PortalRole): StarterSummary[] {
  return STARTERS.filter((s) => s.role === role);
}

export function getStarter(variantId: string): StarterSummary | undefined {
  return STARTERS.find((s) => s.variantId === variantId);
}
