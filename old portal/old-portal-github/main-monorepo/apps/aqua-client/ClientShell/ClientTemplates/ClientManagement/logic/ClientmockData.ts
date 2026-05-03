import { Client, AppUser } from '@ClientShell/bridge/types';

export const MANAGED_CLIENTS_MOCK: Client[] = [
  {
    id: 'cl-882',
    name: 'Blue Horizon Tech',
    stage: 'live',
    email: 'ops@bluehorizon.com',
    agencyId: 'aqua-main',
    enabledSuiteIds: [],
    resources: [{ name: 'Brand Guidelines', url: '#', type: 'document' }],
    discoveryAnswers: { 'q1': 'Answer 1', 'q2': 'Answer 2' },
    assignedEmployees: [1, 2],
    githubOwner: 'blue-horizon',
    githubRepo: 'web-v9',
    cmsProvisioned: true
  },
  {
    id: 'cl-441',
    name: 'Stellar Dynamics',
    stage: 'development',
    email: 'admin@stellar.io',
    agencyId: 'aqua-main',
    enabledSuiteIds: [],
    discoveryAnswers: {},
    assignedEmployees: [1]
  }
];

export const INTERNAL_USERS_MOCK: AppUser[] = [
  { id: 1, name: 'Sarah Jenkins', role: 'AgencyEmployee', email: 'sarah@aqua.com' },
  { id: 2, name: 'Michael Chen', role: 'AgencyEmployee', email: 'michael@aqua.com' }
];
