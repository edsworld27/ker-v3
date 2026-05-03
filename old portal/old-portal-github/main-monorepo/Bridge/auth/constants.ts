/**
 * Bridge Auth Constants — safe to import client-side (no Prisma).
 */
import type { BridgeSession } from '../types';

export const DEMO_EMAIL = 'demo@aqua.portal';

export const DEMO_SESSION: BridgeSession = {
  user: {
    id: 0,
    name: 'Demo Founder',
    email: DEMO_EMAIL,
    role: 'Founder',
    agencyId: 'demo-agency',
    productAccess: ['operations', 'client', 'crm'],
    status: 'active',
  },
  agency: {
    id: 'demo-agency',
    name: 'Aqua Demo Agency',
    isConfigured: true,
    theme: { primary: '#6366f1', secondary: '#8b5cf6' },
  },
  enabledSuiteIds: ['*'],
  productAccess: ['operations', 'client', 'crm'],
  isDemo: true,
};
