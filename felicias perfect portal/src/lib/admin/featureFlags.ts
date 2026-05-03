"use client";

import { logActivity } from "./activity";

// Feature flags system.
// Admin can turn features on/off site-wide, set rollout %, or override per user email.
// Components use isFeatureEnabled(flag) to gate functionality.

const FLAGS_KEY = "lk_feature_flags_v1";
const CHANGE_EVENT = "lk-flags-change";

export type FlagStatus = "on" | "off" | "rollout";

export interface FeatureFlag {
  id: string;                           // stable snake_case identifier
  name: string;                         // human label
  description: string;
  category: FlagCategory;
  status: FlagStatus;                   // "on" | "off" | "rollout"
  rolloutPercent: number;               // 0–100, only used when status === "rollout"
  userOverrides: Record<string, boolean>; // email → enabled override
  createdAt: number;
  isBuiltIn: boolean;                   // built-in flags cannot be deleted
}

export type FlagCategory =
  | "storefront"
  | "marketing"
  | "upsell"
  | "admin"
  | "experimental"
  | "future";

export const CATEGORY_LABELS: Record<FlagCategory, string> = {
  storefront:   "Storefront",
  marketing:    "Marketing",
  upsell:       "Upsells",
  admin:        "Admin",
  experimental: "Experimental",
  future:       "Future / Store",
};

// ─── Built-in flags ────────────────────────────────────────────────────────────

export const BUILT_IN_FLAGS: FeatureFlag[] = [
  {
    id: "chatbot",
    name: "AI Chat assistant",
    description: "The floating chat assistant on the storefront.",
    category: "storefront",
    status: "on",
    rolloutPercent: 100,
    userOverrides: {},
    createdAt: 0,
    isBuiltIn: true,
  },
  {
    id: "discount_popup",
    name: "Discount popup",
    description: "Exit-intent / timed discount offer popup.",
    category: "marketing",
    status: "on",
    rolloutPercent: 100,
    userOverrides: {},
    createdAt: 0,
    isBuiltIn: true,
  },
  {
    id: "reviews",
    name: "Customer reviews section",
    description: "Reviews / testimonials on product pages and homepage.",
    category: "storefront",
    status: "on",
    rolloutPercent: 100,
    userOverrides: {},
    createdAt: 0,
    isBuiltIn: true,
  },
  {
    id: "newsletter",
    name: "Newsletter sign-up",
    description: "Newsletter capture in footer and any embedded forms.",
    category: "marketing",
    status: "on",
    rolloutPercent: 100,
    userOverrides: {},
    createdAt: 0,
    isBuiltIn: true,
  },
  {
    id: "affiliate",
    name: "Affiliate / referral programme",
    description: "Referral codes and the affiliate dashboard in user accounts.",
    category: "upsell",
    status: "on",
    rolloutPercent: 100,
    userOverrides: {},
    createdAt: 0,
    isBuiltIn: true,
  },
  {
    id: "gift_cards",
    name: "Gift cards",
    description: "Gift card purchase tab on the products page.",
    category: "upsell",
    status: "on",
    rolloutPercent: 100,
    userOverrides: {},
    createdAt: 0,
    isBuiltIn: true,
  },
  {
    id: "purple_scroller",
    name: "Purple side-scroller",
    description: "The animated vertical marketing rail on the right side.",
    category: "marketing",
    status: "on",
    rolloutPercent: 100,
    userOverrides: {},
    createdAt: 0,
    isBuiltIn: true,
  },
  {
    id: "subscriptions",
    name: "Subscriptions (future)",
    description: "Subscribe & save options on product pages. Store until ready to launch.",
    category: "future",
    status: "off",
    rolloutPercent: 0,
    userOverrides: {},
    createdAt: 0,
    isBuiltIn: true,
  },
  {
    id: "loyalty",
    name: "Loyalty points (future)",
    description: "Earn points on purchases and redeem for discounts.",
    category: "future",
    status: "off",
    rolloutPercent: 0,
    userOverrides: {},
    createdAt: 0,
    isBuiltIn: true,
  },
  {
    id: "bundle_upsell",
    name: "Bundle upsell (future)",
    description: '"Complete the ritual" bundle suggestions on product pages.',
    category: "future",
    status: "off",
    rolloutPercent: 0,
    userOverrides: {},
    createdAt: 0,
    isBuiltIn: true,
  },
];

// ─── Storage ───────────────────────────────────────────────────────────────────

interface FlagStore { [id: string]: Partial<FeatureFlag>; }

function readStore(): FlagStore {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(FLAGS_KEY) || "{}") as FlagStore; }
  catch { return {}; }
}

function writeStore(store: FlagStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(FLAGS_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// ─── Merge built-ins with stored overrides ─────────────────────────────────────

function mergeFlag(base: FeatureFlag, override: Partial<FeatureFlag>): FeatureFlag {
  return { ...base, ...override, id: base.id, isBuiltIn: base.isBuiltIn };
}

export function listFlags(): FeatureFlag[] {
  const store = readStore();
  const builtIn = BUILT_IN_FLAGS.map(f => mergeFlag(f, store[f.id] ?? {}));
  const custom = Object.entries(store)
    .filter(([id]) => !BUILT_IN_FLAGS.find(f => f.id === id))
    .map(([, v]) => v as FeatureFlag);
  return [...builtIn, ...custom];
}

export function getFlag(id: string): FeatureFlag | null {
  return listFlags().find(f => f.id === id) ?? null;
}

export function saveFlag(id: string, patch: Partial<Omit<FeatureFlag, "id">>) {
  const store = readStore();
  const prev = store[id];
  store[id] = { ...store[id], ...patch };
  writeStore(store);
  if (prev) {
    const changes: string[] = [];
    if (patch.status !== undefined && patch.status !== prev.status) changes.push(`status: ${prev.status} → ${patch.status}`);
    if (patch.rolloutPercent !== undefined && patch.rolloutPercent !== prev.rolloutPercent) changes.push(`rollout: ${prev.rolloutPercent}% → ${patch.rolloutPercent}%`);
    if (changes.length > 0 || patch.name || patch.description || patch.category) {
      logActivity({
        category: "features",
        action: `Updated flag "${prev.name}"${changes.length ? ` (${changes.join(", ")})` : ""}`,
        resourceId: id,
        resourceLink: `/admin/features`,
      });
    }
  }
}

export function createFlag(
  name: string,
  description: string,
  category: FlagCategory
): FeatureFlag {
  const id = name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "").slice(0, 40)
    + "_" + Date.now().toString(36).slice(-4);
  const flag: FeatureFlag = {
    id, name, description, category,
    status: "off",
    rolloutPercent: 0,
    userOverrides: {},
    createdAt: Date.now(),
    isBuiltIn: false,
  };
  const store = readStore();
  store[id] = flag;
  writeStore(store);
  return flag;
}

export function deleteFlag(id: string) {
  const built = BUILT_IN_FLAGS.find(f => f.id === id);
  if (built) return; // cannot delete built-ins
  const store = readStore();
  delete store[id];
  writeStore(store);
}

// ─── Per-user override ─────────────────────────────────────────────────────────

export function setUserOverride(flagId: string, email: string, enabled: boolean | null) {
  const flag = getFlag(flagId);
  if (!flag) return;
  const overrides = { ...flag.userOverrides };
  if (enabled === null) delete overrides[email];
  else overrides[email] = enabled;
  const store = readStore();
  store[flagId] = { ...store[flagId], userOverrides: overrides };
  writeStore(store);
  logActivity({
    category: "features",
    action: enabled === null
      ? `Cleared "${flag.name}" override for ${email}`
      : `Set "${flag.name}" → ${enabled ? "ON" : "OFF"} for ${email}`,
    resourceId: flagId,
    resourceLink: `/admin/features`,
  });
}

// ─── Evaluation ───────────────────────────────────────────────────────────────

function stableHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function isFeatureEnabled(flagId: string, userEmail?: string): boolean {
  const flag = getFlag(flagId);
  if (!flag) return false;

  // Per-user override takes highest precedence
  if (userEmail && flag.userOverrides[userEmail] !== undefined) {
    return flag.userOverrides[userEmail];
  }

  if (flag.status === "off") return false;
  if (flag.status === "on") return true;

  // Rollout: deterministic per-user or per-browser bucket
  const seed = userEmail || (typeof window !== "undefined" ? (localStorage.getItem("lk_rollout_seed") ?? (() => {
    const s = Math.random().toString(36).slice(2);
    localStorage.setItem("lk_rollout_seed", s);
    return s;
  })()) : "anon");
  const bucket = stableHash(`${flagId}:${seed}`) % 100;
  return bucket < flag.rolloutPercent;
}

export function onFlagsChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
