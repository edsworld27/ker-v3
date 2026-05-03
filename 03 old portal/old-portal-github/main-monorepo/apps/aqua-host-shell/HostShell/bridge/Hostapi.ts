/**
 * HostApp Shell Bridge API — thin client-side wrapper
 *
 * The HostApp Shell calls these methods. They delegate to the Bridge
 * via API routes (server-side) rather than hitting Prisma directly.
 *
 * In development without a live DB, falls back to the Bridge seed data.
 */

import { DEMO_EMAIL, DEMO_SESSION } from '@aqua/bridge/auth/constants';
import type { BridgeSession } from '@aqua/bridge/types';

export const BridgeAPI = {
  /**
   * Authenticate a user. Calls the Bridge auth API route.
   * Returns the full BridgeSession on success — the session drives everything:
   * enabledSuiteIds, productAccess, currentUser, and agency (tenant).
   */
  async authenticate(
    email: string,
    portalType: 'agency' | 'client' = 'agency'
  ): Promise<{ success: boolean; session?: BridgeSession; error?: string }> {

    // Demo shortcut — no network call needed
    if (email === DEMO_EMAIL || email === 'demo') {
      return { success: true, session: DEMO_SESSION };
    }

    try {
      const res = await fetch('/api/bridge/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, portalType }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err.error ?? 'Authentication failed' };
      }

      const data = await res.json();
      return { success: true, session: data.session };

    } catch {
      // Network unavailable — fall back to Bridge seed users
      const { seedUsers, seedClients } = await import('@aqua/bridge/data/seedData');
      const found = seedUsers.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (!found) return { success: false, error: 'User not found.' };

      const session: BridgeSession = {
        user: found,
        agency: { id: 'local', name: 'Local Dev Agency', isConfigured: true },
        enabledSuiteIds: found.role === 'Founder' ? ['*'] : [],
        productAccess: found.productAccess ?? ['operations'],
        isDemo: false,
      };
      return { success: true, session };
    }
  },

  /**
   * Get the full initial state for a session (users, clients, etc.)
   * Uses agencyId from the session to scope the data fetch.
   */
  async getInitialState(agencyId: string): Promise<any> {
    try {
      const res = await fetch(`/api/bridge/state?agencyId=${agencyId}`);
      if (res.ok) return await res.json();
    } catch { /* fallback below */ }

    // Fallback — Bridge seed data
    const { seedUsers, seedClients } = await import('@aqua/bridge/data/seedData');
    return {
      success: true,
      state: {
        initialData: {
          users: seedUsers,
          clients: seedClients,
          activityLogs: [],
          notifications: [],
        },
      },
    };
  },

  /**
   * Sync a data key to the persistence layer.
   */
  async syncData(agencyId: string, key: string, value: any) {
    try {
      await fetch('/api/bridge/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyId, key, value }),
      });
    } catch {
      console.warn(`[BridgeAPI] syncData offline — ${key} not persisted`);
    }
    return { success: true };
  },
};
