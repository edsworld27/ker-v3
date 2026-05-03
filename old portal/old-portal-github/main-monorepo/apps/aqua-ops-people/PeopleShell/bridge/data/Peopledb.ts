/**
 * Bridge Data Loader
 *
 * Loads initial seed state. Users and clients come from @aqua/bridge/data/seedData
 * so there's a single source of truth for seed records.
 * Domain-specific mock data (todos, projects, etc.) stays in mockData.ts.
 */

import { seedUsers, seedClients } from '@aqua/bridge/data/seedData';
import { initialActivityLogs } from './PeoplemockData';

export const loadSeedData = async () => {
  return {
    users: seedUsers,
    clients: seedClients,
    activityLogs: initialActivityLogs,
  };
};

export const syncToDatabase = async (key: string, data: any) => {
  console.log(`[BridgeDB] Syncing ${key}`, data);
  return { success: true };
};
