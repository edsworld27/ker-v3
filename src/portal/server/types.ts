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
