// Foundation port contracts for the ecommerce plugin.
//
// The plugin reaches into T1's foundation only via these interfaces.
// T1 binds concrete implementations and constructs an
// `EcommerceServices` container that pages + handlers consume via the
// adapter in `src/server/foundationAdapter.ts`.
//
// Mirrors the fulfillment plugin's port discipline.

import type {
  ActivityCategory,
  ActivityEntry,
  AgencyId,
  Client,
  ClientId,
  PluginInstall,
  PluginInstallScope,
  UserId,
} from "../lib/tenancy";

// ─── Storage (per-install plugin storage) ────────────────────────────────
//
// Same shape as PluginCtx.storage but lifted to a port so server modules
// can persist state (orders, products, inventory) without importing the
// foundation directly.

export interface StoragePort {
  get<T = unknown>(key: string): Promise<T | undefined>;
  set<T = unknown>(key: string, value: T): Promise<void>;
  del(key: string): Promise<void>;
  list(prefix?: string): Promise<string[]>;
}

// ─── Tenant (read-only client lookup, agency-scoped) ─────────────────────

export interface TenantPort {
  getClient(id: ClientId): Promise<Client | null> | Client | null;
  getClientForAgency(agencyId: AgencyId, clientId: ClientId): Promise<Client | null> | Client | null;
}

// ─── Activity log ─────────────────────────────────────────────────────────

export interface LogActivityInput {
  agencyId: AgencyId;
  clientId?: ClientId;
  actorUserId?: UserId;
  actorEmail?: string;
  category: ActivityCategory;
  action: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface ListActivityFilter {
  agencyId: AgencyId;
  clientId?: ClientId;
  limit?: number;
}

export interface ActivityPort {
  logActivity(input: LogActivityInput): Promise<ActivityEntry> | ActivityEntry;
  listActivity(filter: ListActivityFilter): Promise<ActivityEntry[]> | ActivityEntry[];
}

// ─── Event bus ────────────────────────────────────────────────────────────
//
// Aligned with T1's `eventBus.ts` event vocabulary plus ecommerce-specific
// events emitted by this plugin.

export type EcommerceEventName =
  // Foundation re-exports — the plugin can subscribe to these too.
  | "client.created"
  | "client.updated"
  | "client.archived"
  | "phase.advanced"
  | "plugin.installed"
  | "plugin.uninstalled"
  | "plugin.enabled"
  | "plugin.disabled"
  | "plugin.configured"
  // Ecommerce plugin events.
  | "order.created"
  | "order.paid"
  | "order.refunded"
  | "order.fulfilled"
  | "order.shipped"
  | "order.cancelled"
  | "product.created"
  | "product.updated"
  | "product.deleted"
  | "inventory.updated"
  | "discount.applied";

export interface EventBusPort {
  emit<T = unknown>(
    scope: { agencyId: AgencyId; clientId?: ClientId },
    name: EcommerceEventName,
    payload: T,
  ): void;
}

// ─── Plugin install lookup (per-install config read) ─────────────────────
//
// Stripe keys, default currency, etc. live on `install.config`. The
// storefront APIs need access to the install record outside lifecycle
// hooks (e.g. cart-checkout reads STRIPE_SECRET_KEY from the install
// config without an env var).

export interface PluginInstallStorePort {
  getInstall(scope: PluginInstallScope, pluginId: string): Promise<PluginInstall | null> | PluginInstall | null;
}
