import { Client } from '../types';

/**
 * clientDB.ts — Dedicated Client Persistence Layer (Local Mode)
 * This file acts as our "local database" for clients.
 * In a production environment, this data would live in Prisma/Postgres.
 */

export const clientDB: Client[] = [
  {
    id: 'client-1',
    agencyId: 'aqua-main',
    name: 'Acme Corp',
    email: 'contact@acme.com',
    stage: 'discovery',
    discoveryAnswers: {
      'business-goals': 'We want to increase our online sales by 50% this year.',
      'target-audience': 'Tech-savvy professionals aged 25-45.',
      'brand-voice': 'Professional, yet approachable and innovative.'
    },
    resources: [],
    enabledSuiteIds: ['hr_suite', 'sales_suite'],
    // Potential CMS Config
    githubOwner: 'acme-corp',
    githubRepo: 'acme-website',
    githubFilePath: 'src/data/config.json',
    cmsProvisioned: false
  },
  {
    id: 'client-2',
    agencyId: 'aqua-main',
    name: 'Global Tech',
    email: 'info@globaltech.io',
    stage: 'design',
    websiteUrl: 'https://example.com/preview/globaltech',
    discoveryAnswers: {},
    resources: [{ name: 'Brand Assets', url: '#', type: 'zip' }],
    enabledSuiteIds: ['marketing_suite'],
    cmsProvisioned: false
  }
];

/**
 * Helper to update the local client state.
 * Since this is a static file in dev mode, real persistence would happen 
 * via an API call to a server-side route.
 */
export const updateClientInDB = (clientId: string, updates: Partial<Client>) => {
  const index = clientDB.findIndex(c => c.id === clientId);
  if (index !== -1) {
    clientDB[index] = { ...clientDB[index], ...updates };
    console.log(`[ClientDB] Updated ${clientId}`, updates);
    return true;
  }
  return false;
};
