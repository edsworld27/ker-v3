"use client";

// Shipping config — zones, rates, free-shipping thresholds, policy text.
// Read by checkout, the public shipping-returns page, and the chatbot.
//
// TODO Database (Supabase):
//   table shipping_zones (id text pk, name text, countries text[], sort int);
//   table shipping_rates (id text pk, zone_id text, label text, price numeric,
//     min_days int, max_days int, free_threshold numeric, sort int);

const STORAGE_KEY = "lk_admin_shipping_v1";
const CHANGE_EVENT = "lk-admin-shipping-change";

export interface ShippingRate {
  id: string;
  label: string;          // "Standard 2–4 days"
  price: number;          // £
  minDays: number;
  maxDays: number;
  freeThreshold?: number; // free over £X (zone-level fallback also applies)
}

export interface ShippingZone {
  id: string;
  name: string;           // "United Kingdom"
  countries: string[];    // ISO codes
  rates: ShippingRate[];
  freeThreshold?: number;
}

export interface ShippingConfig {
  zones: ShippingZone[];
  policy: {
    headline: string;
    intro: string;
    returnsHeadline: string;
    returnsBody: string;
    damageHeadline: string;
    damageBody: string;
  };
  defaults: {
    handlingTime: string;       // "We dispatch within 24 hours"
    cutoff: string;             // "Order before 2pm for next-day"
    carrier: string;            // "Royal Mail Tracked 48"
  };
}

const SEED: ShippingConfig = {
  zones: [
    {
      id: "z_uk", name: "United Kingdom", countries: ["GB"], freeThreshold: 30,
      rates: [
        { id: "r_uk_std", label: "Standard tracked",   price: 4.99, minDays: 2, maxDays: 4 },
        { id: "r_uk_exp", label: "Express next-day",    price: 7.90, minDays: 1, maxDays: 1 },
      ],
    },
    {
      id: "z_eu", name: "European Union", countries: ["IE","FR","DE","NL","ES","IT","PT","BE"], freeThreshold: 60,
      rates: [
        { id: "r_eu_std", label: "Tracked airmail", price: 9.99, minDays: 4, maxDays: 7 },
      ],
    },
    {
      id: "z_us", name: "United States & Canada", countries: ["US","CA"], freeThreshold: 80,
      rates: [
        { id: "r_us_std", label: "Tracked airmail", price: 14.99, minDays: 5, maxDays: 10 },
      ],
    },
    {
      id: "z_row", name: "Rest of world", countries: [],
      rates: [
        { id: "r_row_std", label: "Tracked airmail", price: 19.99, minDays: 7, maxDays: 14 },
      ],
    },
  ],
  policy: {
    headline: "Honest delivery, honest returns",
    intro: "Everything you need to know about getting your Odo to your door — and back, if it isn't right.",
    returnsHeadline: "30-day returns",
    returnsBody: "Unopened, unused products can be returned within 30 days of receipt. Email hello@luvandker.com with your order number to start a return.",
    damageHeadline: "Damaged in transit",
    damageBody: "Email a photo to hello@luvandker.com within 7 days. We'll replace the item free of charge — no return required.",
  },
  defaults: {
    handlingTime: "We dispatch from Accra & Manchester within 24 hours, Mon–Fri.",
    cutoff: "Order before 2pm GMT for same-day dispatch.",
    carrier: "Royal Mail Tracked",
  },
};

function read(): ShippingConfig {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
      return SEED;
    }
    return JSON.parse(raw) as ShippingConfig;
  } catch { return SEED; }
}

function write(c: ShippingConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getShippingConfig(): ShippingConfig { return read(); }

export function saveShippingConfig(c: ShippingConfig) { write(c); }

export function updatePolicy(patch: Partial<ShippingConfig["policy"]>) {
  const c = read();
  c.policy = { ...c.policy, ...patch };
  write(c);
}

export function updateDefaults(patch: Partial<ShippingConfig["defaults"]>) {
  const c = read();
  c.defaults = { ...c.defaults, ...patch };
  write(c);
}

function zid(p: string) { return `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 4)}`; }

export function addZone(name = "New zone"): ShippingZone {
  const c = read();
  const z: ShippingZone = { id: zid("z"), name, countries: [], rates: [] };
  c.zones.push(z);
  write(c);
  return z;
}

export function updateZone(zoneId: string, patch: Partial<ShippingZone>) {
  const c = read();
  const z = c.zones.find(x => x.id === zoneId);
  if (!z) return;
  Object.assign(z, patch);
  write(c);
}

export function deleteZone(zoneId: string) {
  const c = read();
  c.zones = c.zones.filter(z => z.id !== zoneId);
  write(c);
}

export function addRate(zoneId: string): ShippingRate | null {
  const c = read();
  const z = c.zones.find(x => x.id === zoneId);
  if (!z) return null;
  const r: ShippingRate = { id: zid("r"), label: "New rate", price: 0, minDays: 2, maxDays: 5 };
  z.rates.push(r);
  write(c);
  return r;
}

export function updateRate(zoneId: string, rateId: string, patch: Partial<ShippingRate>) {
  const c = read();
  const z = c.zones.find(x => x.id === zoneId);
  if (!z) return;
  const r = z.rates.find(x => x.id === rateId);
  if (!r) return;
  Object.assign(r, patch);
  write(c);
}

export function deleteRate(zoneId: string, rateId: string) {
  const c = read();
  const z = c.zones.find(x => x.id === zoneId);
  if (!z) return;
  z.rates = z.rates.filter(r => r.id !== rateId);
  write(c);
}

export function onShippingChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
