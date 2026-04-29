"use client";

// Order store. localStorage-backed in dev so the admin dashboard works
// end-to-end with no DB. In production this is replaced by your Postgres /
// Supabase tables — every function below is the read/write API that the rest
// of the app calls, so swapping the implementation is one file.
//
// TODO Database (Supabase):
//   table orders (
//     id text primary key,
//     created_at timestamptz default now(),
//     customer_email text,
//     customer_name  text,
//     items          jsonb,
//     subtotal       numeric,
//     discount       numeric,
//     shipping       numeric,
//     tax            numeric,
//     total          numeric,
//     currency       text,
//     status         text,        -- pending | paid | fulfilled | refunded | cancelled
//     payment_intent text,        -- Stripe payment_intent id
//     shipping_addr  jsonb,
//     tracking       jsonb        -- { carrier, code, label_url }
//   );

const STORAGE_KEY = "lk_admin_orders_v1";

export type OrderStatus = "pending" | "paid" | "fulfilled" | "refunded" | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  variant?: string;
  quantity: number;
  unitPrice: number; // £
}

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  country: string;
  phone?: string;
}

export interface Tracking {
  carrier: string;
  code: string;
  labelUrl?: string;
  printedAt?: number;
}

export interface Order {
  id: string;
  createdAt: number;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: "GBP" | "USD" | "EUR";
  status: OrderStatus;
  paymentIntent?: string;
  shippingAddress?: ShippingAddress;
  tracking?: Tracking;
}

interface Store { [id: string]: Order; }

function read(): Store {
  if (typeof window === "undefined") return seedIfEmpty({});
  try { return seedIfEmpty(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Store); }
  catch { return seedIfEmpty({}); }
}
function write(s: Store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

// First load: seed with a few demo orders so the dashboard has shape.
function seedIfEmpty(s: Store): Store {
  if (Object.keys(s).length > 0) return s;
  const now = Date.now();
  const day = 1000 * 60 * 60 * 24;
  const seed: Order[] = [
    {
      id: "ORD-4821", createdAt: now - day * 2, customerEmail: "ama.boateng@example.com", customerName: "Ama Boateng",
      items: [{ productId: "odo-body-orange-200", name: "Odo Body · Wild Orange · 200g", quantity: 1, unitPrice: 22 },
              { productId: "odo-face-lavender-100", name: "Odo Face · Lavender · 100ml", quantity: 1, unitPrice: 24 }],
      subtotal: 46, discount: 0, shipping: 4.5, tax: 0, total: 50.5, currency: "GBP",
      status: "paid",
      shippingAddress: { name: "Ama Boateng", line1: "12 Crescent Rd", city: "London", postcode: "E2 9PA", country: "GB" },
    },
    {
      id: "ORD-4820", createdAt: now - day * 5, customerEmail: "tom.b@example.com", customerName: "Tom Brennan",
      items: [{ productId: "ritual-set-signature", name: "The Ritual Set · Signature", quantity: 1, unitPrice: 55 }],
      subtotal: 55, discount: 5.5, shipping: 4.5, tax: 0, total: 54, currency: "GBP",
      status: "fulfilled",
      shippingAddress: { name: "Tom Brennan", line1: "4 Granby St", city: "Manchester", postcode: "M1 7AY", country: "GB" },
      tracking: { carrier: "Royal Mail", code: "AB123456789GB", printedAt: now - day * 4 },
    },
    {
      id: "ORD-4819", createdAt: now - day * 9, customerEmail: "yaa.s@example.com", customerName: "Yaa Sarpong",
      items: [{ productId: "odo-hands-frank-100", name: "Odo Hands · Frankincense · 100g", quantity: 2, unitPrice: 18 }],
      subtotal: 36, discount: 0, shipping: 4.5, tax: 0, total: 40.5, currency: "GBP",
      status: "pending",
    },
  ];
  const next: Store = {};
  seed.forEach(o => { next[o.id] = o; });
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function listOrders(): Order[] {
  return Object.values(read()).sort((a, b) => b.createdAt - a.createdAt);
}

export function getOrder(id: string): Order | null {
  return read()[id] ?? null;
}

export function upsertOrder(order: Order) {
  const s = read();
  s[order.id] = order;
  write(s);
}

export function setOrderStatus(id: string, status: OrderStatus) {
  const s = read();
  if (!s[id]) return;
  s[id].status = status;
  write(s);
}

export function attachTracking(id: string, tracking: Tracking) {
  const s = read();
  if (!s[id]) return;
  s[id].tracking = tracking;
  if (s[id].status === "paid") s[id].status = "fulfilled";
  write(s);
}

// Generate a fresh display id. Production replaces this with a DB sequence.
export function nextOrderId(): string {
  const existing = Object.keys(read());
  const max = existing.reduce((m, id) => {
    const n = parseInt(id.replace(/^ORD-/, ""), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 4820);
  return `ORD-${max + 1}`;
}
