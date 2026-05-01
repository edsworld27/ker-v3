"use client";

// Granular GDPR consent system with per-category toggles.
// Separate from seoConsent.ts (which handles the simple accept/decline for analytics scripts).
// This module handles full preference management, data export, and data deletion.

import { loadCompliance, getComplianceModeSync } from "@/lib/admin/portalCompliance";
import type { ComplianceMode } from "@/portal/server/types";

const PREFS_KEY = "lk_consent_prefs_v2";
const EVENT = "lk-consent-prefs-change";

export interface ConsentPreferences {
  // Strictly necessary cookies — cannot be disabled
  necessary: true;
  // Functional cookies (remember preferences, cart, wishlist)
  functional: boolean;
  // Analytics (GA4, Hotjar, Plausible — identifies usage patterns)
  analytics: boolean;
  // Marketing (Meta Pixel, TikTok Pixel, remarketing)
  marketing: boolean;
  // Timestamp of last update
  updatedAt: number;
  // Whether the user has actively made a choice
  decided: boolean;
}

// Permissive defaults are only correct for "none" / "soc2". GDPR + HIPAA
// require opt-in, so we tighten them at first render via
// enforceComplianceDefaults() below. The "necessary" + "functional"
// categories stay on because the site can't operate without them.
const DEFAULTS: ConsentPreferences = {
  necessary: true,
  functional: true,
  analytics: false,
  marketing: false,
  updatedAt: 0,
  decided: false,
};

// True when the active mode legally requires explicit opt-in for
// analytics + marketing (i.e. the user has not yet "decided"). GDPR is
// the canonical example; HIPAA inherits the same rule because PHI
// processors must be just as conservative.
export function isStrictConsentMode(mode: ComplianceMode): boolean {
  return mode === "gdpr" || mode === "hipaa";
}

export function getConsentPreferences(): ConsentPreferences {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) as Partial<ConsentPreferences>, necessary: true };
  } catch {
    return DEFAULTS;
  }
}

export function saveConsentPreferences(prefs: Omit<ConsentPreferences, "necessary" | "updatedAt" | "decided">) {
  if (typeof window === "undefined") return;
  const full: ConsentPreferences = {
    ...prefs,
    necessary: true,
    updatedAt: Date.now(),
    decided: true,
  };
  localStorage.setItem(PREFS_KEY, JSON.stringify(full));
  // Also set legacy simple consent for backward compat with SiteHead
  localStorage.setItem("lk_consent_v1", prefs.analytics ? "accepted" : "declined");
  window.dispatchEvent(new Event(EVENT));
  // Notify legacy listeners too
  window.dispatchEvent(new Event("lk-consent-change"));
}

export function acceptAll() {
  saveConsentPreferences({ functional: true, analytics: true, marketing: true });
}

export function declineAll() {
  saveConsentPreferences({ functional: false, analytics: false, marketing: false });
}

export function onConsentPrefsChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

// ─── Compliance-aware defaults ────────────────────────────────────────────────
//
// GDPR + HIPAA both require opt-in: analytics & marketing cookies cannot
// fire until the user has made an explicit choice. Our DEFAULTS already
// have analytics + marketing off, but if a previous run left a
// permissive cache behind we need to rewrite the stored prefs so a mode
// flip from "none" → "gdpr" can never carry stale opt-outs forward.
//
// Idempotent: only writes when stricter rules apply and the persisted
// prefs are looser than the policy requires. Safe to call repeatedly
// at first render. We never overwrite a recorded user decision —
// "decided=true" is the user's lawful basis to process and is sticky
// across mode flips until the user revisits the modal.

let lastEnforcedMode: ComplianceMode | null = null;

export async function enforceComplianceDefaults(): Promise<ComplianceMode> {
  if (typeof window === "undefined") return "none";
  // Probe the live mode (cached in memory by portalCompliance for 60s).
  await loadCompliance().catch(() => null);
  const mode = getComplianceModeSync();
  applyComplianceDefaults(mode);
  return mode;
}

// Sync helper — uses whatever's already cached. Useful for components
// that want to react to mode changes without an extra await.
export function applyComplianceDefaults(mode: ComplianceMode): ComplianceMode {
  if (typeof window === "undefined") return mode;
  if (lastEnforcedMode === mode) return mode;
  lastEnforcedMode = mode;

  if (!isStrictConsentMode(mode)) return mode;

  try {
    const raw = localStorage.getItem(PREFS_KEY);
    const stored: Partial<ConsentPreferences> = raw ? JSON.parse(raw) : {};
    // Only rewrite when the user hasn't explicitly decided yet. A
    // recorded decision (decided=true) is the user's lawful basis to
    // process; we don't second-guess it on a mode flip.
    if (stored.decided) return mode;
    // Idempotency check — bail out if the stored state already matches
    // the strict policy.
    const current = { ...DEFAULTS, ...stored };
    if (current.analytics === false && current.marketing === false) return mode;
    const tightened: ConsentPreferences = {
      necessary: true,
      functional: stored.functional ?? true,   // stays on — required for site
      analytics: false,
      marketing: false,
      updatedAt: stored.updatedAt ?? 0,
      decided: false,
    };
    localStorage.setItem(PREFS_KEY, JSON.stringify(tightened));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore — corrupt JSON will be replaced on next save */
  }
  return mode;
}

// ─── Data export ──────────────────────────────────────────────────────────────

export function collectUserData(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  const data: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    profile: null as unknown,
    consent: null as unknown,
    cart: null as unknown,
    orders: null as unknown,
    preferences: null as unknown,
  };

  // Profile / session
  try {
    const sessionRaw = localStorage.getItem("lk_session_v1");
    if (sessionRaw) {
      const session = JSON.parse(sessionRaw) as { user?: { email?: string; name?: string; role?: string } };
      data.profile = {
        email: session.user?.email,
        name: session.user?.name,
        role: session.user?.role,
      };
    }
  } catch { /* ignore */ }

  // Consent
  data.consent = getConsentPreferences();

  // Cart
  try {
    const cartRaw = localStorage.getItem("luv-ker-cart");
    if (cartRaw) data.cart = JSON.parse(cartRaw);
  } catch { /* ignore */ }

  // Orders
  try {
    const ordersRaw = localStorage.getItem("lk_orders_v1");
    if (ordersRaw) data.orders = JSON.parse(ordersRaw);
  } catch { /* ignore */ }

  // Theme / UI preferences
  try {
    data.preferences = {
      activeVariant: localStorage.getItem("lk_active_variant_v1"),
      activeTheme: localStorage.getItem("lk_theme_v1") ? "(custom)" : "default",
    };
  } catch { /* ignore */ }

  return data;
}

export function downloadUserData() {
  const data = collectUserData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `luv-ker-data-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Data deletion ────────────────────────────────────────────────────────────

// Keys that belong to the current user and should be cleared on deletion.
// Does NOT clear admin CMS data.
const USER_KEYS = [
  "lk_session_v1",
  "lk_consent_v1",
  "lk_consent_prefs_v2",
  "lk_active_variant_v1",
  "luv-ker-cart",
];

export function deleteMyData() {
  if (typeof window === "undefined") return;
  for (const key of USER_KEYS) {
    localStorage.removeItem(key);
  }
  // Also clear session storage
  sessionStorage.clear();
  window.dispatchEvent(new Event(EVENT));
}
