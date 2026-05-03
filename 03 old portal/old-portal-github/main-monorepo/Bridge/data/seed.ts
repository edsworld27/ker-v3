/**
 * Bridge Seed Data
 *
 * Used in two ways:
 * 1. Dev fallback when no live DB is connected
 * 2. `prisma db seed` to populate a fresh database
 *
 * In production, delete these and use real DB records.
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
    productAccess: ['client'], // fulfilment portal only
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

/**
 * Run this to seed a fresh database:
 *   npx prisma db seed
 * Server-side only — uses Prisma.
 */
export async function runSeed() {
  const { prisma } = await import('./prisma');

  console.log('[Bridge Seed] Seeding database...');

  // Agency
  await prisma.agency.upsert({
    where: { id: seedAgency.id },
    update: {},
    create: {
      id: seedAgency.id,
      name: seedAgency.name,
      isConfigured: seedAgency.isConfigured,
      primaryColor: seedAgency.theme?.primary ?? '#6366f1',
    },
  });

  // Users
  for (const user of seedUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        agencyId: user.agencyId ?? null,
        clientId: user.clientId ?? null,
        avatar: user.avatar ?? null,
        department: user.department ?? null,
        status: user.status ?? 'active',
        baseSalaryCents: user.baseSalaryCents ?? 0,
        productAccess: (user.productAccess ?? ['operations']).join(','),
      },
    });
  }

  // Clients
  for (const client of seedClients) {
    await prisma.client.upsert({
      where: { id: client.id },
      update: {},
      create: {
        id: client.id,
        agencyId: client.agencyId,
        name: client.name,
        email: client.email,
        stage: client.stage,
        discoveryAnswers: JSON.stringify(client.discoveryAnswers),
        enabledSuiteIds: JSON.stringify(client.enabledSuiteIds),
        assignedEmployeeIds: JSON.stringify(client.assignedEmployees ?? []),
        cmsProvisioned: false,
      },
    });
  }

  console.log('[Bridge Seed] Done.');
}
