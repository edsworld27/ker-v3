// Shared portal types. Storage, server modules, auth, chrome and the
// plugin runtime all import from here. Keeping this module dependency-free
// means it can be safely imported from edge / middleware / client code
// when the bundler tree-shakes the unused symbols.

// ─── Tenant identity ──────────────────────────────────────────────────────
//
// Three nested levels: Agency → Client → End-customer. Every row in the
// portal carries `agencyId`. Rows scoped to a specific client also carry
// `clientId`. End-customer rows additionally carry `customerId` (the
// shopper / member / affiliate). See `04-architecture.md §1`.

export type AgencyStatus = "active" | "suspended" | "archived";

export interface BrandKit {
  logoUrl?: string;
  primaryColor: string;          // hex, e.g. "#FF6B35"
  secondaryColor?: string;
  accentColor?: string;
  fontHeading?: string;          // CSS font-family stack
  fontBody?: string;
  borderRadius?: string;         // e.g. "12px"
  customCSS?: string;            // raw CSS injected at the page root
}

export interface Agency {
  id: string;
  name: string;
  slug: string;
  brand: BrandKit;
  ownerEmail?: string;
  status: AgencyStatus;
  createdAt: number;
  updatedAt: number;
}

// Phase-driven lifecycle. Stored as a string so future agency-customised
// phases (Decisions log #2) can extend without a code change. The seven
// defaults match the ones in `04-architecture.md §7` plus a "lead" entry
// inherited from `03/old-portal-roles-tenancy.md`.
export type ClientStage =
  | "lead"
  | "discovery"
  | "design"
  | "development"
  | "onboarding"
  | "live"
  | "churned";

export interface Client {
  id: string;
  agencyId: string;
  name: string;
  slug: string;
  brand: BrandKit;
  stage: ClientStage;
  ownerEmail?: string;
  websiteUrl?: string;
  status: AgencyStatus;
  createdAt: number;
  updatedAt: number;
}

export interface EndCustomer {
  id: string;
  clientId: string;
  agencyId: string;              // denormalised for fast filtering
  email: string;
  name?: string;
  createdAt: number;
}

// ─── Roles ────────────────────────────────────────────────────────────────
//
// Locked in `04-architecture.md §3`. URL → role gating happens in
// middleware + page layout server components via `requireRole()`.

export type Role =
  | "agency-owner"
  | "agency-manager"
  | "agency-staff"
  | "client-owner"
  | "client-staff"
  | "freelancer"
  | "end-customer";

export const AGENCY_ROLES: readonly Role[] = [
  "agency-owner",
  "agency-manager",
  "agency-staff",
] as const;

export const CLIENT_ROLES: readonly Role[] = [
  "client-owner",
  "client-staff",
  "freelancer",
] as const;

export const ALL_ROLES: readonly Role[] = [
  ...AGENCY_ROLES,
  ...CLIENT_ROLES,
  "end-customer",
] as const;

export function isAgencyRole(role: Role): boolean {
  return (AGENCY_ROLES as readonly string[]).includes(role);
}

export function isClientRole(role: Role): boolean {
  return (CLIENT_ROLES as readonly string[]).includes(role);
}

// ─── Server-side users ────────────────────────────────────────────────────

export interface ServerUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;          // scrypt$N$r$p$<salt-hex>$<derived-hex>
  role: Role;
  agencyId: string;              // every user belongs to one agency
  clientId?: string;             // set for client-* roles + freelancer + end-customer
  mustChangePassword?: boolean;
  createdAt: number;
  updatedAt: number;
}

// ─── Session cookie payload ───────────────────────────────────────────────
//
// Carried in `lk_session_v1` (HMAC-signed). Middleware decodes; route
// handlers re-verify via `getSession()`. iat/exp in unix seconds.

export interface SessionPayload {
  userId: string;
  email: string;
  role: Role;
  agencyId: string;
  clientId?: string;
  iat: number;
  exp: number;
}

// ─── Plugin install records ───────────────────────────────────────────────
//
// Per-tenant install state. Architecture §2: per-tenant scope, with
// `clientId` set when the install is client-scoped (most common) and
// undefined when the install is agency-wide (e.g. a fulfillment plugin
// the agency uses across all clients).

export interface PluginInstall {
  id: string;                    // `${agencyId}|${clientId ?? "_agency"}|${pluginId}`
  pluginId: string;
  agencyId: string;
  clientId?: string;
  enabled: boolean;
  config: Record<string, unknown>;
  features: Record<string, boolean>;
  setupAnswers?: Record<string, string>;
  installedAt: number;
  installedBy?: string;          // user id of installer
  health?: { ok: boolean; message?: string };
  healthCheckedAt?: number;
}

// Composite scope used for plugin installs. `clientId === undefined`
// means agency-wide; otherwise client-scoped under the agency.
export interface PluginInstallScope {
  agencyId: string;
  clientId?: string;
}

// ─── Activity log ─────────────────────────────────────────────────────────

export type ActivityCategory =
  | "auth"
  | "tenant"
  | "plugin"
  | "phase"
  | "fulfillment"
  | "ecommerce"     // T2 ecommerce plugin
  | "settings"
  | "system";

export interface ActivityEntry {
  id: string;
  ts: number;
  agencyId: string;
  clientId?: string;
  actorUserId?: string;
  actorEmail?: string;
  category: ActivityCategory;
  action: string;                // verb, e.g. "client.created"
  message: string;
  metadata?: Record<string, unknown>;
}

// Phases are seeded with 6 defaults but stored as data so each agency can
// customise. T2 owns the full implementation; foundation just declares the
// shape so phase-aware code can compile.
export interface PhaseDefinition {
  id: string;
  agencyId: string;
  stage: ClientStage;
  label: string;
  description?: string;
  order: number;
  pluginPreset: string[];        // pluginIds installed when this phase becomes active
  portalVariantId?: string;      // T3-owned editor page id
  checklist: PhaseChecklistItem[];
}

export interface PhaseChecklistItem {
  id: string;
  label: string;
  visibility: "internal" | "client";
  done?: boolean;
}

// ─── PortalState — the single typed object behind storage ─────────────────

export interface PortalState {
  agencies: Record<string, Agency>;
  clients: Record<string, Client>;
  endCustomers: Record<string, EndCustomer>;
  users: Record<string, ServerUser>;             // keyed by lower-cased email
  pluginInstalls: Record<string, PluginInstall>; // keyed by PluginInstall.id
  pluginData: Record<string, Record<string, unknown>>; // installId → key → value
  phases: Record<string, PhaseDefinition>;
  activity: ActivityEntry[];
}
