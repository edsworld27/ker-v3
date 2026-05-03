/**
 * People Store — single source of truth for the People Hub.
 * Vanilla useSyncExternalStore singleton with localStorage persistence.
 */

import { useSyncExternalStore } from 'react';

export type EmployeeStatus = 'On-site' | 'Remote' | 'Hybrid' | 'On Leave';
export type Dept = 'Engineering' | 'Design' | 'Marketing' | 'Legal' | 'Finance' | 'Operations';

export interface Employee {
  id: string;
  name: string;
  role: string;
  dept: Dept;
  email?: string;
  status: EmployeeStatus;
  performance: number;
  startedOn?: string;
  topPerformer?: boolean;
  clearanceExpiresOn?: string;
}

export interface JobPosting {
  id: string;
  title: string;
  dept: Dept;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  description?: string;
  postedOn: string;
  status: 'open' | 'paused' | 'closed';
}

export interface AuditEntry {
  id: string;
  action: string;
  details?: string;
  timestamp: string;
}

export interface PeopleState {
  employees: Employee[];
  jobs: JobPosting[];
  audits: AuditEntry[];
}

const SEED_EMPLOYEES: Employee[] = [
  { id: 'e-001', name: 'Alex Sterling',  role: 'Head of Engineering', dept: 'Engineering', status: 'On-site', performance: 4.9, email: 'alex@aqua.io',   startedOn: '2023-03-12', topPerformer: true,  clearanceExpiresOn: '2026-05-15' },
  { id: 'e-002', name: 'Maya Thorne',    role: 'Principal Designer',  dept: 'Design',      status: 'Remote',  performance: 4.8, email: 'maya@aqua.io',   startedOn: '2024-01-08', topPerformer: true },
  { id: 'e-003', name: 'Julian Vance',   role: 'Revenue Lead',        dept: 'Marketing',   status: 'Hybrid',  performance: 4.7, email: 'julian@aqua.io', startedOn: '2024-06-20' },
  { id: 'e-004', name: 'Sofia Khalil',   role: 'Strategy Director',   dept: 'Operations',  status: 'On-site', performance: 5.0, email: 'sofia@aqua.io',  startedOn: '2022-11-03', topPerformer: true,  clearanceExpiresOn: '2026-05-22' },
  { id: 'e-005', name: 'Ethan Brooks',   role: 'Legal Counsel',       dept: 'Legal',       status: 'Remote',  performance: 4.6, email: 'ethan@aqua.io',  startedOn: '2023-09-15', clearanceExpiresOn: '2026-05-30' },
  { id: 'e-006', name: 'Olivia Chen',    role: 'Finance Analyst',     dept: 'Finance',     status: 'On-site', performance: 4.9, email: 'olivia@aqua.io', startedOn: '2024-04-22' },
];

const SEED_JOBS: JobPosting[] = [
  { id: 'j-001', title: 'Senior Backend Engineer', dept: 'Engineering', location: 'Remote (US)', type: 'Full-time', postedOn: '2026-04-15', status: 'open' },
  { id: 'j-002', title: 'Product Designer',         dept: 'Design',      location: 'NYC',         type: 'Full-time', postedOn: '2026-04-20', status: 'open' },
];

const SEED: PeopleState = {
  employees: SEED_EMPLOYEES,
  jobs: SEED_JOBS,
  audits: [],
};

const LS_KEY = 'aqua:people-store';

function loadFromStorage(): PeopleState {
  if (typeof window === 'undefined') return SEED;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as Partial<PeopleState>;
    return {
      employees: Array.isArray(parsed.employees) ? (parsed.employees as Employee[]) : SEED.employees,
      jobs: Array.isArray(parsed.jobs) ? (parsed.jobs as JobPosting[]) : SEED.jobs,
      audits: Array.isArray(parsed.audits) ? (parsed.audits as AuditEntry[]) : SEED.audits,
    };
  } catch {
    return SEED;
  }
}
function saveToStorage(state: PeopleState) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

let state: PeopleState = loadFromStorage();
const listeners = new Set<() => void>();
const notify = () => listeners.forEach(l => l());
function setState(updater: (prev: PeopleState) => PeopleState) {
  state = updater(state);
  saveToStorage(state);
  notify();
}

const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
const nowIso = () => new Date().toISOString();
const todayIso = () => nowIso().slice(0, 10);

export const peopleStore = {
  getState: () => state,
  subscribe: (l: () => void) => { listeners.add(l); return () => listeners.delete(l); },

  upsertEmployee: (input: Omit<Employee, 'id'> & { id?: string }) => {
    setState(s => {
      if (input.id && s.employees.some(e => e.id === input.id)) {
        return { ...s, employees: s.employees.map(e => e.id === input.id ? { ...e, ...input } as Employee : e) };
      }
      const e: Employee = { id: input.id ?? newId('e'), ...input } as Employee;
      return { ...s, employees: [e, ...s.employees] };
    });
  },
  deleteEmployee: (id: string) => {
    setState(s => ({ ...s, employees: s.employees.filter(e => e.id !== id) }));
  },

  createJob: (input: Omit<JobPosting, 'id' | 'postedOn' | 'status'> & { status?: JobPosting['status'] }) => {
    const job: JobPosting = { id: newId('j'), postedOn: todayIso(), status: input.status ?? 'open', ...input };
    setState(s => ({ ...s, jobs: [job, ...s.jobs] }));
    return job;
  },
  updateJob: (id: string, patch: Partial<JobPosting>) => {
    setState(s => ({ ...s, jobs: s.jobs.map(j => j.id === id ? { ...j, ...patch } : j) }));
  },
  closeJob: (id: string) => {
    setState(s => ({ ...s, jobs: s.jobs.map(j => j.id === id ? { ...j, status: 'closed' } : j) }));
  },

  startComplianceAudit: () => {
    setState(s => ({
      ...s,
      audits: [
        { id: newId('a'), action: 'Compliance audit started', details: `${s.employees.filter(e => e.clearanceExpiresOn).length} clearances reviewed`, timestamp: nowIso() },
        ...s.audits,
      ],
    }));
  },
};

export function usePeopleStore<T>(selector: (s: PeopleState) => T): T {
  return useSyncExternalStore(
    peopleStore.subscribe,
    () => selector(state),
    () => selector(SEED),
  );
}
export const usePeopleEmployees = () => usePeopleStore(s => s.employees);
export const usePeopleJobs = () => usePeopleStore(s => s.jobs);
