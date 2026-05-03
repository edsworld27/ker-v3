// Server-side order persistence — survives across deploys via the
// cloud-storage layer (whatever backend the portal is configured to
// use: file, KV, Supabase, Postgres). This is the source of truth
// once the Stripe webhook lands; the client-side localStorage
// orders.ts is being phased out.
//
// Each order belongs to one org (set on the Stripe session metadata
// when the checkout was created). Orders carry enough context to
// render an /admin/orders/[id] page without joining other tables.

import "server-only";
import { getState, mutate } from "./storage";

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
  // Digital products carry a downloadUrl resolved at delivery time.
  digital?: boolean;
  downloadUrl?: string;
  licenseKey?: string;
}

export interface ServerOrder {
  id: string;                    // ord_<short>
  orgId: string;
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

interface OrdersState {
  serverOrders?: Record<string, ServerOrder>;
}

function makeId(): string {
  return `ord_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

// ─── Reads ────────────────────────────────────────────────────────────────

export function getServerOrder(id: string): ServerOrder | undefined {
  const s = getState() as unknown as OrdersState;
  return s.serverOrders?.[id];
}

export function getOrderByStripeSession(sessionId: string): ServerOrder | undefined {
  const s = getState() as unknown as OrdersState;
  if (!s.serverOrders) return undefined;
  return Object.values(s.serverOrders).find(o => o.stripeSessionId === sessionId);
}

export function listServerOrders(orgId: string, limit = 100): ServerOrder[] {
  const s = getState() as unknown as OrdersState;
  if (!s.serverOrders) return [];
  return Object.values(s.serverOrders)
    .filter(o => o.orgId === orgId)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
}

// ─── Writes ───────────────────────────────────────────────────────────────

export interface CreateOrderInput {
  orgId: string;
  stripeSessionId?: string;
  paymentIntentId?: string;
  amountTotal: number;
  currency: string;
  customerEmail?: string;
  customerName?: string;
  shippingAddress?: ServerOrder["shippingAddress"];
  items: ServerOrderItem[];
  metadata?: Record<string, string>;
}

export function upsertOrderByStripeSession(input: CreateOrderInput): ServerOrder {
  // Idempotent — webhook can fire multiple times for the same session;
  // we update the existing row rather than creating a duplicate.
  const existing = input.stripeSessionId
    ? getOrderByStripeSession(input.stripeSessionId)
    : undefined;

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
      paidAt: existing.paidAt ?? Date.now(),
    };
    mutate(state => {
      const s = state as unknown as OrdersState;
      if (!s.serverOrders) s.serverOrders = {};
      s.serverOrders[patched.id] = patched;
    });
    return patched;
  }

  const order: ServerOrder = {
    id: makeId(),
    orgId: input.orgId,
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
    createdAt: Date.now(),
    paidAt: Date.now(),
  };
  mutate(state => {
    const s = state as unknown as OrdersState;
    if (!s.serverOrders) s.serverOrders = {};
    s.serverOrders[order.id] = order;
  });
  return order;
}

export function markOrderRefunded(paymentIntentId: string): ServerOrder | null {
  const s = getState() as unknown as OrdersState;
  if (!s.serverOrders) return null;
  const order = Object.values(s.serverOrders).find(o => o.paymentIntentId === paymentIntentId);
  if (!order) return null;
  const next: ServerOrder = { ...order, status: "refunded", refundedAt: Date.now() };
  mutate(state => {
    const ss = state as unknown as OrdersState;
    if (!ss.serverOrders) ss.serverOrders = {};
    ss.serverOrders[order.id] = next;
  });
  return next;
}

export function updateOrderStatus(id: string, status: OrderStatus, extras?: Partial<ServerOrder>): ServerOrder | null {
  let next: ServerOrder | null = null;
  mutate(state => {
    const s = state as unknown as OrdersState;
    if (!s.serverOrders) return;
    const existing = s.serverOrders[id];
    if (!existing) return;
    next = { ...existing, ...extras, status };
    if (status === "shipped" && !next.shippedAt) next.shippedAt = Date.now();
    if (status === "fulfilled" && !next.fulfilledAt) next.fulfilledAt = Date.now();
    s.serverOrders[id] = next;
  });
  return next;
}
