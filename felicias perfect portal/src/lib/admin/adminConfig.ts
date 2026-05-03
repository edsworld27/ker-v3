"use client";

// Admin panel customisation: branding, theme mode, custom sidebar tabs.
// Stored in localStorage so individual admin users can have their own preferences.

const BRAND_KEY = "lk_admin_brand_v1";          // global (shared across admins)
const TABS_KEY = "lk_admin_custom_tabs_v1";     // global custom sidebar tabs
const MODE_KEY_PREFIX = "lk_admin_mode_";        // per-user (suffixed with email)
const CHANGE_EVENT = "lk-admin-config-change";

export type AdminMode = "dark" | "light" | "midnight" | "sand" | "custom";

// ─── Branding ─────────────────────────────────────────────────────────────────

export interface AdminBranding {
  panelName: string;          // e.g. "LUV & KER · Admin"
  shortName: string;          // shown in collapsed sidebar
  logoUrl: string;            // optional logo image URL/data URI
  accentColor: string;        // primary accent (default brand orange)
  sidebarBg: string;          // sidebar background colour
  sidebarText: string;        // sidebar text colour
  panelBg: string;            // main content background
  panelText: string;          // main content text
  customCSS: string;          // optional raw CSS for power users
  githubRepoUrl: string;      // shown in footer & sidebar
}

export const DEFAULT_BRANDING: AdminBranding = {
  panelName: "LUV & KER",
  shortName: "Admin",
  logoUrl: "",
  accentColor: "#E8621A",
  sidebarBg: "#141414",
  sidebarText: "#FAF5EE",
  panelBg: "#0A0A0A",
  panelText: "#FAF5EE",
  customCSS: "",
  githubRepoUrl: "",
};

// ─── Custom sidebar tabs ──────────────────────────────────────────────────────

export interface CustomTab {
  id: string;
  label: string;
  icon: string;             // emoji or short string
  embedUrl: string;         // URL to render in <iframe>
  group: string;            // sidebar group label (e.g. "Custom", "Tools")
  order: number;
  openInNewTab: boolean;    // if true, opens externally instead of iframe
  visibleToRoles: string[]; // empty = all admins; otherwise team-role IDs
  createdAt: number;
}

// ─── Branding CRUD ────────────────────────────────────────────────────────────

export function getBranding(): AdminBranding {
  if (typeof window === "undefined") return DEFAULT_BRANDING;
  // First: per-org branding from the Brand Kit plugin (if installed
  // for the active org). Falls back to localStorage operator default.
  try {
    const orgBranding = readBrandPluginBranding();
    if (orgBranding) {
      const local = readLocalBranding();
      return { ...DEFAULT_BRANDING, ...local, ...orgBranding };
    }
  } catch { /* fall through */ }
  return readLocalBranding();
}

function readLocalBranding(): AdminBranding {
  if (typeof window === "undefined") return DEFAULT_BRANDING;
  try {
    const raw = localStorage.getItem(BRAND_KEY);
    if (!raw) return DEFAULT_BRANDING;
    return { ...DEFAULT_BRANDING, ...(JSON.parse(raw) as Partial<AdminBranding>) };
  } catch {
    return DEFAULT_BRANDING;
  }
}

// Reads the currently-active org from localStorage (without importing
// the orgs module to avoid a cycle) and pulls the Brand Kit plugin's
// config off it. Returns undefined when no org is active or Brand Kit
// isn't installed (which means the agency operator's local default
// applies, which is the right behaviour for the primary org).
function readBrandPluginBranding(): Partial<AdminBranding> | undefined {
  try {
    const ACTIVE_KEY = "lk_active_org_v1";
    const ORGS_CACHE_KEY = "lk_orgs_v1";
    const orgId = localStorage.getItem(ACTIVE_KEY);
    const cached = localStorage.getItem(ORGS_CACHE_KEY);
    if (!orgId || !cached) return undefined;
    const orgs = JSON.parse(cached) as Array<{ id: string; isPrimary?: boolean; plugins?: Array<{ pluginId: string; config?: Record<string, unknown> }> }>;
    const org = orgs.find(o => o.id === orgId);
    if (!org || org.isPrimary) return undefined;     // primary = operator default
    const brand = (org.plugins ?? []).find(p => p.pluginId === "brand");
    if (!brand?.config) return undefined;
    const c = brand.config as Record<string, string | undefined>;
    const out: Partial<AdminBranding> = {};
    if (c.panelName) out.panelName = c.panelName;
    if (c.shortName) out.shortName = c.shortName;
    if (c.logoUrl)   out.logoUrl = c.logoUrl;
    if (c.primary)   out.accentColor = c.primary;
    if (c.background) out.panelBg = c.background;
    if (c.surface)   out.sidebarBg = c.surface;
    return out;
  } catch { return undefined; }
}

export function saveBranding(patch: Partial<AdminBranding>) {
  if (typeof window === "undefined") return;
  const current = getBranding();
  const next = { ...current, ...patch };
  localStorage.setItem(BRAND_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function resetBranding() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BRAND_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// ─── Custom tabs CRUD ─────────────────────────────────────────────────────────

export function listCustomTabs(): CustomTab[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TABS_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as CustomTab[]).sort((a, b) => a.order - b.order);
  } catch {
    return [];
  }
}

export function getCustomTab(id: string): CustomTab | null {
  return listCustomTabs().find(t => t.id === id) ?? null;
}

export function createCustomTab(input: Omit<CustomTab, "id" | "createdAt" | "order">): CustomTab {
  const tabs = listCustomTabs();
  const tab: CustomTab = {
    ...input,
    id: `tab_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
    order: tabs.length,
    createdAt: Date.now(),
  };
  saveTabs([...tabs, tab]);
  return tab;
}

export function updateCustomTab(id: string, patch: Partial<CustomTab>) {
  saveTabs(listCustomTabs().map(t => t.id === id ? { ...t, ...patch } : t));
}

export function deleteCustomTab(id: string) {
  saveTabs(listCustomTabs().filter(t => t.id !== id));
}

export function moveCustomTab(id: string, direction: -1 | 1) {
  const tabs = listCustomTabs();
  const idx = tabs.findIndex(t => t.id === id);
  if (idx < 0) return;
  const j = idx + direction;
  if (j < 0 || j >= tabs.length) return;
  [tabs[idx], tabs[j]] = [tabs[j], tabs[idx]];
  tabs.forEach((t, i) => { t.order = i; });
  saveTabs(tabs);
}

function saveTabs(tabs: CustomTab[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TABS_KEY, JSON.stringify(tabs));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// ─── Per-user admin mode ──────────────────────────────────────────────────────

export function getAdminMode(userEmail?: string): AdminMode {
  if (typeof window === "undefined") return "dark";
  const key = MODE_KEY_PREFIX + (userEmail ?? "default");
  return (localStorage.getItem(key) as AdminMode) || "dark";
}

export function setAdminMode(mode: AdminMode, userEmail?: string) {
  if (typeof window === "undefined") return;
  const key = MODE_KEY_PREFIX + (userEmail ?? "default");
  localStorage.setItem(key, mode);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// ─── Built-in admin modes (CSS variable overrides) ────────────────────────────

export interface AdminModeColors {
  panelBg: string;
  panelText: string;
  sidebarBg: string;
  sidebarText: string;
  cardBg: string;
  borderColor: string;
  mutedText: string;
}

export const ADMIN_MODES: Record<AdminMode, AdminModeColors> = {
  dark: {
    panelBg: "#0A0A0A",
    panelText: "#FAF5EE",
    sidebarBg: "#141414",
    sidebarText: "#FAF5EE",
    cardBg: "#1A1A1A",
    borderColor: "rgba(255,255,255,0.05)",
    mutedText: "rgba(250,245,238,0.45)",
  },
  light: {
    panelBg: "#FAF5EE",
    panelText: "#1A1209",
    sidebarBg: "#FFFFFF",
    sidebarText: "#1A1209",
    cardBg: "#F5EFE6",
    borderColor: "rgba(0,0,0,0.08)",
    mutedText: "rgba(26,18,9,0.55)",
  },
  midnight: {
    panelBg: "#020618",
    panelText: "#E8EFFF",
    sidebarBg: "#0A0F1F",
    sidebarText: "#E8EFFF",
    cardBg: "#0F1730",
    borderColor: "rgba(120,140,255,0.08)",
    mutedText: "rgba(232,239,255,0.5)",
  },
  sand: {
    panelBg: "#1A1409",
    panelText: "#FBF0DF",
    sidebarBg: "#251B0D",
    sidebarText: "#FBF0DF",
    cardBg: "#2E2211",
    borderColor: "rgba(255,200,150,0.08)",
    mutedText: "rgba(251,240,223,0.5)",
  },
  custom: {
    panelBg: "#0A0A0A",
    panelText: "#FAF5EE",
    sidebarBg: "#141414",
    sidebarText: "#FAF5EE",
    cardBg: "#1A1A1A",
    borderColor: "rgba(255,255,255,0.05)",
    mutedText: "rgba(250,245,238,0.45)",
  },
};

// ─── Change listener ──────────────────────────────────────────────────────────

export function onAdminConfigChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
