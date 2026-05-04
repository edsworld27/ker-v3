import "server-only";
// Ecommerce plugin foundation registration.
//
// T2's ecommerce manifest exposes routes / pages that depend on a
// register-once-at-boot foundation adapter (`registerEcommerceFoundation`)
// — see `@aqua/plugin-ecommerce/src/server/foundationAdapter.ts`. We
// wrap T1's modules into the ports the plugin expects, then call
// `registerEcommerceFoundation` exactly once.
//
// Module-level code runs on first import — the registry imports this
// module at boot, so the registration happens before any handler runs.

import { registerEcommerceFoundation } from "@aqua/plugin-ecommerce/server";
import { getClient, getClientForAgency } from "@/server/tenants";
import { logActivity, listActivity } from "@/server/activity";
import { emit } from "@/server/eventBus";
import { getInstall } from "@/server/pluginInstalls";
import type { AquaEventName } from "@/server/eventBus";

let registered = false;

export function ensureEcommerceFoundationRegistered(): void {
  if (registered) return;
  registerEcommerceFoundation({
    tenant: {
      getClient(id) { return getClient(id); },
      getClientForAgency(agencyId, clientId) { return getClientForAgency(agencyId, clientId); },
    },
    activity: {
      logActivity(input) { return logActivity(input); },
      listActivity(filter) { return listActivity(filter); },
    },
    events: {
      emit(scope, name, payload) {
        // EcommerceEventName ⊂ AquaEventName for foundation-emitted names;
        // ecommerce-specific names (order.*, product.*, inventory.*,
        // discount.*) extend the foundation set. Cast through the wider
        // bus type — eventBus.ts doesn't reject unknown names.
        emit(scope, name as AquaEventName, payload);
      },
    },
    pluginInstalls: {
      getInstall(scope, pluginId) { return getInstall(scope, pluginId); },
    },
  });
  registered = true;
}

// Eager registration — module import = registration.
ensureEcommerceFoundationRegistered();
