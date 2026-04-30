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

/**
 * Set the cart-reservation count for a SKU. Cart contents are the source of
 * truth — call this every time the cart changes with the current quantity
 * for that SKU. Pre-empts stock without committing it.
 */
export function setReserved(sku: string, quantity: number) {
  const s = read();
  if (!s[sku]) return;
  s[sku].reserved = Math.max(0, quantity);
  write(s);
}

/**
 * Sync all reservations from a snapshot of cart quantities. Pass a map of
 * sku → total qty in the cart; missing SKUs get reset to 0. Idempotent.
 */
export function syncReservations(skuQuantities: Record<string, number>) {
  const s = read();
  let changed = false;
  for (const sku of Object.keys(s)) {
    if (s[sku].unlimited) continue;
    const want = Math.max(0, skuQuantities[sku] ?? 0);
    if (s[sku].reserved !== want) {
      s[sku].reserved = want;
      changed = true;
    }
  }
  if (changed) write(s);
}

/**
 * Commit a sale: decrement onHand and release the reservation. Call this
 * once an order has been paid (Stripe webhook → order.paid).
 */
export function consumeStock(sku: string, quantity: number) {
  const s = read();
  if (!s[sku] || s[sku].unlimited) return;
  s[sku].onHand   = Math.max(0, s[sku].onHand   - quantity);
  s[sku].reserved = Math.max(0, s[sku].reserved - quantity);
  write(s);
}

const PENDING_KEY = "lk_pending_sale_v1";

/**
 * Snapshot the cart at checkout-submit time. The success page reads this
 * back, calls consumeStock for each line, then clears it. Survives the
 * Stripe redirect because it lives in localStorage.
 */
export function stashPendingSale(items: { stockSku?: string; quantity: number }[]) {
  if (typeof window === "undefined") return;
  const lines = items.filter(i => i.stockSku).map(i => ({ sku: i.stockSku!, qty: i.quantity }));
  if (lines.length === 0) return;
  localStorage.setItem(PENDING_KEY, JSON.stringify(lines));
}

export function commitPendingSale() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return;
    const lines = JSON.parse(raw) as { sku: string; qty: number }[];
    for (const line of lines) consumeStock(line.sku, line.qty);
  } finally {
    localStorage.removeItem(PENDING_KEY);
  }
}

export function lowStockCount(): number {
  return listInventory().filter(i => !i.archived && !i.unlimited && i.onHand - i.reserved <= i.lowAt).length;
}
