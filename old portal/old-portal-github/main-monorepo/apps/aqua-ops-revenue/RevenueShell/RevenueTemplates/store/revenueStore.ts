/**
 * Revenue Store — single source of truth for the Revenue Hub
 * (Sales suite + Marketing suite). Vanilla useSyncExternalStore singleton
 * with localStorage persistence.
 */

import { useSyncExternalStore } from 'react';

// ── Marketing types ─────────────────────────────────────────────────────────

export type CampaignStatus = 'Active' | 'Paused' | 'Completed' | 'Draft';
export type CampaignChannel = 'Paid Social' | 'Paid Search' | 'Email' | 'Referral' | 'Video' | 'PR + Direct' | 'SEO' | 'Display';

export interface Campaign {
  id: string;
  name: string;
  channel: CampaignChannel;
  budget: number;
  spend: number;
  conversions: number;
  roi: number;
  status: CampaignStatus;
  startedOn?: string;
  notes?: string;
}

// ── Sales types (lead inbox lives in Sales but uses Revenue store) ──────────

export type LeadStage = 'New' | 'Contacted' | 'Qualified' | 'Disqualified';

export interface Lead {
  id: string;
  name: string;
  company: string;
  source: string;
  email?: string;
  phone?: string;
  stage: LeadStage;
  assigneeId?: string;
  notes?: string;
  receivedAt: string;
}

// ── State ────────────────────────────────────────────────────────────────────

export interface RevenueState {
  campaigns: Campaign[];
  leads: Lead[];
}

const SEED_CAMPAIGNS: Campaign[] = [
  { id: 'c1', name: 'Q2 Brand Lift — North America',  channel: 'Paid Social', budget: 48000, spend: 31250, conversions: 612,  roi: 3.4, status: 'Active' },
  { id: 'c2', name: 'Founder Story — LinkedIn Push',  channel: 'Paid Social', budget: 18000, spend: 17850, conversions: 284,  roi: 2.1, status: 'Active' },
  { id: 'c3', name: 'AQUA Product Hunt Launch',       channel: 'PR + Direct', budget: 12500, spend: 12500, conversions: 1041, roi: 6.8, status: 'Completed' },
  { id: 'c4', name: 'Retarget — Cart Abandoners',     channel: 'Paid Search', budget: 22000, spend: 9420,  conversions: 195,  roi: 4.2, status: 'Active' },
  { id: 'c5', name: 'Spring Webinar Series',          channel: 'Email',       budget: 6500,  spend: 4100,  conversions: 318,  roi: 5.6, status: 'Paused' },
  { id: 'c6', name: 'Founders Club Referral',         channel: 'Referral',    budget: 9000,  spend: 5430,  conversions: 142,  roi: 3.9, status: 'Active' },
  { id: 'c7', name: 'YouTube Pre-Roll — Vertical Test', channel: 'Video',     budget: 35000, spend: 19840, conversions: 421,  roi: 1.8, status: 'Paused' },
  { id: 'c8', name: 'Holiday Drip — Existing Leads',  channel: 'Email',       budget: 4200,  spend: 4200,  conversions: 256,  roi: 7.2, status: 'Completed' },
];

const SEED_LEADS: Lead[] = [
  { id: 'l-001', name: 'Olivia Tanaka', company: 'Helix Foods',         source: 'Webinar',     email: 'olivia@helix.foods',        stage: 'New',        receivedAt: '2026-04-30T15:00:00Z' },
  { id: 'l-002', name: 'Marcus Pham',   company: 'Brightline Studios',  source: 'Referral',    email: 'marcus@brightline.tv',      stage: 'Contacted',  assigneeId: 'u1', receivedAt: '2026-04-29T11:30:00Z' },
  { id: 'l-003', name: 'Lila Reyes',    company: 'Atlas Outdoor',       source: 'Inbound Web', email: 'lila@atlasoutdoor.com',     stage: 'Qualified',  assigneeId: 'u2', receivedAt: '2026-04-28T18:15:00Z' },
  { id: 'l-004', name: 'Kenji Mori',    company: 'Cloudwave Robotics',  source: 'LinkedIn',    email: 'kenji@cloudwave.io',        stage: 'New',        receivedAt: '2026-04-28T09:45:00Z' },
  { id: 'l-005', name: 'Aisha Patel',   company: 'Nimbus Travel',       source: 'Conference',  email: 'aisha@nimbus.travel',       stage: 'Disqualified', notes: 'Budget too low — circle back Q4', receivedAt: '2026-04-25T20:30:00Z' },
];

const SEED: RevenueState = { campaigns: SEED_CAMPAIGNS, leads: SEED_LEADS };

const LS_KEY = 'aqua:revenue-store';

function loadFromStorage(): RevenueState {
  if (typeof window === 'undefined') return SEED;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as Partial<RevenueState>;
    return {
      campaigns: Array.isArray(parsed.campaigns) ? (parsed.campaigns as Campaign[]) : SEED.campaigns,
      leads: Array.isArray(parsed.leads) ? (parsed.leads as Lead[]) : SEED.leads,
    };
  } catch { return SEED; }
}
function saveToStorage(state: RevenueState) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

let state: RevenueState = loadFromStorage();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach(l => l());
function setState(updater: (prev: RevenueState) => RevenueState) {
  state = updater(state);
  saveToStorage(state);
  notify();
}

const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
const todayIso = () => new Date().toISOString().slice(0, 10);

export const revenueStore = {
  getState: () => state,
  subscribe: (l: () => void) => { listeners.add(l); return () => listeners.delete(l); },

  // Campaigns
  createCampaign: (input: Omit<Campaign, 'id' | 'spend' | 'conversions' | 'roi' | 'startedOn'> & { spend?: number; conversions?: number; roi?: number; startedOn?: string }) => {
    const c: Campaign = {
      id: newId('c'),
      spend: input.spend ?? 0,
      conversions: input.conversions ?? 0,
      roi: input.roi ?? 0,
      startedOn: input.startedOn ?? todayIso(),
      ...input,
    };
    setState(s => ({ ...s, campaigns: [c, ...s.campaigns] }));
    return c;
  },
  updateCampaign: (id: string, patch: Partial<Campaign>) => {
    setState(s => ({ ...s, campaigns: s.campaigns.map(c => c.id === id ? { ...c, ...patch } : c) }));
  },
  deleteCampaign: (id: string) => {
    setState(s => ({ ...s, campaigns: s.campaigns.filter(c => c.id !== id) }));
  },
  setCampaignStatus: (id: string, status: CampaignStatus) => {
    setState(s => ({ ...s, campaigns: s.campaigns.map(c => c.id === id ? { ...c, status } : c) }));
  },

  // Leads
  createLead: (input: Omit<Lead, 'id' | 'receivedAt' | 'stage'> & { stage?: LeadStage; receivedAt?: string }) => {
    const l: Lead = { id: newId('l'), receivedAt: input.receivedAt ?? new Date().toISOString(), stage: input.stage ?? 'New', ...input };
    setState(s => ({ ...s, leads: [l, ...s.leads] }));
    return l;
  },
  updateLead: (id: string, patch: Partial<Lead>) => {
    setState(s => ({ ...s, leads: s.leads.map(l => l.id === id ? { ...l, ...patch } : l) }));
  },
  assignLead: (id: string, assigneeId: string | undefined) => {
    setState(s => ({ ...s, leads: s.leads.map(l => l.id === id ? { ...l, assigneeId } : l) }));
  },
  setLeadStage: (id: string, stage: LeadStage) => {
    setState(s => ({ ...s, leads: s.leads.map(l => l.id === id ? { ...l, stage } : l) }));
  },
  deleteLead: (id: string) => {
    setState(s => ({ ...s, leads: s.leads.filter(l => l.id !== id) }));
  },
};

export function useRevenueStore<T>(selector: (s: RevenueState) => T): T {
  return useSyncExternalStore(
    revenueStore.subscribe,
    () => selector(state),
    () => selector(SEED),
  );
}
export const useCampaigns = () => useRevenueStore(s => s.campaigns);
export const useLeads = () => useRevenueStore(s => s.leads);
