// Portal — the headless API surface.
//
// Use sub-namespaces directly to keep imports tree-shakeable:
//   import { getOrder } from "@/portal/ecommerce";
//   import { getDraftTheme } from "@/portal/website";
//   import { getSession } from "@/portal/auth";
//   import { logActivity } from "@/portal/operate";
//
// This barrel is provided for convenience but prefer the sub-namespaces.

export * as ecommerce from "./ecommerce";
export * as website   from "./website";
export * as auth      from "./auth";
export * as operate   from "./operate";
