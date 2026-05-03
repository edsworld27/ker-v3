"use client";

import { logActivity } from "./activity";

// Multi-site support. A "site" is a public-facing storefront with its own
// brand, domains and content but sharing the product catalog with sibling
// sites. This lets Felicia run several front-ends (eg. luvandker.com,
// odo-skincare.com, partner-collab.com) from one admin without copying
// products around.
//
// The admin has an "active site" concept (per-admin-user) that scopes
// branding/CMS edits. Public visitors are routed to the matching site by
// hostname automatically (see SiteResolver).

const KEY = "lk_sites_v1";
const ACTIVE_KEY = "lk_active_site_v1";
const EVENT = "lk-sites-change";

export interface Site {
  id: string;                      // stable internal id
  name: string;                    // display name e.g. "Luv & Ker"
  slug: string;                    // url-safe id used in admin paths
  domains: string[];               // every domain that should resolve here
  primaryDomain?: string;          // canonical domain used for absolute URLs
  logoUrl?: string;
  faviconUrl?: string;
  tagline?: string;
  description?: string;
  themeVariantId?: string;         // id from themeVariants.ts
  isPrimary: boolean;              // marks the original site (cannot delete)
  enabledProductRanges?: string[]; // restrict which product ranges show; empty = all
  socialHandles?: {
    instagram?: string;
    twitter?: string;
    tiktok?: string;
  };
  status: "draft" | "live";
  createdAt: number;
  orgId?: string;                  // G-2: which org owns this site (undefined → primary)
  // Custom head/body code (P-3). Injected by SiteHead on every page so
  // admins can wire GA, Meta Pixel, hotjar, custom CSS, custom JS, etc.
  // without touching the codebase. The customHead string is dropped into
  // the document <head>; customBody at the end of <body>.
  customHead?: string;             // P-3: arbitrary HTML injected into <head>
  customBody?: string;             // P-3: arbitrary HTML injected at the end of <body>
  // SEO-A2: Sitelinks JSON-LD blob (SiteNavigationElement). Auto-seeded
  // from visual-editor pages on /admin/seo, hand-editable.
  siteNavigationJsonLd?: string;
  // X-1 site-level UX toggles. All optional; off by default so existing
  // sites keep rendering exactly as before.
  smoothScroll?: boolean;          // CSS scroll-behavior: smooth on <html>
  customCursor?: "default" | "dot" | "ring" | "blur";  // global cursor style
  cursorColor?: string;            // hex applied to the custom cursor
}

export const DEFAULT_PRIMARY_SITE: Site = {
  id: "luvandker",
  name: "Luv & Ker",
  slug: "luvandker",
  domains: [],
  primaryDomain: undefined,
  isPrimary: true,
  status: "live",
  createdAt: 0,
};

interface Store { sites: Record<string, Site> }

function read(): Store {
  if (typeof window === "undefined") return seed({ sites: {} });
  try { return seed(JSON.parse(localStorage.getItem(KEY) || "{}") as Store); }
  catch { return seed({ sites: {} }); }
}

function seed(s: Partial<Store>): Store {
  const sites = s.sites ?? {};
  if (Object.keys(sites).length === 0) {
    sites[DEFAULT_PRIMARY_SITE.id] = { ...DEFAULT_PRIMARY_SITE, createdAt: Date.now(), orgId: "agency" };
  }
  // Migration: any existing site without an orgId is assigned to the
  // primary "agency" org so the active-org filter doesn't hide it.
  for (const id of Object.keys(sites)) {
    if (!sites[id].orgId) sites[id].orgId = "agency";
  }
  return { sites };
}

function write(s: Store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new Event(EVENT));
}

export function listSites(): Site[] {
  return Object.values(read().sites).sort((a, b) =>
    Number(b.isPrimary) - Number(a.isPrimary) || a.name.localeCompare(b.name)
  );
}

export function getSite(id: string): Site | undefined {
  return read().sites[id];
}

export function getPrimarySite(): Site {
  const sites = listSites();
  return sites.find(s => s.isPrimary) ?? sites[0] ?? DEFAULT_PRIMARY_SITE;
}

// ─── Active site (admin-side) ───────────────────────────────────────────────

export function getActiveSiteId(adminEmail?: string): string {
  if (typeof window === "undefined") return getPrimarySite().id;
  try {
    const key = adminEmail ? `${ACTIVE_KEY}_${adminEmail}` : ACTIVE_KEY;
    const stored = localStorage.getItem(key);
    if (stored && getSite(stored)) return stored;
  } catch {}
  return getPrimarySite().id;
}

export function getActiveSite(adminEmail?: string): Site {
  const id = getActiveSiteId(adminEmail);
  return getSite(id) ?? getPrimarySite();
}

export function setActiveSiteId(siteId: string, adminEmail?: string) {
  if (typeof window === "undefined") return;
  const key = adminEmail ? `${ACTIVE_KEY}_${adminEmail}` : ACTIVE_KEY;
  localStorage.setItem(key, siteId);
  window.dispatchEvent(new Event(EVENT));
  const site = getSite(siteId);
  logActivity({
    category: "settings",
    action: `Switched active site → ${site?.name ?? siteId}`,
    resourceId: siteId,
    resourceLink: "/admin/sites",
  });
}

// ─── Mutations ──────────────────────────────────────────────────────────────

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `site-${Date.now()}`;
}

export function createSite(input: { name: string; slug?: string; domains?: string[]; tagline?: string }): Site {
  const store = read();
  const id = slugify(input.slug || input.name);
  if (store.sites[id]) {
    // Append a numeric suffix until unique
    let i = 2;
    while (store.sites[`${id}-${i}`]) i++;
    const next: Site = {
      id: `${id}-${i}`,
      name: input.name,
      slug: `${id}-${i}`,
      domains: input.domains ?? [],
      tagline: input.tagline,
      isPrimary: false,
      status: "draft",
      createdAt: Date.now(),
    };
    store.sites[next.id] = next;
    write(store);
    logActivity({ category: "settings", action: `Created site "${next.name}"`, resourceId: next.id, resourceLink: "/admin/sites" });
    return next;
  }
  const next: Site = {
    id, name: input.name, slug: id,
    domains: input.domains ?? [],
    tagline: input.tagline,
    isPrimary: false,
    status: "draft",
    createdAt: Date.now(),
  };
  store.sites[id] = next;
  write(store);
  logActivity({ category: "settings", action: `Created site "${next.name}"`, resourceId: id, resourceLink: "/admin/sites" });
  return next;
}

export function updateSite(id: string, patch: Partial<Omit<Site, "id" | "createdAt">>) {
  const store = read();
  if (!store.sites[id]) return;
  const prev = store.sites[id];
  store.sites[id] = { ...prev, ...patch };
  write(store);
  logActivity({
    category: "settings",
    action: `Updated site "${prev.name}"`,
    resourceId: id,
    resourceLink: "/admin/sites",
  });
}

export function deleteSite(id: string) {
  const store = read();
  if (!store.sites[id]) return;
  if (store.sites[id].isPrimary) return; // never delete the primary site
  const name = store.sites[id].name;
  delete store.sites[id];
  write(store);
  logActivity({
    category: "settings",
    action: `Deleted site "${name}"`,
    resourceId: id,
    resourceLink: "/admin/sites",
  });
}

export function setPrimarySite(id: string) {
  const store = read();
  if (!store.sites[id]) return;
  Object.values(store.sites).forEach(s => { s.isPrimary = s.id === id; });
  write(store);
  logActivity({
    category: "settings",
    action: `Set "${store.sites[id].name}" as primary site`,
    resourceId: id,
    resourceLink: "/admin/sites",
  });
}

// ─── Domain helpers ─────────────────────────────────────────────────────────

export function addDomain(siteId: string, domain: string) {
  const cleaned = normaliseDomain(domain);
  if (!cleaned) return;
  const store = read();
  const site = store.sites[siteId];
  if (!site) return;
  // Remove from any other site first (a domain can only point to one site)
  Object.values(store.sites).forEach(s => {
    s.domains = s.domains.filter(d => d !== cleaned);
  });
  if (!site.domains.includes(cleaned)) {
    site.domains.push(cleaned);
  }
  if (!site.primaryDomain) site.primaryDomain = cleaned;
  write(store);
  logActivity({
    category: "settings",
    action: `Added domain ${cleaned} → ${site.name}`,
    resourceId: siteId,
    resourceLink: "/admin/sites",
  });
}

export function removeDomain(siteId: string, domain: string) {
  const cleaned = normaliseDomain(domain);
  const store = read();
  const site = store.sites[siteId];
  if (!site) return;
  site.domains = site.domains.filter(d => d !== cleaned);
  if (site.primaryDomain === cleaned) {
    site.primaryDomain = site.domains[0];
  }
  write(store);
  logActivity({
    category: "settings",
    action: `Removed domain ${cleaned} from ${site.name}`,
    resourceId: siteId,
    resourceLink: "/admin/sites",
  });
}

export function setPrimaryDomain(siteId: string, domain: string) {
  const cleaned = normaliseDomain(domain);
  const store = read();
  const site = store.sites[siteId];
  if (!site) return;
  if (!site.domains.includes(cleaned)) site.domains.unshift(cleaned);
  site.primaryDomain = cleaned;
  write(store);
}

// ─── Resolution (storefront-side) ───────────────────────────────────────────

export function normaliseDomain(host: string): string {
  return host.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "").replace(/^www\./, "");
}

// Resolve which site should serve a given hostname. www. and non-www match the
// same site. Localhost / vercel preview URLs fall back to the primary site.
export function resolveSiteByHost(host: string | undefined | null): Site {
  const h = normaliseDomain(host ?? "");
  if (h) {
    for (const site of listSites()) {
      if (site.domains.some(d => normaliseDomain(d) === h)) return site;
    }
  }
  return getPrimarySite();
}

// ─── Subscription ───────────────────────────────────────────────────────────

export function onSitesChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

// ─── Org-scoped listing (G-2) ──────────────────────────────────────────────

// `listSites()` keeps returning every site (back-compat for code that
// hasn't been migrated). New callers should use `listSitesForOrg(orgId)`
// to scope to the active org.
export function listSitesForOrg(orgId: string): Site[] {
  return listSites().filter(s => (s.orgId ?? "agency") === orgId);
}

// Patch `createSite` so new sites land in the active org. Re-export
// the existing function name; legacy callers without orgId default to
// "agency" (the primary org).
const _originalCreateSite = createSite;
// (no-op: we want the original createSite to keep working — see
// below for the explicit org-aware variant)

export function createSiteForOrg(orgId: string, input: { name: string; slug?: string; domains?: string[]; tagline?: string }): Site {
  const site = _originalCreateSite(input);
  // Persist orgId on the freshly-created record.
  updateSite(site.id, { orgId });
  return { ...site, orgId };
}
