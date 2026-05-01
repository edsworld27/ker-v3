// Server-side billing helpers (G-3). Plan registry + per-org subscription
// management + feature-flag check. Stripe lives behind a thin wrapper so
// the UI is testable in isolation; real Stripe API calls land later.

import { getState, mutate } from "./storage";
import type { Plan, PlanId, Subscription, SubscriptionStatus } from "./types";

// Plan registry. Hardcoded here so changes to copy/pricing are auditable
// in git rather than hidden in the Stripe dashboard.
export const PLANS: Record<PlanId, Plan> = {
  starter: {
    id: "starter",
    name: "Starter",
    priceMonthly: 0,
    features: ["dashboard", "products", "blog"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 4900,
    features: ["dashboard", "products", "blog", "abtests", "funnels", "embeds", "chatbot"],
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    priceMonthly: 19900,
    features: ["dashboard", "products", "blog", "abtests", "funnels", "embeds", "chatbot", "compliance", "auditLog", "customDashboards", "apiAccess"],
  },
};

export function listPlans(): Plan[] {
  return Object.values(PLANS);
}

export function getPlan(id: PlanId): Plan | undefined {
  return PLANS[id];
}

export function getSubscription(orgId: string): Subscription | null {
  const org = getState().orgs[orgId];
  return org?.subscription ?? null;
}

export function setSubscription(orgId: string, planId: PlanId, status: SubscriptionStatus = "active"): Subscription | null {
  let result: Subscription | null = null;
  mutate(state => {
    const org = state.orgs[orgId];
    if (!org) return;
    const sub: Subscription = {
      planId,
      status,
      startedAt: org.subscription?.startedAt ?? Date.now(),
      renewsAt: org.subscription?.renewsAt,
      stripeSubId: org.subscription?.stripeSubId,
      stripeCustomerId: org.subscription?.stripeCustomerId,
    };
    state.orgs[orgId] = { ...org, subscription: sub };
    result = sub;
  });
  return result;
}

export function cancelSubscription(orgId: string): Subscription | null {
  let result: Subscription | null = null;
  mutate(state => {
    const org = state.orgs[orgId];
    if (!org?.subscription) return;
    const sub: Subscription = { ...org.subscription, status: "canceled", canceledAt: Date.now() };
    state.orgs[orgId] = { ...org, subscription: sub };
    result = sub;
  });
  return result;
}

// Feature-flag check. Falls back to "starter" when no subscription —
// every org gets the free tier by default.
export function hasFeature(orgId: string, flag: string): boolean {
  const sub = getSubscription(orgId);
  const planId: PlanId = sub?.status === "active" || sub?.status === "trialing" ? sub.planId : "starter";
  const plan = PLANS[planId];
  return plan.features.includes(flag);
}

// All flags the given org currently unlocks. Useful for the client to
// decide which menu items to render without a per-flag round-trip.
export function listFeatures(orgId: string): string[] {
  const sub = getSubscription(orgId);
  const planId: PlanId = sub?.status === "active" || sub?.status === "trialing" ? sub.planId : "starter";
  return [...PLANS[planId].features];
}
