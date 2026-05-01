"use client";

// Granular GDPR consent system with per-category toggles.
// Separate from seoConsent.ts (which handles the simple accept/decline for analytics scripts).
// This module handles full preference management, data export, and data deletion.

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

const DEFAULTS: ConsentPreferences = {
  necessary: true,
  functional: true,
  analytics: false,
  marketing: false,
  updatedAt: 0,
  decided: false,
};

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
