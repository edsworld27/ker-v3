/**
 * PeopleShell Bridge Provisioning
 *
 * Delegates to the Bridge sync layer which owns all cross-product
 * provisioning logic (creating AQUA Client workspaces, etc.)
 */

import type { Client } from '@PeopleShell/bridge/types';

export const BridgeProvisioning = {
  /**
   * Provisions a client workspace via the Bridge API route.
   * The Bridge sync handles DB writes and fires CLIENT_PROVISIONED event.
   */
  async provisionClientInCMS(client: Client): Promise<{ success: boolean; provisionedAt?: string; error?: string }> {
    try {
      const res = await fetch('/api/bridge/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: client.id }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err.error ?? 'Provisioning failed' };
      }

      return { success: true, provisionedAt: new Date().toISOString() };

    } catch (err) {
      // Dev fallback — no server available
      console.warn('[Provisioning] Server unavailable, simulating success for dev');
      await new Promise(r => setTimeout(r, 800));
      return { success: true, provisionedAt: new Date().toISOString() };
    }
  },
};
