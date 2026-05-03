/**
 * Finance Store — single source of truth for the Finance Hub.
 *
 * Vanilla useSyncExternalStore singleton with localStorage persistence
 * (key: aqua:finance-store). All Finance views read/write through here.
 */

import { useSyncExternalStore } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

export type TxType = 'Settlement' | 'Credit' | 'Payment' | 'Payout' | 'Fee';
export type TxStatus = 'completed' | 'processing' | 'pending' | 'failed';

export interface FinanceTransaction {
  id: string;
  description: string;
  type: TxType;
  amount: number; // positive = inbound, negative = outbound
  status: TxStatus;
  date: string; // YYYY-MM-DD
  partnerId?: string;
  notes?: string;
}

export interface FinancePartner {
  id: string;
  name: string;
  splitPercent: number;
  contactEmail?: string;
  totalPayouts?: number;
}

export interface FinancePayout {
  id: string;
  partnerId: string;
  amount: number;
  scheduledFor: string;
  status: 'scheduled' | 'processing' | 'sent' | 'cancelled';
  notes?: string;
}

export interface FinanceState {
  transactions: FinanceTransaction[];
  partners: FinancePartner[];
  payouts: FinancePayout[];
}

// ── Seed data ────────────────────────────────────────────────────────────────

const SEED_PARTNERS: FinancePartner[] = [
  { id: 'p-elite',   name: 'Elite Marketing Co.',   splitPercent: 35, contactEmail: 'finance@elite.io',     totalPayouts: 84200 },
  { id: 'p-global',  name: 'Global Tech Partners',  splitPercent: 25, contactEmail: 'splits@globaltech.com', totalPayouts: 62400 },
  { id: 'p-nexus',   name: 'Nexus Finance Group',   splitPercent: 20, contactEmail: 'ops@nexus.finance',     totalPayouts: 48100 },
  { id: 'p-creative', name: 'Creative Pulse Agency', splitPercent: 20, contactEmail: 'admin@creativepulse.co', totalPayouts: 39800 },
];

const SEED_TRANSACTIONS: FinanceTransaction[] = [
  { id: 'FT-10294', description: 'Elite Marketing — Q1 Payout',      type: 'Settlement', amount: -12400, status: 'completed',  date: '2026-04-24', partnerId: 'p-elite' },
  { id: 'FT-10295', description: 'Global Tech — Revenue Split',      type: 'Credit',     amount: +8200,  status: 'processing', date: '2026-04-23', partnerId: 'p-global' },
  { id: 'FT-10296', description: 'Nexus Finance — SaaS Subscription', type: 'Payment',    amount: -420,   status: 'completed',  date: '2026-04-22', partnerId: 'p-nexus' },
  { id: 'FT-10297', description: 'Creative Pulse — Agency Fee',       type: 'Credit',     amount: +5100,  status: 'completed',  date: '2026-04-21', partnerId: 'p-creative' },
  { id: 'FT-10298', description: 'Stripe — Processing Fees',          type: 'Fee',        amount: -348,   status: 'completed',  date: '2026-04-20' },
  { id: 'FT-10299', description: 'Polaris Apparel — Campaign Closed', type: 'Credit',     amount: +156000, status: 'completed', date: '2026-04-10' },
  { id: 'FT-10300', description: 'Greenway Foods — SEO Roadmap',      type: 'Credit',     amount: +24500, status: 'completed',  date: '2026-04-22' },
];

const SEED_PAYOUTS: FinancePayout[] = [
  { id: 'po-1482', partnerId: 'p-elite',    amount: 4200, scheduledFor: '2026-05-04', status: 'scheduled' },
  { id: 'po-1483', partnerId: 'p-global',   amount: 4200, scheduledFor: '2026-05-04', status: 'scheduled' },
  { id: 'po-1484', partnerId: 'p-nexus',    amount: 4200, scheduledFor: '2026-05-04', status: 'scheduled' },
];

const SEED: FinanceState = {
  transactions: SEED_TRANSACTIONS,
  partners: SEED_PARTNERS,
  payouts: SEED_PAYOUTS,
};

// ── Persistence ──────────────────────────────────────────────────────────────

const LS_KEY = 'aqua:finance-store';

function loadFromStorage(): FinanceState {
  if (typeof window === 'undefined') return SEED;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as Partial<FinanceState>;
    return {
      transactions: Array.isArray(parsed.transactions) ? (parsed.transactions as FinanceTransaction[]) : SEED.transactions,
      partners: Array.isArray(parsed.partners) ? (parsed.partners as FinancePartner[]) : SEED.partners,
      payouts: Array.isArray(parsed.payouts) ? (parsed.payouts as FinancePayout[]) : SEED.payouts,
    };
  } catch {
    return SEED;
  }
}

function saveToStorage(state: FinanceState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

// ── Store ────────────────────────────────────────────────────────────────────

let state: FinanceState = loadFromStorage();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach(l => l());
function setState(updater: (prev: FinanceState) => FinanceState) {
  state = updater(state);
  saveToStorage(state);
  notify();
}

const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`.toUpperCase();

const todayIso = () => new Date().toISOString().slice(0, 10);

export const financeStore = {
  getState: () => state,
  subscribe: (l: () => void) => { listeners.add(l); return () => listeners.delete(l); },

  createTransaction: (input: Omit<FinanceTransaction, 'id'>) => {
    const tx: FinanceTransaction = { id: newId('FT'), ...input };
    setState(s => ({ ...s, transactions: [tx, ...s.transactions] }));
    return tx;
  },
  updateTransaction: (id: string, patch: Partial<FinanceTransaction>) => {
    setState(s => ({ ...s, transactions: s.transactions.map(t => t.id === id ? { ...t, ...patch } : t) }));
  },
  deleteTransaction: (id: string) => {
    setState(s => ({ ...s, transactions: s.transactions.filter(t => t.id !== id) }));
  },

  upsertPartner: (input: Omit<FinancePartner, 'id'> & { id?: string }) => {
    setState(s => {
      if (input.id && s.partners.some(p => p.id === input.id)) {
        return { ...s, partners: s.partners.map(p => p.id === input.id ? { ...p, ...input } as FinancePartner : p) };
      }
      const partner: FinancePartner = { id: input.id ?? newId('p'), ...input } as FinancePartner;
      return { ...s, partners: [...s.partners, partner] };
    });
  },
  deletePartner: (id: string) => {
    setState(s => ({
      ...s,
      partners: s.partners.filter(p => p.id !== id),
      payouts: s.payouts.filter(p => p.partnerId !== id),
    }));
  },

  schedulePayout: (input: Omit<FinancePayout, 'id'>) => {
    const po: FinancePayout = { id: newId('PO'), ...input };
    setState(s => ({ ...s, payouts: [po, ...s.payouts] }));
    return po;
  },
  updatePayout: (id: string, patch: Partial<FinancePayout>) => {
    setState(s => ({ ...s, payouts: s.payouts.map(p => p.id === id ? { ...p, ...patch } : p) }));
  },
  cancelPayout: (id: string) => {
    setState(s => ({ ...s, payouts: s.payouts.map(p => p.id === id ? { ...p, status: 'cancelled' as const } : p) }));
  },
};

// ── React hooks ──────────────────────────────────────────────────────────────

export function useFinanceStore<T>(selector: (s: FinanceState) => T): T {
  return useSyncExternalStore(
    financeStore.subscribe,
    () => selector(state),
    () => selector(SEED),
  );
}

export const useFinanceTransactions = () => useFinanceStore(s => s.transactions);
export const useFinancePartners = () => useFinanceStore(s => s.partners);
export const useFinancePayouts = () => useFinanceStore(s => s.payouts);

// ── CSV export helper ────────────────────────────────────────────────────────

export function exportTransactionsCsv(transactions: FinanceTransaction[]): string {
  const header = 'id,date,description,type,amount,status,partnerId,notes';
  const escape = (v: any) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = transactions.map(t =>
    [t.id, t.date, t.description, t.type, t.amount, t.status, t.partnerId ?? '', t.notes ?? '']
      .map(escape).join(','),
  );
  return [header, ...rows].join('\n');
}

export const _seed = SEED;
export const _todayIso = todayIso;
