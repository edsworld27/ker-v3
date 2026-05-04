// Server-side order persistence.
//
// Lifted from `02 felicias aqua portal work/src/portal/server/orders.ts`
// and rewired for the new tenancy model:
//
//   - `orgId` → `clientId`. Each order belongs to one client (Felicia's
//     store, future client stores).
//   - Storage is the per-install plugin slice (`StoragePort`), not a
//     dedicated `serverOrders` field on the foundation portal state.
//
// The Stripe webhook calls `upsertOrderByStripeSession` to land an order
// when payment clears. The function is idempotent — Stripe retries the
// same event, so we update the existing row rather than insert a duplicate.

import { now } from "../lib/time";
import { makeId } from "../lib/ids";
import type { ClientId } from "../lib/tenancy";
import type { StoragePort } from "./ports";

export type OrderStatus =
  | "pending"
  | "paid"
  | "fulfilled"
  | "shipped"
  | "delivered"
  | "refunded"
  | "cancelled";

export interface ServerOrderItem {
  sku?: string;
  name: string;
  description?: string;
  quantity: number;
  unitAmount: number;            // pence/cents
  currency: string;
  digital?: boolean;
  downloadUrl?: string;
  licenseKey?: string;
}

export interface ServerOrder {
  id: string;                    // ord_<short>
  clientId: ClientId;
  stripeSessionId?: string;      // dedupe key on the Stripe side
  paymentIntentId?: string;      // for refunds
  status: OrderStatus;
  amountTotal: number;           // pence/cents
  currency: string;
  customerEmail?: string;
  customerName?: string;
  shippingAddress?: {
    line1?: string; line2?: string; city?: string;
    postalCode?: string; country?: string; state?: string;
  };
  items: ServerOrderItem[];
  metadata?: Record<string, string>;
  createdAt: number;
  paidAt?: number;
  refundedAt?: number;
  fulfilledAt?: number;
  shippedAt?: number;
  trackingNumber?: string;
  trackingCarrier?: string;
}

const KEY_PREFIX = "order:";

export class OrderService {
  constructor(private storage: StoragePort) {}

  private orderKey(id: string): string {
    return `${KEY_PREFIX}${id}`;
  }

  // ─── Reads ──────────────────────────────────────────────────────────

  async getOrder(id: string): Promise<ServerOrder | null> {
    const stored = await this.storage.get<ServerOrder>(this.orderKey(id));
    return stored ?? null;
  }

  async getOrderByStripeSession(sessionId: string): Promise<ServerOrder | null> {
    const all = await this.listAllRaw();
    return all.find(o => o.stripeSessionId === sessionId) ?? null;
  }

  async getOrderByPaymentIntent(paymentIntentId: string): Promise<ServerOrder | null> {
    const all = await this.listAllRaw();
    return all.find(o => o.paymentIntentId === paymentIntentId) ?? null;
  }

  async listOrdersForClient(clientId: ClientId, limit = 100): Promise<ServerOrder[]> {
    const all = await this.listAllRaw();
    return all
      .filter(o => o.clientId === clientId)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  // The plugin storage slice is per-install — fetching every order key in
  // a list is bounded by one install's order count (~1k typical, well
  // within JSON-blob limits). For high-volume tenants the foundation can
  // swap the storage backend to Postgres.
  private async listAllRaw(): Promise<ServerOrder[]> {
    const keys = await this.storage.list(KEY_PREFIX);
    const orders = await Promise.all(
      keys.map(async k => this.storage.get<ServerOrder>(k)),
    );
    return orders.filter((o): o is ServerOrder => o !== undefined);
  }

  // ─── Writes ─────────────────────────────────────────────────────────

  async upsertOrderByStripeSession(input: {
    clientId: ClientId;
    stripeSessionId?: string;
    paymentIntentId?: string;
    amountTotal: number;
    currency: string;
    customerEmail?: string;
    customerName?: string;
    shippingAddress?: ServerOrder["shippingAddress"];
    items: ServerOrderItem[];
    metadata?: Record<string, string>;
  }): Promise<ServerOrder> {
    const existing = input.stripeSessionId
      ? await this.getOrderByStripeSession(input.stripeSessionId)
      : null;

    if (existing) {
      const patched: ServerOrder = {
        ...existing,
        paymentIntentId: input.paymentIntentId ?? existing.paymentIntentId,
        amountTotal: input.amountTotal || existing.amountTotal,
        currency: input.currency || existing.currency,
        customerEmail: input.customerEmail ?? existing.customerEmail,
        customerName: input.customerName ?? existing.customerName,
        shippingAddress: input.shippingAddress ?? existing.shippingAddress,
        items: input.items.length > 0 ? input.items : existing.items,
        metadata: { ...existing.metadata, ...input.metadata },
        status: existing.status === "pending" ? "paid" : existing.status,
        paidAt: existing.paidAt ?? now(),
      };
      await this.storage.set(this.orderKey(patched.id), patched);
      return patched;
    }

    const order: ServerOrder = {
      id: makeId("ord"),
      clientId: input.clientId,
      stripeSessionId: input.stripeSessionId,
      paymentIntentId: input.paymentIntentId,
      amountTotal: input.amountTotal,
      currency: input.currency,
      customerEmail: input.customerEmail,
      customerName: input.customerName,
      shippingAddress: input.shippingAddress,
      items: input.items,
      metadata: input.metadata,
      status: "paid",
      createdAt: now(),
      paidAt: now(),
    };
    await this.storage.set(this.orderKey(order.id), order);
    return order;
  }

  async markOrderRefunded(paymentIntentId: string): Promise<ServerOrder | null> {
    const order = await this.getOrderByPaymentIntent(paymentIntentId);
    if (!order) return null;
    const next: ServerOrder = { ...order, status: "refunded", refundedAt: now() };
    await this.storage.set(this.orderKey(order.id), next);
    return next;
  }

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    extras?: Partial<ServerOrder>,
  ): Promise<ServerOrder | null> {
    const existing = await this.getOrder(id);
    if (!existing) return null;
    const next: ServerOrder = { ...existing, ...extras, status };
    if (status === "shipped" && !next.shippedAt) next.shippedAt = now();
    if (status === "fulfilled" && !next.fulfilledAt) next.fulfilledAt = now();
    await this.storage.set(this.orderKey(id), next);
    return next;
  }
}
