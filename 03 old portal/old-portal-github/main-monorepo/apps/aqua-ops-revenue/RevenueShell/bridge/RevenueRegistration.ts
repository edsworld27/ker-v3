/**
 * RevenueShell Bridge Registration
 *
 * Thin re-export of the canonical RevenueRegistration from @aqua/bridge.
 * All registration and resolution goes through the single Bridge instance —
 * no parallel implementation here.
 *
 * Import from this path anywhere in the Live Application to stay decoupled
 * from the Bridge package path directly.
 */

import { BridgeRegistry } from '@aqua/bridge/registry';

export const RevenueRegistration = BridgeRegistry;

export { BridgeRegistry };
