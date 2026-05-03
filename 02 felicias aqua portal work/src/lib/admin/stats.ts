"use client";

// Derived dashboard stats. Calculated on demand from the orders store —
// no separate persistence needed. In production swap reads for SQL aggregate
// queries (or materialised views if they get expensive).

import { listOrders, type Order } from "./orders";
import { listInventory, lowStockCount } from "./inventory";

export interface DashboardStats {
  revenue30d: number;
  orders30d: number;
  pending: number;
  fulfilled: number;
  averageOrderValue: number;
  lowStock: number;
  totalCustomers: number;
  topProducts: { name: string; qty: number; revenue: number }[];
  revenueByDay: { day: string; revenue: number }[]; // last 30 days
}

const DAY = 1000 * 60 * 60 * 24;

export function computeStats(): DashboardStats {
  const orders = listOrders();
  const cutoff = Date.now() - DAY * 30;
  const recent = orders.filter(o => o.createdAt >= cutoff && o.status !== "cancelled");

  const revenue30d = recent.reduce((s, o) => s + o.total, 0);
  const orders30d = recent.length;
  const pending = orders.filter(o => o.status === "pending" || o.status === "paid").length;
  const fulfilled = orders.filter(o => o.status === "fulfilled").length;
  const averageOrderValue = orders30d ? revenue30d / orders30d : 0;

  const productTotals = new Map<string, { name: string; qty: number; revenue: number }>();
  recent.forEach(o => o.items.forEach(it => {
    const cur = productTotals.get(it.productId) ?? { name: it.name, qty: 0, revenue: 0 };
    cur.qty += it.quantity;
    cur.revenue += it.unitPrice * it.quantity;
    productTotals.set(it.productId, cur);
  }));
  const topProducts = [...productTotals.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // Bucket revenue by day for the spark chart.
  const dayBuckets = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - DAY * i);
    const key = d.toISOString().slice(0, 10);
    dayBuckets.set(key, 0);
  }
  recent.forEach((o: Order) => {
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    if (dayBuckets.has(key)) dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + o.total);
  });
  const revenueByDay = [...dayBuckets.entries()].map(([day, revenue]) => ({ day, revenue }));

  const totalCustomers = new Set(orders.map(o => o.customerEmail)).size;

  return {
    revenue30d,
    orders30d,
    pending,
    fulfilled,
    averageOrderValue,
    lowStock: lowStockCount(),
    totalCustomers,
    topProducts,
    revenueByDay,
  };
}

// Lightweight pulse for the topbar — call it from anywhere.
export function pendingOrdersCount(): number {
  return listOrders().filter(o => o.status === "pending" || o.status === "paid").length;
}

// Used by the inventory page to mark products that have sold recently.
export function recentSkus(daysBack = 7): Set<string> {
  const cutoff = Date.now() - DAY * daysBack;
  const skus = new Set<string>();
  listOrders()
    .filter(o => o.createdAt >= cutoff)
    .forEach(o => o.items.forEach(i => skus.add(i.productId)));
  // Also surface inventory we might want to back-stock based on velocity.
  listInventory().filter(i => i.onHand - i.reserved <= i.lowAt).forEach(i => skus.add(i.sku));
  return skus;
}
