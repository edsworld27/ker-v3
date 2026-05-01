// Shared portal types — both the storage layer and the route handlers
// import these. Kept as a tiny module so storage.ts stays cycle-free.

export interface Heartbeat {
  siteId: string;
  firstSeenAt: number;
  lastSeenAt: number;
  beats: number;
  lastUrl?: string;
  lastTitle?: string;
  lastReferrer?: string;
  lastUserAgent?: string;
  lastEvent?: string;
}

export type TrackerProvider =
  | "ga4"
  | "gtm"
  | "meta-pixel"
  | "tiktok-pixel"
  | "hotjar"
  | "clarity"
  | "plausible";

export type ConsentCategory = "analytics" | "marketing" | "functional";

export interface Tracker {
  id: string;
  provider: TrackerProvider;
  enabled: boolean;
  consentCategory: ConsentCategory;
  // Provider-specific identifier — measurement ID, pixel ID, hotjar site id,
  // clarity project id, plausible domain, etc. A single value field keeps
  // the data model simple; if a provider grows extra options we add them
  // alongside.
  value: string;
  label?: string;              // optional admin-only nickname
}

export interface SiteTrackingConfig {
  siteId: string;
  requireConsent: boolean;     // if true, marketing/analytics trackers wait for grant
  trackers: Tracker[];
  updatedAt: number;
}

export const DEFAULT_CONSENT_CATEGORY: Record<TrackerProvider, ConsentCategory> = {
  "ga4":          "analytics",
  "gtm":          "marketing",   // GTM is a container, conservative default
  "meta-pixel":   "marketing",
  "tiktok-pixel": "marketing",
  "hotjar":       "analytics",
  "clarity":      "analytics",
  "plausible":    "analytics",   // privacy-friendly but still a measurement category
};

export const PROVIDER_LABELS: Record<TrackerProvider, string> = {
  "ga4":          "Google Analytics 4",
  "gtm":          "Google Tag Manager",
  "meta-pixel":   "Meta Pixel (Facebook)",
  "tiktok-pixel": "TikTok Pixel",
  "hotjar":       "Hotjar",
  "clarity":      "Microsoft Clarity",
  "plausible":    "Plausible",
};

export const PROVIDER_VALUE_PLACEHOLDER: Record<TrackerProvider, string> = {
  "ga4":          "G-XXXXXXXXXX",
  "gtm":          "GTM-XXXXXX",
  "meta-pixel":   "1234567890",
  "tiktok-pixel": "C4XXXXXXXXXX",
  "hotjar":       "1234567",
  "clarity":      "abcdef1234",
  "plausible":    "yourdomain.com",
};

// ─── Content overrides ─────────────────────────────────────────────────────
//
// Host sites mark editable nodes with `data-portal-edit="<key>"` (and
// optionally `data-portal-type` to choose how the override is applied).
// The tag scans the DOM, reports discovered keys to the portal, fetches
// the override map and rewrites matching nodes. Auto-discovery means
// admins see what's editable without configuring anything up front.

export type OverrideType = "text" | "html" | "image-src" | "href";

export interface ContentOverride {
  value: string;
  type: OverrideType;
  updatedAt: number;
}

export interface DiscoveredKey {
  firstSeen: number;
  lastSeen: number;
  seenOn: string[];      // pathnames where this key has been observed (capped)
  type?: OverrideType;   // last reported type (host-declared)
}

export interface SiteContentState {
  siteId: string;
  overrides: Record<string, ContentOverride>;
  discovered: Record<string, DiscoveredKey>;
  updatedAt: number;
}

export const OVERRIDE_TYPE_LABEL: Record<OverrideType, string> = {
  "text":      "Text",
  "html":      "HTML",
  "image-src": "Image src",
  "href":      "Link href",
};

// Cap how many distinct paths we remember per discovered key. Keeps the
// state file small even for sites with thousands of pages.
export const DISCOVERED_PATH_CAP = 8;
