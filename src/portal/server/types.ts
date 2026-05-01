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

// A point-in-time snapshot of the published overrides — kept for revert.
// We write a snapshot every time the admin publishes; oldest entries are
// dropped beyond PUBLISH_HISTORY_CAP.
export interface PublishSnapshot {
  id: string;                                 // stable id, e.g. "snap_<ts>_<rand>"
  publishedAt: number;
  publishedBy?: string;                       // admin email if available
  message?: string;                           // optional commit-style message
  overrides: Record<string, ContentOverride>; // exact overrides at publish time
  // Diff against the *previous* published state at publish time, for the UI.
  changedKeys: string[];
}

export interface SiteContentState {
  siteId: string;
  // Workflow split (D-2):
  //  • draft     — admin's working copy. setOverrides writes here.
  //  • published — what the host site sees. Created via publish().
  //  • history   — past published snapshots, capped, used for revert.
  draft: Record<string, ContentOverride>;
  published: Record<string, ContentOverride>;
  history: PublishSnapshot[];
  discovered: Record<string, DiscoveredKey>;
  updatedAt: number;
  // Legacy single-bucket field (Phase C). Kept readable for one major
  // version so callers that haven't migrated still work; new writes always
  // hit draft/published.
  overrides?: Record<string, ContentOverride>;
}

export const PUBLISH_HISTORY_CAP = 30;

export const OVERRIDE_TYPE_LABEL: Record<OverrideType, string> = {
  "text":      "Text",
  "html":      "HTML",
  "image-src": "Image src",
  "href":      "Link href",
};

// Cap how many distinct paths we remember per discovered key. Keeps the
// state file small even for sites with thousands of pages.
export const DISCOVERED_PATH_CAP = 8;

// ─── Manifest schema (D-1) ─────────────────────────────────────────────────
//
// Host sites declare every editable region in a single portal.config.ts
// file at the repo root (see definePortal in @/portal/client). The schema
// is uploaded to the portal so the admin editor can render a structured,
// section-grouped UI instead of a flat key list.

export interface ManifestField {
  type: OverrideType;
  default: string;
  description?: string;          // tooltip in the admin editor
  multiline?: boolean;           // hint to render a textarea
}

// Section-grouped: { hero: { headline: { ... }, subtitle: { ... } } }.
// The admin reader flattens to dot keys (`hero.headline`) which match the
// existing override store from Phase C.
export interface ManifestSchema {
  [section: string]: {
    [key: string]: ManifestField;
  };
}

export interface SiteManifestSchema {
  siteId: string;
  schema: ManifestSchema;
  uploadedAt: number;
  uploadedFrom?: string;         // e.g. CLI version or repo URL
}

// ─── Embeds (D-5) ───────────────────────────────────────────────────────────
//
// Per-site registry of embeddable widgets — chatbots, calendars, video,
// custom HTML. Host sites render `<PortalEmbed id="support-chat" />` and
// the loader picks the right provider snippet at runtime.

export type EmbedProvider =
  | "crisp"
  | "intercom"
  | "tidio"
  | "calendly"
  | "cal-com"
  | "youtube"
  | "vimeo"
  | "custom-html";

export type EmbedPosition =
  | "popup-bottom-right"
  | "popup-bottom-left"
  | "inline"
  | "bottom-bar";

export interface Embed {
  id: string;                    // human-readable, e.g. "support-chat"
  provider: EmbedProvider;
  enabled: boolean;
  // Provider-specific primary identifier — Crisp website id, Intercom app
  // id, Calendly URL, YouTube video id, raw HTML for custom-html, etc.
  value: string;
  position?: EmbedPosition;
  consentCategory?: ConsentCategory;
  settings?: Record<string, unknown>;   // provider-specific extras
  label?: string;
}

// ─── Portal-wide settings (D-4 prep) ───────────────────────────────────────
//
// Admin-controlled connection details: GitHub repo + auth (used by D-3
// PR promotion), database backend (D-4 storage swap), deployment URLs.
// Lives in localStorage on the admin side; sensitive fields are not
// persisted server-side until we have proper auth.

export type DatabaseBackend = "file" | "kv" | "postgres";

export interface PortalSettings {
  github: {
    repoUrl: string;
    defaultBranch: string;
    appId?: string;
    installationId?: string;
    pat?: string;                // fallback Personal Access Token
  };
  database: {
    backend: DatabaseBackend;
    kvUrl?: string;
    postgresUrl?: string;
  };
  deployment: {
    previewBaseUrl?: string;
  };
  // E-2: 3rd-party integrations the portal uses to auto-detect things
  // about a host site (currently only Vercel — token used to look up
  // domain → project → repo so a new heartbeat can register a site
  // with no manual setup).
  integrations?: {
    vercelToken?: string;
    autoDiscover?: boolean;          // master switch, defaults to true when token present
  };
  compliance?: ComplianceSettings;
}

// Patch type: each top-level section may be supplied partially. Callers
// can send { github: { repoUrl: "…" } } and keep defaultBranch untouched.
export type PortalSettingsPatch = {
  [K in keyof PortalSettings]?: Partial<PortalSettings[K]>;
};

// ─── Compliance (E-3) ──────────────────────────────────────────────────────
//
// Mode selects a baseline policy that gates which third-party providers
// can be configured, how long the audit log is retained, and what admin
// actions require extra confirmation. HIPAA is the strictest; "none" is
// the development default with no restrictions.

export type ComplianceMode = "none" | "gdpr" | "hipaa" | "soc2";

export interface ComplianceSettings {
  mode: ComplianceMode;
  // Override the default audit retention for the current mode. 0 = use
  // the mode's recommended default.
  auditRetentionDaysOverride?: number;
  // Admin-acknowledged warnings — used to suppress repeat banners on
  // settings the admin has accepted as non-compliant in their context.
  acknowledgedWarnings?: string[];
}

// Provider lists the modes restrict. Maintained here (rather than at
// each enforcement site) so the rules are auditable in one place.
//
// "BAA" = the provider offers a Business Associate Agreement. Without
// one, shipping any URL/identifier that could be PHI is a violation.
// HIPAA blocks every tracker / embed lacking a BAA pathway.
export const NON_BAA_TRACKER_PROVIDERS: ReadonlyArray<string> = [
  "ga4",          // Google does not BAA the consumer GA4
  "gtm",          // Container; can ship anything, blocked conservatively
  "meta-pixel",
  "tiktok-pixel",
  "hotjar",
  "clarity",
];

export const NON_BAA_EMBED_PROVIDERS: ReadonlyArray<string> = [
  "crisp",
  "intercom",
  "tidio",
  "calendly",
  "cal-com",
  "youtube",
  "vimeo",
];

// Audit log retention (in days) per mode. The activity logger purges
// entries older than this on each write. Override via
// compliance.auditRetentionDaysOverride.
export const RETENTION_DAYS: Record<ComplianceMode, number> = {
  "none":  90,                  // sensible default, not legally driven
  "gdpr":  6 * 30,              // 6 months
  "soc2":  365,                 // 1 year (typical SOC 2 requirement)
  "hipaa": 6 * 365,             // 6 years (45 CFR §164.530(j))
};

// ─── Activity log (cloud-audit) ─────────────────────────────────────────────
//
// Mirror of the per-browser localStorage activity log. Server-side so
// HIPAA / SOC 2 retention windows mean something — entries are purged
// based on the active compliance mode rather than a fixed cap.

export type ActivityCategory =
  | "orders" | "products" | "customers" | "marketing" | "content"
  | "theme"  | "settings" | "features"  | "shipping"  | "support" | "auth";

export interface ActivityEntry {
  id: string;
  ts: number;
  actorEmail: string;
  actorName: string;
  category: ActivityCategory;
  action: string;
  resourceId?: string;
  resourceLink?: string;
  diff?: Record<string, { from: unknown; to: unknown }>;
}

// Cap per-portal entries to keep the JSON blob bounded even when retention
// is set to several years. Newest entries kept; oldest evicted on append.
export const ACTIVITY_HARD_CAP = 50_000;

// ─── Discovery (E-2) ───────────────────────────────────────────────────────
//
// Auto-detection records — when a heartbeat arrives from an unknown host
// the portal queries Vercel (and optionally GitHub) to populate the rest
// of a site's metadata. Each detection lands as a `Discovery` row the
// admin can confirm (creates the actual Site) or dismiss (recorded so
// we don't keep nagging).

export type DiscoveryStatus = "pending" | "confirmed" | "dismissed";

export interface Discovery {
  host: string;                  // e.g. felicia-skincare.com
  firstSeenAt: number;
  lastSeenAt: number;
  status: DiscoveryStatus;
  // Detection results — populated when Vercel auth is configured.
  vercelProjectId?: string;
  vercelProjectName?: string;
  repoUrl?: string;              // resolved from vercel.link.repo
  defaultBranch?: string;
  // Free-text reason if detection failed (shown in admin UI).
  detectError?: string;
}

// ─── Embed provider metadata ───────────────────────────────────────────────
//
// Maps used by the admin UI and the runtime renderer. Kept colocated with
// the EmbedProvider union so adding a new provider lights up everywhere.

export const EMBED_PROVIDER_LABELS: Record<EmbedProvider, string> = {
  "crisp":       "Crisp Chat",
  "intercom":    "Intercom",
  "tidio":       "Tidio",
  "calendly":    "Calendly",
  "cal-com":     "Cal.com",
  "youtube":     "YouTube",
  "vimeo":       "Vimeo",
  "custom-html": "Custom HTML",
};

export const EMBED_PROVIDER_PLACEHOLDER: Record<EmbedProvider, string> = {
  "crisp":       "1234abcd-...",                       // Crisp website ID
  "intercom":    "abc1234",                             // Intercom app ID
  "tidio":       "abc1234",                             // Tidio public key
  "calendly":    "https://calendly.com/yourname/30min",
  "cal-com":     "https://cal.com/yourname",
  "youtube":     "dQw4w9WgXcQ",                        // YouTube video ID
  "vimeo":       "12345678",                           // Vimeo video ID
  "custom-html": "<script>...</script>",
};

export const EMBED_DEFAULT_CONSENT: Record<EmbedProvider, ConsentCategory> = {
  "crisp":       "functional",   // chat is functional UX
  "intercom":    "functional",
  "tidio":       "functional",
  "calendly":    "functional",
  "cal-com":     "functional",
  "youtube":     "marketing",    // YT cookies = marketing
  "vimeo":       "marketing",
  "custom-html": "marketing",    // conservative
};

export const EMBED_DEFAULT_POSITION: Partial<Record<EmbedProvider, EmbedPosition>> = {
  "crisp":    "popup-bottom-right",
  "intercom": "popup-bottom-right",
  "tidio":    "popup-bottom-right",
};
