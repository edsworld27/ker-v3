/**
 * Demo State
 *
 * The "God Mode" demo payload. Uses Bridge's DEMO_SESSION as the
 * authoritative session object — single source of truth for who the
 * demo user is and what they can access.
 *
 * The Bridge DEMO_SESSION sets enabledSuiteIds: ['*'] which means
 * all suites are unlocked. Domain mock data (todos, projects, etc.)
 * remains local since it's app-specific, not Bridge-level.
 */

import { DEMO_SESSION } from '@aqua/bridge/auth/constants';
import { seedUsers, seedClients } from '@aqua/bridge/data/seedData';
import { initialActivityLogs, initialNotifications } from '../data/RevenuemockData';

export { DEMO_SESSION };

/**
 * The full demo initialData payload — used to hydrate the app when
 * a user logs in with the demo account.
 */
export const DEMO_INITIAL_DATA = {
  users: seedUsers,
  clients: seedClients,
  activityLogs: initialActivityLogs,
  notifications: initialNotifications,
};
