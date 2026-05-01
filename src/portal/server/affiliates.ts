// Affiliates runtime — backs the Affiliates plugin.
//
// Affiliates apply via a public form, get assigned a unique referral
// code, share links containing ?ref=<code> with their audience.
// Visitor's first ref-cookie wins (overwritable by ?ref= param).
// On purchase, the system credits commission to the cookie's affiliate.

import "server-only";
import { getOrg } from "./orgs";
import { getState, mutate } from "./storage";

export interface Affiliate {
  id: string;
  orgId: string;
  email: string;
  name: string;
  code: string;              // unique referral code, e.g. "FELICIA10"
  commissionRate: number;    // % default = sitewide rate
  status: "pending" | "approved" | "suspended";
  payoutMethod?: "manual" | "stripe-connect" | "paypal";
  payoutDetails?: Record<string, string>;
  totalEarned: number;       // pence/cents accrued
  totalPaid: number;         // pence/cents paid out
  createdAt: number;
  approvedAt?: number;
}

export interface ReferralEvent {
  id: string;
  orgId: string;
  affiliateCode: string;
  type: "click" | "conversion";
  orderId?: string;
  amount?: number;           // for conversions
  commission?: number;       // for conversions
  visitorId?: string;        // hashed
  createdAt: number;
}

interface AffiliatesState {
  affiliates?: Affiliate[];
  referralEvents?: ReferralEvent[];
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function makeCode(name: string): string {
  // Deterministic-ish so the code reads nicely.
  const slug = name.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6);
  const tail = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${slug || "AFF"}${tail}`;
}

function getDefaultRate(orgId: string): number {
  const org = getOrg(orgId);
  const install = (org?.plugins ?? []).find(p => p.pluginId === "affiliates");
  const c = install?.config as Record<string, unknown> | undefined;
  return typeof c?.rate === "number" ? c.rate : 10;
}

// ─── Affiliates ─────────────────────────────────────────────────────────────

export function listAffiliates(orgId: string): Affiliate[] {
  const s = getState() as unknown as AffiliatesState;
  return (s.affiliates ?? []).filter(a => a.orgId === orgId);
}

export function findAffiliate(orgId: string, code: string): Affiliate | undefined {
  return listAffiliates(orgId).find(a => a.code === code);
}

export interface CreateAffiliateInput {
  orgId: string;
  email: string;
  name: string;
  commissionRate?: number;
}

export function createAffiliate(input: CreateAffiliateInput): Affiliate {
  const a: Affiliate = {
    id: makeId("aff"),
    orgId: input.orgId,
    email: input.email.trim().toLowerCase(),
    name: input.name,
    code: makeCode(input.name),
    commissionRate: input.commissionRate ?? getDefaultRate(input.orgId),
    status: "pending",
    totalEarned: 0,
    totalPaid: 0,
    createdAt: Date.now(),
  };
  mutate(state => {
    const s = state as unknown as AffiliatesState;
    if (!s.affiliates) s.affiliates = [];
    s.affiliates.push(a);
  });
  return a;
}

export function setAffiliateStatus(orgId: string, id: string, status: Affiliate["status"]): void {
  mutate(state => {
    const s = state as unknown as AffiliatesState;
    const a = (s.affiliates ?? []).find(x => x.orgId === orgId && x.id === id);
    if (a) {
      a.status = status;
      if (status === "approved" && !a.approvedAt) a.approvedAt = Date.now();
    }
  });
}

// ─── Tracking ──────────────────────────────────────────────────────────────

export function recordClick(orgId: string, code: string, visitorId?: string): void {
  const aff = findAffiliate(orgId, code);
  if (!aff || aff.status !== "approved") return;
  mutate(state => {
    const s = state as unknown as AffiliatesState;
    if (!s.referralEvents) s.referralEvents = [];
    s.referralEvents.push({
      id: makeId("ref"),
      orgId,
      affiliateCode: code,
      type: "click",
      visitorId,
      createdAt: Date.now(),
    });
  });
}

export function recordConversion(orgId: string, code: string, orderId: string, amount: number): number {
  const aff = findAffiliate(orgId, code);
  if (!aff || aff.status !== "approved") return 0;
  const commission = Math.round(amount * (aff.commissionRate / 100));
  mutate(state => {
    const s = state as unknown as AffiliatesState;
    if (!s.referralEvents) s.referralEvents = [];
    s.referralEvents.push({
      id: makeId("ref"),
      orgId,
      affiliateCode: code,
      type: "conversion",
      orderId,
      amount,
      commission,
      createdAt: Date.now(),
    });
    const a = (s.affiliates ?? []).find(x => x.orgId === orgId && x.code === code);
    if (a) a.totalEarned += commission;
  });
  return commission;
}

export function affiliateStats(orgId: string, affiliateId: string): {
  clicks: number; conversions: number; totalEarned: number; totalPaid: number; conversionRate: number;
} {
  const s = getState() as unknown as AffiliatesState;
  const aff = listAffiliates(orgId).find(a => a.id === affiliateId);
  if (!aff) return { clicks: 0, conversions: 0, totalEarned: 0, totalPaid: 0, conversionRate: 0 };
  const events = (s.referralEvents ?? []).filter(e => e.orgId === orgId && e.affiliateCode === aff.code);
  const clicks = events.filter(e => e.type === "click").length;
  const conversions = events.filter(e => e.type === "conversion").length;
  return {
    clicks,
    conversions,
    totalEarned: aff.totalEarned,
    totalPaid: aff.totalPaid,
    conversionRate: clicks === 0 ? 0 : (conversions / clicks) * 100,
  };
}
