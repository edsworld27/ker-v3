/**
 * CRM Store — single source of truth shared across the 5 CRM templates.
 *
 * Vanilla module-level store with a subscribe pattern (à la Zustand-lite).
 * All templates read/write through useCRMStore() — no per-template mock
 * arrays, no duplicate state.
 *
 * Persistence:
 *   - localStorage (browser-only, key = LS_KEY)
 *   - graceful demo-mode if localStorage is unavailable
 *
 * Future: extend with a `sync(api)` method that POSTs deltas to /api/sync.
 */

import { useSyncExternalStore } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

export type DealStage =
  | 'Lead'
  | 'Qualified'
  | 'Proposal'
  | 'Negotiation'
  | 'Closed Won'
  | 'Closed Lost';

export const DEAL_STAGES: readonly DealStage[] = [
  'Lead',
  'Qualified',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
] as const;

export interface CRMOwner {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface CRMContact {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  company: string;
  notes?: string;
  createdAt: string;
}

export interface CRMDeal {
  id: string;
  name: string;
  company: string;
  contactId?: string;
  value: number;
  probability: number;
  stage: DealStage;
  owner: CRMOwner;
  expectedClose: string;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CRMActivityType = 'call' | 'email' | 'meeting' | 'note' | 'task';

export interface CRMActivity {
  id: string;
  type: CRMActivityType;
  summary: string;
  details?: string;
  dealId?: string;
  contactId?: string;
  actor: string;
  timestamp: string;
}

export interface CRMState {
  deals: CRMDeal[];
  contacts: CRMContact[];
  activities: CRMActivity[];
}

// ── Defaults / seed data ─────────────────────────────────────────────────────

const OWNERS: CRMOwner[] = [
  { id: 'u1', name: 'Maya Patel',     initials: 'MP', color: 'from-amber-500 to-orange-600' },
  { id: 'u2', name: 'Jordan Reyes',   initials: 'JR', color: 'from-sky-500 to-indigo-600' },
  { id: 'u3', name: "Sam O'Connor",   initials: 'SO', color: 'from-emerald-500 to-teal-600' },
  { id: 'u4', name: 'Tomas Berg',     initials: 'TB', color: 'from-fuchsia-500 to-pink-600' },
];

export const CRM_OWNERS = OWNERS;

const SEED_CONTACTS: CRMContact[] = [
  { id: 'c-001', name: 'Avery Wong',    title: 'VP Marketing',  email: 'avery@northwind.io',   phone: '+1 555 0101', company: 'Northwind Logistics',  createdAt: '2026-04-01' },
  { id: 'c-002', name: 'Priya Iyer',    title: 'CMO',           email: 'priya@halcyon.coffee', phone: '+1 555 0102', company: 'Halcyon Coffee Co.',   createdAt: '2026-04-02' },
  { id: 'c-003', name: 'Marcus Lin',    title: 'Head of Brand', email: 'marcus@lumen.health',  phone: '+1 555 0103', company: 'Lumen Health',         createdAt: '2026-04-04' },
  { id: 'c-004', name: 'Hannah Berg',   title: 'Sales Director',email: 'hannah@vertex.ai',     phone: '+1 555 0104', company: 'Vertex Robotics',      createdAt: '2026-04-08' },
  { id: 'c-005', name: 'Jules Romero',  title: 'CMO',           email: 'jules@meridian.com',   phone: '+1 555 0105', company: 'Meridian Bank',        createdAt: '2026-04-10' },
  { id: 'c-006', name: 'Kira Park',     title: 'Brand Manager', email: 'kira@aerie.co',        phone: '+1 555 0106', company: 'Aerie Outfitters',     createdAt: '2026-04-12' },
  { id: 'c-007', name: 'Sasha Romanov', title: 'Events Lead',   email: 'sasha@ironclad.dev',   phone: '+1 555 0107', company: 'Ironclad Software',    createdAt: '2026-04-15' },
  { id: 'c-008', name: 'Quinn Davis',   title: 'Owner',         email: 'quinn@hearthstone.re', phone: '+1 555 0108', company: 'Hearthstone Realty',   createdAt: '2026-04-18' },
];

const SEED_DEALS: CRMDeal[] = [
  { id: 'deal-001', name: 'Brand Refresh — Q3 Launch',       company: 'Northwind Logistics',  contactId: 'c-001', value: 84000,  probability: 25,  stage: 'Lead',         owner: OWNERS[0], expectedClose: '2026-08-15', tags: ['rebrand', 'enterprise'], notes: '', createdAt: '2026-04-01', updatedAt: '2026-04-12' },
  { id: 'deal-002', name: 'Performance Marketing Retainer',  company: 'Halcyon Coffee Co.',   contactId: 'c-002', value: 18000,  probability: 30,  stage: 'Lead',         owner: OWNERS[1], expectedClose: '2026-07-01', tags: ['retainer'],              notes: '', createdAt: '2026-04-02', updatedAt: '2026-04-12' },
  { id: 'deal-003', name: 'Website Redesign + CMS',          company: 'Lumen Health',         contactId: 'c-003', value: 142000, probability: 55,  stage: 'Qualified',    owner: OWNERS[0], expectedClose: '2026-09-30', tags: ['web', 'cms'],            notes: '', createdAt: '2026-04-04', updatedAt: '2026-04-12' },
  { id: 'deal-004', name: 'Sales Enablement Program',        company: 'Vertex Robotics',      contactId: 'c-004', value: 67500,  probability: 50,  stage: 'Qualified',    owner: OWNERS[2], expectedClose: '2026-08-20', tags: ['enablement'],            notes: '', createdAt: '2026-04-08', updatedAt: '2026-04-12' },
  { id: 'deal-005', name: 'Annual Content Engine',           company: 'Meridian Bank',        contactId: 'c-005', value: 215000, probability: 70,  stage: 'Proposal',     owner: OWNERS[1], expectedClose: '2026-06-12', tags: ['content', 'finserv'],    notes: '', createdAt: '2026-04-10', updatedAt: '2026-04-12' },
  { id: 'deal-006', name: 'Paid Social Expansion',           company: 'Aerie Outfitters',     contactId: 'c-006', value: 48000,  probability: 65,  stage: 'Proposal',     owner: OWNERS[3], expectedClose: '2026-05-29', tags: ['paid-social'],           notes: '', createdAt: '2026-04-12', updatedAt: '2026-04-12' },
  { id: 'deal-007', name: 'Conference Activation — DevSummit', company: 'Ironclad Software', contactId: 'c-007', value: 125000, probability: 80, stage: 'Negotiation',  owner: OWNERS[0], expectedClose: '2026-05-18', tags: ['event', 'b2b'],          notes: '', createdAt: '2026-04-15', updatedAt: '2026-04-15' },
  { id: 'deal-008', name: 'Identity System + Guidelines',    company: 'Hearthstone Realty',   contactId: 'c-008', value: 92000,  probability: 75,  stage: 'Negotiation',  owner: OWNERS[2], expectedClose: '2026-06-04', tags: ['brand-system'],          notes: '', createdAt: '2026-04-18', updatedAt: '2026-04-18' },
  { id: 'deal-009', name: 'Multi-channel Campaign — Spring', company: 'Polaris Apparel',                          value: 156000, probability: 100, stage: 'Closed Won',   owner: OWNERS[1], expectedClose: '2026-04-10', tags: ['campaign'],              notes: '', createdAt: '2026-03-01', updatedAt: '2026-04-10' },
  { id: 'deal-010', name: 'SEO Audit + Roadmap',             company: 'Greenway Foods',                           value: 24500,  probability: 100, stage: 'Closed Won',   owner: OWNERS[3], expectedClose: '2026-04-22', tags: ['seo'],                   notes: '', createdAt: '2026-03-15', updatedAt: '2026-04-22' },
  { id: 'deal-011', name: 'Custom Portal Build',             company: 'Atlas Realty Group',                       value: 380000, probability: 0,   stage: 'Closed Lost',  owner: OWNERS[0], expectedClose: '2026-03-30', tags: ['portal'],                notes: '', createdAt: '2026-02-15', updatedAt: '2026-03-30' },
  { id: 'deal-012', name: 'Annual Retainer — Renewal',       company: 'Bayside Hospitality',                      value: 96000,  probability: 0,   stage: 'Closed Lost',  owner: OWNERS[2], expectedClose: '2026-02-28', tags: ['retainer'],              notes: '', createdAt: '2026-01-15', updatedAt: '2026-02-28' },
];

const SEED_ACTIVITIES: CRMActivity[] = [
  { id: 'act-001', type: 'call',    actor: 'Maya Patel',   summary: 'Discovery call with Avery — confirmed Q3 launch window',                  dealId: 'deal-001', contactId: 'c-001', timestamp: '2026-04-12T14:30:00Z' },
  { id: 'act-002', type: 'email',   actor: 'Jordan Reyes', summary: 'Sent retainer proposal v2',                                                dealId: 'deal-002', contactId: 'c-002', timestamp: '2026-04-12T09:15:00Z' },
  { id: 'act-003', type: 'meeting', actor: 'Maya Patel',   summary: 'Stakeholder review at Lumen — design system signed off',                  dealId: 'deal-003', contactId: 'c-003', timestamp: '2026-04-11T16:00:00Z' },
  { id: 'act-004', type: 'note',    actor: "Sam O'Connor", summary: 'Vertex evaluating two competing vendors — push case study by EOW',        dealId: 'deal-004', contactId: 'c-004', timestamp: '2026-04-10T11:45:00Z' },
  { id: 'act-005', type: 'meeting', actor: 'Jordan Reyes', summary: 'Quarterly review with Meridian — content engine approved',                dealId: 'deal-005', contactId: 'c-005', timestamp: '2026-04-09T13:00:00Z' },
  { id: 'act-006', type: 'call',    actor: 'Tomas Berg',   summary: 'Aerie wants to expand to Pinterest + LinkedIn',                           dealId: 'deal-006', contactId: 'c-006', timestamp: '2026-04-08T10:30:00Z' },
  { id: 'act-007', type: 'task',    actor: 'Maya Patel',   summary: 'Follow up with Sasha re: DevSummit booth dimensions',                     dealId: 'deal-007', contactId: 'c-007', timestamp: '2026-04-07T08:00:00Z' },
];

const SEED: CRMState = {
  deals: SEED_DEALS,
  contacts: SEED_CONTACTS,
  activities: SEED_ACTIVITIES,
};

// ── Persistence ──────────────────────────────────────────────────────────────

const LS_KEY = 'aqua:crm-store';

function loadFromStorage(): CRMState {
  if (typeof window === 'undefined') return SEED;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as Partial<CRMState>;
    return {
      deals: Array.isArray(parsed.deals) ? parsed.deals as CRMDeal[] : SEED.deals,
      contacts: Array.isArray(parsed.contacts) ? parsed.contacts as CRMContact[] : SEED.contacts,
      activities: Array.isArray(parsed.activities) ? parsed.activities as CRMActivity[] : SEED.activities,
    };
  } catch {
    return SEED;
  }
}

function saveToStorage(state: CRMState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    /* localStorage full or disabled — silently no-op */
  }
}

// ── Store ────────────────────────────────────────────────────────────────────

let state: CRMState = loadFromStorage();
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

function setState(updater: (prev: CRMState) => CRMState) {
  state = updater(state);
  saveToStorage(state);
  notify();
}

const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const nowIso = () => new Date().toISOString();

export const crmStore = {
  // ── reads ─────────────────────────────────────────────────────────────────
  getState: () => state,
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },

  // ── deals ─────────────────────────────────────────────────────────────────
  createDeal: (input: Partial<CRMDeal> & { name: string; company: string; value: number; stage: DealStage }) => {
    const owner = input.owner ?? OWNERS[0];
    const deal: CRMDeal = {
      id: newId('deal'),
      probability: input.probability ?? 25,
      contactId: input.contactId,
      expectedClose: input.expectedClose ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
      tags: input.tags ?? [],
      notes: input.notes ?? '',
      createdAt: nowIso(),
      updatedAt: nowIso(),
      ...input,
      owner,
    };
    setState(s => ({ ...s, deals: [deal, ...s.deals] }));
    return deal;
  },

  updateDeal: (id: string, patch: Partial<CRMDeal>) => {
    setState(s => ({
      ...s,
      deals: s.deals.map(d => (d.id === id ? { ...d, ...patch, updatedAt: nowIso() } : d)),
    }));
  },

  setDealStage: (id: string, stage: DealStage) => {
    setState(s => ({
      ...s,
      deals: s.deals.map(d => (d.id === id ? { ...d, stage, updatedAt: nowIso() } : d)),
    }));
  },

  deleteDeal: (id: string) => {
    setState(s => ({
      ...s,
      deals: s.deals.filter(d => d.id !== id),
      activities: s.activities.filter(a => a.dealId !== id),
    }));
  },

  // ── contacts ──────────────────────────────────────────────────────────────
  createContact: (input: Omit<CRMContact, 'id' | 'createdAt'>) => {
    const contact: CRMContact = { id: newId('c'), createdAt: nowIso(), ...input };
    setState(s => ({ ...s, contacts: [contact, ...s.contacts] }));
    return contact;
  },

  updateContact: (id: string, patch: Partial<CRMContact>) => {
    setState(s => ({
      ...s,
      contacts: s.contacts.map(c => (c.id === id ? { ...c, ...patch } : c)),
    }));
  },

  deleteContact: (id: string) => {
    setState(s => ({
      ...s,
      contacts: s.contacts.filter(c => c.id !== id),
      deals: s.deals.map(d => (d.contactId === id ? { ...d, contactId: undefined } : d)),
      activities: s.activities.filter(a => a.contactId !== id),
    }));
  },

  // ── activities ────────────────────────────────────────────────────────────
  createActivity: (input: Omit<CRMActivity, 'id' | 'timestamp'> & { timestamp?: string }) => {
    const activity: CRMActivity = { id: newId('act'), timestamp: input.timestamp ?? nowIso(), ...input };
    setState(s => ({ ...s, activities: [activity, ...s.activities] }));
    return activity;
  },

  deleteActivity: (id: string) => {
    setState(s => ({ ...s, activities: s.activities.filter(a => a.id !== id) }));
  },

  // ── reset ─────────────────────────────────────────────────────────────────
  reset: () => setState(() => SEED),
};

// ── React hooks ──────────────────────────────────────────────────────────────

export function useCRMStore<T>(selector: (s: CRMState) => T): T {
  return useSyncExternalStore(
    crmStore.subscribe,
    () => selector(state),
    () => selector(SEED), // SSR fallback
  );
}

export const useCRMDeals = () => useCRMStore(s => s.deals);
export const useCRMContacts = () => useCRMStore(s => s.contacts);
export const useCRMActivities = () => useCRMStore(s => s.activities);
