import { ClientStage } from '@ClientShell/bridge/types';

export const AGENCY_CLIENT_NODES = [
  {
    id: 'cl-882',
    name: 'Blue Horizon Tech',
    stage: 'live' as ClientStage,
    email: 'ops@bluehorizon.com',
    permissions: ['analytics', 'billing', 'support'],
    cmsProvisioned: true
  },
  {
    id: 'cl-441',
    name: 'Stellar Dynamics',
    stage: 'development' as ClientStage,
    email: 'admin@stellardynamics.io',
    permissions: ['analytics', 'development'],
    cmsProvisioned: false
  },
  {
    id: 'cl-305',
    name: 'Apex Capital',
    stage: 'discovery' as ClientStage,
    email: 'contact@apexcap.com',
    permissions: ['analytics'],
    cmsProvisioned: false
  }
];

export const CLIENT_STAGE_METRICS = {
  live: 42,
  development: 12,
  discovery: 8,
  onboarding: 15
};
