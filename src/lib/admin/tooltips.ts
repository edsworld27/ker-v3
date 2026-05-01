"use client";

// Editable tooltips. Default copy lives in DEFAULT_TOOLTIPS keyed by stable IDs.
// Admins can override any text from /admin/tooltips. Overrides persist in
// localStorage and broadcast a change event so live <Tip> instances re-render.

const KEY = "lk_tooltip_overrides_v1";
const EVENT = "lk-tooltips-change";

export interface TooltipDef {
  text: string;
  location: string;   // human breadcrumb so admins can find where it appears
  category: string;   // grouping in the editor
}

// Catalog of all admin tooltips. Keys are stable; never rename — overrides
// are stored against these IDs.
export const DEFAULT_TOOLTIPS: Record<string, TooltipDef> = {
  // Feature flags
  "features.header": {
    text: "Toggle parts of the site without redeploying. Use rollout % to gradually expose new features to a subset of users (deterministic by stable hash of email).",
    location: "Admin → Feature flags → page header",
    category: "Feature flags",
  },
  "features.rollout": {
    text: "Sticky bucketing: each user is hashed to a stable number 0–99, and stays in or out for the lifetime of this flag. Increase the percentage to widen exposure.",
    location: "Admin → Feature flags → rollout %",
    category: "Feature flags",
  },

  // Split testing
  "split-test.header": {
    text: "Run controlled experiments. Each visitor sees a single variant for the lifetime of the test (sticky bucketing). Statistical significance kicks in around 200+ conversions per variant.",
    location: "Admin → Split testing → page header",
    category: "Split testing",
  },
  "split-test.target-path": {
    text: "The URL where visitors land. They'll then be redirected to one of the variants (preserving query strings).",
    location: "Admin → Split testing → New test → Target path",
    category: "Split testing",
  },
  "split-test.goal-type": {
    text: "What you're measuring. Page visit fires when a user reaches goalPath. Add to cart fires on cart updates. Purchase fires on /checkout/success.",
    location: "Admin → Split testing → New test → Goal type",
    category: "Split testing",
  },

  // Shipping
  "shipping.handling-time": {
    text: "How long between order and shipment. Shown on the storefront and used by the chatbot.",
    location: "Admin → Shipping → Dispatch defaults",
    category: "Shipping",
  },
  "shipping.cutoff": {
    text: "Daily cutoff time for same-day dispatch. Orders placed after this ship the next business day.",
    location: "Admin → Shipping → Dispatch defaults",
    category: "Shipping",
  },
  "shipping.carrier": {
    text: "Used when an order's tracking is missing carrier metadata.",
    location: "Admin → Shipping → Dispatch defaults",
    category: "Shipping",
  },
  "shipping.zones": {
    text: "Group destination countries and assign carrier rates to each. The first matching zone wins, so order zones from most specific to most general (eg. UK first, then Europe, then Worldwide).",
    location: "Admin → Shipping → Zones",
    category: "Shipping",
  },

  // Theme
  "theme.header": {
    text: "Edits here update Tailwind CSS variables at runtime — the storefront re-skins live without a deploy. Use the Variants tab to maintain Light/Earth/Ocean alongside Dark.",
    location: "Admin → Theme → page header",
    category: "Theme",
  },
};

function readOverrides(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch { return {}; }
}

function writeOverrides(overrides: Record<string, string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(overrides));
  window.dispatchEvent(new Event(EVENT));
}

export function getTooltipText(id: string | undefined, fallback: string): string {
  if (!id) return fallback;
  const o = readOverrides();
  return o[id] ?? fallback;
}

export function listTooltipOverrides(): Record<string, string> {
  return readOverrides();
}

export function saveTooltipOverride(id: string, text: string) {
  const o = readOverrides();
  if (!text.trim()) {
    delete o[id];
  } else {
    o[id] = text;
  }
  writeOverrides(o);
}

export function resetTooltipOverride(id: string) {
  const o = readOverrides();
  delete o[id];
  writeOverrides(o);
}

export function resetAllTooltipOverrides() {
  writeOverrides({});
}

export function onTooltipsChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
