"use client";

// Inventory store. Like orders.ts — localStorage-backed scaffold, swap for DB.
//
// TODO Database (Supabase):
//   table products (id, sku, name, range, price, currency, archived)
//   table inventory (sku primary key, on_hand int, reserved int, low_at int)

const STORAGE_KEY = "lk_admin_inventory_v1";

export interface InventoryItem {
  sku: string;
  name: string;
  range: "odo" | "nkrabea" | "accessories" | "gift";
  price: number;       // £
  onHand: number;      // physical stock
  reserved: number;    // attached to unfulfilled orders
  lowAt: number;       // restock threshold
  unlimited?: boolean; // when true, item never shows sold-out (digital, made-to-order, services)
  archived?: boolean;
}

const CHANGE_EVENT = "lk-admin-products-change";

interface Store { [sku: string]: InventoryItem; }

function read(): Store {
  if (typeof window === "undefined") return seedIfEmpty({});
  try { return seedIfEmpty(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Store); }
  catch { return seedIfEmpty({}); }
}
function write(s: Store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function seedIfEmpty(s: Store): Store {
  if (Object.keys(s).length > 0) return s;
  const seed: InventoryItem[] = [
    { sku: "ODO-BODY-ORG-200",  name: "Odo Body · Wild Orange · 200g",     range: "odo",      price: 22, onHand: 47, reserved: 3, lowAt: 10 },
    { sku: "ODO-FACE-LAV-100",  name: "Odo Face · Lavender · 100ml",       range: "odo",      price: 24, onHand: 28, reserved: 1, lowAt: 10 },
    { sku: "ODO-HANDS-FRA-100", name: "Odo Hands · Frankincense · 100g",   range: "odo",      price: 18, onHand: 9,  reserved: 2, lowAt: 10 },
    { sku: "NKR-FACE-CED-100",  name: "Nkrabea Face · Cedar · 100ml",      range: "nkrabea",  price: 26, onHand: 33, reserved: 0, lowAt: 10 },
    { sku: "BLACK-SOAP-200",    name: "Felicia's Black Soap · 200g",       range: "odo",      price: 20, onHand: 64, reserved: 4, lowAt: 15 },
    { sku: "RITUAL-SIGNATURE",  name: "The Ritual Set · Signature",        range: "gift",     price: 55, onHand: 12, reserved: 1, lowAt: 5 },
    { sku: "PUMICE-STD",        name: "Odo Pumice · Standard",             range: "accessories", price: 12, onHand: 80, reserved: 0, lowAt: 15 },
  ];
  const next: Store = {};
  seed.forEach(i => { next[i.sku] = i; });
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function listInventory(): InventoryItem[] {
  return Object.values(read()).sort((a, b) => a.name.localeCompare(b.name));
}

export function getInventory(sku: string): InventoryItem | null {
  return read()[sku] ?? null;
}

export function upsertInventory(item: InventoryItem) {
  const s = read();
  s[item.sku] = item;
  write(s);
}

export function adjustStock(sku: string, delta: number) {
  const s = read();
  if (!s[sku]) return;
  s[sku].onHand = Math.max(0, s[sku].onHand + delta);
  write(s);
}

export function updateInventoryFields(sku: string, patch: Partial<Pick<InventoryItem, "lowAt" | "unlimited" | "onHand" | "reserved" | "name" | "price" | "archived">>) {
  const s = read();
  if (!s[sku]) return;
  s[sku] = { ...s[sku], ...patch };
  write(s);
}

export function lowStockCount(): number {
  return listInventory().filter(i => !i.archived && !i.unlimited && i.onHand - i.reserved <= i.lowAt).length;
}
