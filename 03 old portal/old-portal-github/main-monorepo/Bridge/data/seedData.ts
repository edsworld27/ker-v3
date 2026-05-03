/**
 * Bridge Seed Data — pure data, safe to import client-side.
 * No Prisma, no server-only code.
 */
import type { AppUser, Client, Agency } from '../types';

export const seedAgency: Agency = {
  id: 'aqua-main',
  name: 'Aqua Digital',
  isConfigured: true,
  theme: { primary: '#6366f1', secondary: '#8b5cf6' },
};

export const seedUsers: AppUser[] = [
  {
    id: 1,
    name: 'Ed (Founder)',
    email: 'ed@aqua.digital',
    role: 'Founder',
    agencyId: 'aqua-main',
    avatar: 'E',
    department: 'Leadership',
    status: 'active',
    productAccess: ['operations', 'client', 'crm'],
    baseSalaryCents: 0,
  },
  {
    id: 2,
    name: 'Agency Manager',
    email: 'manager@aqua.digital',
    role: 'AgencyManager',
    agencyId: 'aqua-main',
    avatar: 'M',
    department: 'Management',
    status: 'active',
    productAccess: ['operations', 'crm'],
    baseSalaryCents: 6000000,
  },
  {
    id: 3,
    name: 'Dev Team Member',
    email: 'dev@aqua.digital',
    role: 'AgencyEmployee',
    agencyId: 'aqua-main',
    avatar: 'D',
    department: 'Development',
    status: 'active',
    productAccess: ['operations', 'client'],
    baseSalaryCents: 4500000,
  },
  {
    id: 4,
    name: 'Jane (Freelancer)',
    email: 'jane@freelance.io',
    role: 'Freelancer',
    avatar: 'J',
    status: 'active',
    productAccess: ['client'],
    baseSalaryCents: 0,
  },
  {
    id: 5,
    name: 'Acme Owner',
    email: 'owner@acme.com',
    role: 'ClientOwner',
    clientId: 'client-1',
    avatar: 'A',
    status: 'active',
    productAccess: ['client'],
    baseSalaryCents: 0,
  },
];

export const seedClients: Client[] = [
  {
    id: 'client-1',
    agencyId: 'aqua-main',
    name: 'Acme Corp',
    email: 'contact@acme.com',
    stage: 'discovery',
    discoveryAnswers: {
      'business-goals': 'Increase online sales by 50% this year.',
      'target-audience': 'Tech-savvy professionals aged 25-45.',
      'brand-voice': 'Professional, approachable, and innovative.',
    },
    resources: [],
    enabledSuiteIds: ['hr_suite', 'sales_suite'],
    assignedEmployees: [3],
    cmsProvisioned: false,
  },
  {
    id: 'client-2',
    agencyId: 'aqua-main',
    name: 'Global Tech',
    email: 'info@globaltech.io',
    stage: 'design',
    discoveryAnswers: {},
    resources: [{ name: 'Brand Assets', url: '#', type: 'zip' }],
    enabledSuiteIds: ['marketing_suite'],
    cmsProvisioned: false,
  },
];
