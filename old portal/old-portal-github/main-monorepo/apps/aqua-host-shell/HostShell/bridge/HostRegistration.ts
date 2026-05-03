/**
 * HostShell Bridge Registration
 *
 * Thin re-export of the canonical HostRegistration from @aqua/bridge.
 * All registration and resolution goes through the single Bridge instance —
 * no parallel implementation here.
 *
 * Import from this path anywhere in the Live Application to stay decoupled
 * from the Bridge package path directly.
 */

import { BridgeRegistry } from '@aqua/bridge/registry';

/** HostRegistration — alias of BridgeRegistry for the host shell */
export const HostRegistration = BridgeRegistry;
