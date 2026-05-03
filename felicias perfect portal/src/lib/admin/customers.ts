"use client";

// Customer aggregation. Derived from the orders store + the auth user list,
// so no separate persistence yet. In production a `customers` table is the
// canonical record (joined onto orders for spend totals).

import { listOrders, type Order } from "./orders";

export interface CustomerSummary {
  email: string;
  name: string;
  orders: number;
  spend: number;
  lastOrderAt: number | null;
}

export interface CustomerDetail extends CustomerSummary {
  firstOrderAt: number | null;
  allOrders: Order[];
  tags: string[];
  notes: string;
  avgOrderValue: number;
}

const NOTES_KEY = "lk_customer_notes_v1";
const TAGS_KEY  = "lk_customer_tags_v1";

function readNotes(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(NOTES_KEY) || "{}"); } catch { return {}; }
}
function readTags(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(TAGS_KEY) || "{}"); } catch { return {}; }
}
function writeNotes(d: Record<string, string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTES_KEY, JSON.stringify(d));
}
function writeTags(d: Record<string, string[]>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TAGS_KEY, JSON.stringify(d));
}

export function saveCustomerNotes(email: string, notes: string) {
  const d = readNotes(); d[email] = notes; writeNotes(d);
}
export function saveCustomerTags(email: string, tags: string[]) {
  const d = readTags(); d[email] = tags; writeTags(d);
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

export function getCustomerDetail(email: string): CustomerDetail | null {
  const allOrders = listOrders().filter(o => o.customerEmail === email);
  if (allOrders.length === 0) return null;

  const notes = readNotes();
  const tags  = readTags();

  const active = allOrders.filter(o => o.status !== "cancelled");
  const spend       = active.reduce((s, o) => s + o.total, 0);
  const name        = allOrders[0].customerName;
  const times       = allOrders.map(o => o.createdAt);
  const lastOrderAt  = times.length ? Math.max(...times) : null;
  const firstOrderAt = times.length ? Math.min(...times) : null;

  return {
    email, name,
    orders: active.length,
    spend,
    lastOrderAt,
    firstOrderAt,
    allOrders: [...allOrders].sort((a, b) => b.createdAt - a.createdAt),
    tags:  tags[email]  ?? [],
    notes: notes[email] ?? "",
    avgOrderValue: active.length > 0 ? spend / active.length : 0,
  };
}
