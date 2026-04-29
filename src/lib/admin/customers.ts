"use client";

// Customer aggregation. Derived from the orders store + the auth user list,
// so no separate persistence yet. In production a `customers` table is the
// canonical record (joined onto orders for spend totals).

import { listOrders } from "./orders";

export interface CustomerSummary {
  email: string;
  name: string;
  orders: number;
  spend: number;
  lastOrderAt: number | null;
}

export function listCustomers(): CustomerSummary[] {
  const map = new Map<string, CustomerSummary>();
  listOrders().forEach(o => {
    if (o.status === "cancelled") return;
    const cur = map.get(o.customerEmail) ?? {
      email: o.customerEmail,
      name: o.customerName,
      orders: 0,
      spend: 0,
      lastOrderAt: null,
    };
    cur.orders += 1;
    cur.spend += o.total;
    cur.lastOrderAt = Math.max(cur.lastOrderAt ?? 0, o.createdAt);
    map.set(o.customerEmail, cur);
  });
  return [...map.values()].sort((a, b) => b.spend - a.spend);
}
