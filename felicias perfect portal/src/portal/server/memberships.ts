// Memberships runtime — backs the Memberships plugin.
//
// Tiers (free + paid), member records, content gating helpers.
// Paid tiers integrate with the Subscriptions plugin via Stripe.

import "server-only";
import { getOrg } from "./orgs";
import { getState, mutate } from "./storage";

export type MembershipTier = {
  id: string;
  name: string;
  description?: string;
  price?: number;             // pence/cents; undefined = free tier
  currency?: string;
  recurringInterval?: "month" | "year";
  benefits: string[];         // bullet points displayed on the join page
  stripePriceId?: string;     // for paid tiers
  // Slug → tier mapping for "this content requires this tier".
  contentSlug: string;        // "free", "paid", "premium", etc.
};

export interface MemberRecord {
  id: string;
  orgId: string;
  email: string;
  name?: string;
  tierId: string;
  joinedAt: number;
  expiresAt?: number;         // for paid; undefined = lifetime
  active: boolean;
  cancelledAt?: number;
  stripeSubscriptionId?: string;
  metadata?: Record<string, string>;
}

interface MembershipsState {
  membershipTiers?: Record<string, MembershipTier[]>;   // orgId → tiers
  members?: MemberRecord[];
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

// ─── Tiers ─────────────────────────────────────────────────────────────────

export function listTiers(orgId: string): MembershipTier[] {
  const s = getState() as unknown as MembershipsState;
  return s.membershipTiers?.[orgId] ?? defaultTiersFor(orgId);
}

function defaultTiersFor(orgId: string): MembershipTier[] {
  // Returns a sensible default if the operator hasn't set tiers yet.
  return [
    { id: "free", name: "Free", description: "Get newsletter + free articles.", benefits: ["Free articles", "Newsletter"], contentSlug: "free" },
  ];
}

export function setTiers(orgId: string, tiers: MembershipTier[]): void {
  mutate(state => {
    const s = state as unknown as MembershipsState;
    if (!s.membershipTiers) s.membershipTiers = {};
    s.membershipTiers[orgId] = tiers;
  });
}

export function getTier(orgId: string, tierId: string): MembershipTier | undefined {
  return listTiers(orgId).find(t => t.id === tierId);
}

// ─── Members ───────────────────────────────────────────────────────────────

export interface CreateMemberInput {
  orgId: string;
  email: string;
  name?: string;
  tierId: string;
  stripeSubscriptionId?: string;
  expiresAt?: number;
}

export function upsertMember(input: CreateMemberInput): MemberRecord {
  const cleaned = input.email.trim().toLowerCase();
  let result!: MemberRecord;
  mutate(state => {
    const s = state as unknown as MembershipsState;
    if (!s.members) s.members = [];
    const existing = s.members.find(m => m.orgId === input.orgId && m.email === cleaned);
    if (existing) {
      Object.assign(existing, {
        tierId: input.tierId,
        name: input.name ?? existing.name,
        active: true,
        cancelledAt: undefined,
        expiresAt: input.expiresAt ?? existing.expiresAt,
        stripeSubscriptionId: input.stripeSubscriptionId ?? existing.stripeSubscriptionId,
      });
      result = existing;
      return;
    }
    result = {
      id: makeId("mem"),
      orgId: input.orgId,
      email: cleaned,
      name: input.name,
      tierId: input.tierId,
      joinedAt: Date.now(),
      expiresAt: input.expiresAt,
      active: true,
      stripeSubscriptionId: input.stripeSubscriptionId,
    };
    s.members.push(result);
  });
  return result;
}

export function cancelMembership(orgId: string, email: string): boolean {
  let cancelled = false;
  mutate(state => {
    const s = state as unknown as MembershipsState;
    const m = s.members?.find(x => x.orgId === orgId && x.email === email.toLowerCase());
    if (m) {
      m.active = false;
      m.cancelledAt = Date.now();
      cancelled = true;
    }
  });
  return cancelled;
}

export function listMembers(orgId: string, includeCancelled = false): MemberRecord[] {
  const s = getState() as unknown as MembershipsState;
  return (s.members ?? []).filter(m =>
    m.orgId === orgId && (includeCancelled || m.active),
  );
}

export function memberCount(orgId: string): number {
  return listMembers(orgId).length;
}

// ─── Access checks ─────────────────────────────────────────────────────────

export function canAccess(orgId: string, email: string, requiredTier: string): boolean {
  const member = listMembers(orgId).find(m => m.email === email.toLowerCase());
  if (!member) return requiredTier === "anonymous"; // public content allowed
  const tier = getTier(orgId, member.tierId);
  if (!tier) return false;

  // Tier hierarchy: paid implies free, premium implies paid + free, etc.
  // Use list order as the implicit hierarchy.
  const tiers = listTiers(orgId);
  const memberLevel = tiers.findIndex(t => t.id === tier.id);
  const requiredLevel = tiers.findIndex(t => t.id === requiredTier || t.contentSlug === requiredTier);
  if (requiredLevel < 0) return true;  // unknown gate slug = open
  return memberLevel >= requiredLevel;
}

export function isMembershipPluginInstalled(orgId: string): boolean {
  const org = getOrg(orgId);
  return (org?.plugins ?? []).some(p => p.pluginId === "memberships" && p.enabled);
}
