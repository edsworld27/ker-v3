// Donations runtime — backs the Donations plugin.
//
// Stripe Checkout flow for one-off + recurring donations. Tracks
// donor records, totals raised, per-goal progress, optional
// Gift Aid claim flag.

import "server-only";
import { getOrg } from "./orgs";
import { getState, mutate } from "./storage";

export interface DonationRecord {
  id: string;
  orgId: string;
  donorEmail: string;
  donorName?: string;
  amount: number;          // pence/cents
  currency: string;
  recurring: boolean;
  giftAid: boolean;
  anonymous: boolean;
  message?: string;
  goalId?: string;
  stripeSessionId?: string;
  stripeSubscriptionId?: string;
  status: "pending" | "completed" | "refunded";
  createdAt: number;
  completedAt?: number;
}

export interface DonationGoal {
  id: string;
  orgId: string;
  name: string;
  description?: string;
  targetAmount: number;
  currency: string;
  endsAt?: number;
  active: boolean;
  createdAt: number;
}

interface DonationsState {
  donations?: DonationRecord[];
  donationGoals?: DonationGoal[];
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

// ─── Goals ─────────────────────────────────────────────────────────────────

export function listGoals(orgId: string): DonationGoal[] {
  const s = getState() as unknown as DonationsState;
  return (s.donationGoals ?? []).filter(g => g.orgId === orgId);
}

export interface CreateGoalInput {
  orgId: string;
  name: string;
  description?: string;
  targetAmount: number;
  currency?: string;
  endsAt?: number;
}

export function createGoal(input: CreateGoalInput): DonationGoal {
  const goal: DonationGoal = {
    id: makeId("goal"),
    orgId: input.orgId,
    name: input.name,
    description: input.description,
    targetAmount: input.targetAmount,
    currency: input.currency ?? "GBP",
    endsAt: input.endsAt,
    active: true,
    createdAt: Date.now(),
  };
  mutate(state => {
    const s = state as unknown as DonationsState;
    if (!s.donationGoals) s.donationGoals = [];
    s.donationGoals.push(goal);
  });
  return goal;
}

export function getGoalProgress(orgId: string, goalId: string): { raised: number; target: number; percent: number; donors: number } {
  const goal = listGoals(orgId).find(g => g.id === goalId);
  if (!goal) return { raised: 0, target: 0, percent: 0, donors: 0 };
  const donations = listDonations(orgId).filter(d =>
    d.goalId === goalId && d.status === "completed",
  );
  const raised = donations.reduce((sum, d) => sum + d.amount, 0);
  const donors = new Set(donations.map(d => d.donorEmail)).size;
  return {
    raised,
    target: goal.targetAmount,
    percent: goal.targetAmount === 0 ? 0 : (raised / goal.targetAmount) * 100,
    donors,
  };
}

// ─── Donations ─────────────────────────────────────────────────────────────

export function listDonations(orgId: string): DonationRecord[] {
  const s = getState() as unknown as DonationsState;
  return (s.donations ?? [])
    .filter(d => d.orgId === orgId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export interface CreateDonationInput {
  orgId: string;
  donorEmail: string;
  donorName?: string;
  amount: number;
  currency: string;
  recurring?: boolean;
  giftAid?: boolean;
  anonymous?: boolean;
  message?: string;
  goalId?: string;
  stripeSessionId?: string;
  stripeSubscriptionId?: string;
}

export function recordDonation(input: CreateDonationInput): DonationRecord {
  const d: DonationRecord = {
    id: makeId("don"),
    orgId: input.orgId,
    donorEmail: input.donorEmail,
    donorName: input.donorName,
    amount: input.amount,
    currency: input.currency,
    recurring: input.recurring ?? false,
    giftAid: input.giftAid ?? false,
    anonymous: input.anonymous ?? false,
    message: input.message,
    goalId: input.goalId,
    stripeSessionId: input.stripeSessionId,
    stripeSubscriptionId: input.stripeSubscriptionId,
    status: "completed",
    createdAt: Date.now(),
    completedAt: Date.now(),
  };
  mutate(state => {
    const s = state as unknown as DonationsState;
    if (!s.donations) s.donations = [];
    s.donations.push(d);
  });
  return d;
}

export function donorStats(orgId: string): { totalRaised: number; totalDonors: number; recurringDonors: number; recentDonations: DonationRecord[] } {
  const donations = listDonations(orgId).filter(d => d.status === "completed");
  const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0);
  const totalDonors = new Set(donations.map(d => d.donorEmail)).size;
  const recurringDonors = new Set(donations.filter(d => d.recurring).map(d => d.donorEmail)).size;
  return {
    totalRaised,
    totalDonors,
    recurringDonors,
    recentDonations: donations.slice(0, 20),
  };
}

export function getDonationsConfig(orgId: string): Record<string, unknown> {
  const org = getOrg(orgId);
  const install = (org?.plugins ?? []).find(p => p.pluginId === "donations");
  return (install?.config as Record<string, unknown>) ?? {};
}
