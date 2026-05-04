// Aqua plugin platform — type contract.
//
// Lifted from `02 felicias aqua portal work/src/plugins/_types.ts` and
// adapted for the three-level tenancy model in `04-architecture.md`.
// Every feature in the portal (Fulfillment, Website editor, E-commerce,
// Memberships, …) is an `AquaPlugin`. The registry collects them; the
// runtime installs them into a tenant scope (agency-wide or client-
// scoped); the chrome reads installs to assemble the sidebar nav.
//
// New feature workflow:
//   1. mkdir 04 the final portal/plugins/<id>/
//   2. Author manifest exporting `default: AquaPlugin`
//   3. Register it in src/plugins/_registry.ts
//   4. Done. Sidebar nav, API routes and pages mount from the manifest.
//
// Anything that is NOT a plugin is "platform infrastructure" — auth,
// tenants, plugin-installs, the chrome itself, the marketplace UI shell.

import type { ReactNode } from "react";
import type { PluginInstall } from "@/server/types";

// Re-export the canonical install shape so plugins, runtime, and chrome
// share one type. Source of truth lives in `src/server/types.ts`.
export type { PluginInstall } from "@/server/types";

// ─── Plugin identity ──────────────────────────────────────────────────────

export type PluginCategory =
  | "core"
  | "content"
  | "commerce"
  | "marketing"
  | "support"
  | "ops"
  | "fulfillment";   // T2's category — not in 02

export type PluginStatus = "stable" | "beta" | "alpha";

export type PlanId = "free" | "starter" | "pro" | "enterprise";

// ─── Runtime context handed to plugin lifecycle hooks ─────────────────────

export interface PluginCtx {
  agencyId: string;
  clientId?: string;             // undefined when the install is agency-wide
  install: PluginInstall;
  storage: PluginStorage;
}

export interface PluginStorage {
  get<T = unknown>(key: string): Promise<T | undefined>;
  set<T = unknown>(key: string, value: T): Promise<void>;
  del(key: string): Promise<void>;
  list(prefix?: string): Promise<string[]>;
}

// ─── Setup wizard ─────────────────────────────────────────────────────────

export interface SetupStep {
  id: string;
  title: string;
  description: string;
  fields: SetupField[];
  validate?(values: Record<string, string>): Promise<{ ok: true } | { ok: false; error: string }>;
  optional?: boolean;
}

export interface SetupField {
  id: string;
  label: string;
  type: "text" | "password" | "url" | "email" | "select" | "boolean" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  helpText?: string;
}

// ─── Sidebar contributions ────────────────────────────────────────────────

export interface NavGroup {
  id: string;
  label: string;
  order?: number;
}

// Where a nav item should appear in the side panel. Foundation knows
// these panel ids and renders empty panels even before any plugin
// contributes — this lets the chrome stay stable as plugins land.
export type PanelId =
  | "main"           // generic top-of-list
  | "fulfillment"    // T2's panel
  | "store"          // commerce plugins
  | "content"        // editor + blog + wiki
  | "marketing"      // SEO, funnels, analytics
  | "settings"
  | "ops"
  | "tools";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: string | number;
  requiresFeature?: string;
  order?: number;
  panelId?: PanelId;
  groupId?: string;
  // Roles allowed to see this nav item. Default: everyone in the tenant
  // who can see the panel. T2/T3 should set this when an item is
  // agency-only or client-only.
  roles?: import("@/server/types").Role[];
}

// ─── Admin pages ──────────────────────────────────────────────────────────

export interface PluginPage {
  // Rendered at /portal/clients/[clientId]/<plugin-id>/<path> for client-
  // scoped installs, or /portal/agency/<plugin-id>/<path> for agency-
  // scoped installs. "" = the plugin's index.
  path: string;
  component: () => Promise<{ default: React.ComponentType<PluginPageProps> }>;
  requiresFeature?: string;
  title?: string;
  // Roles allowed to render the page. Server-rendered enforcement.
  roles?: import("@/server/types").Role[];
}

export interface PluginPageProps {
  agencyId: string;
  clientId?: string;
  install: PluginInstall;
  segments: string[];
}

// ─── API routes ───────────────────────────────────────────────────────────

export interface PluginApiRoute {
  path: string;
  methods: ("GET" | "POST" | "PATCH" | "PUT" | "DELETE")[];
  handler: (req: Request, ctx: PluginCtx) => Promise<Response>;
  requiresFeature?: string;
  roles?: import("@/server/types").Role[];
}

// ─── Storefront contributions (T3-territory but the contract is here) ────

export interface BlockDescriptor {
  type: string;
  name: string;
  category: "layout" | "content" | "commerce" | "form" | "media" | "marketing";
  defaultProps: Record<string, unknown>;
  render: () => Promise<{ default: React.ComponentType<{ block: unknown }> }>;
  requiresFeature?: string;
}

export interface StorefrontRoute {
  path: string;
  component: () => Promise<{ default: React.ComponentType<{ params: Record<string, string> }> }>;
  requiresFeature?: string;
}

export interface HeadInjection {
  id: string;
  render: (install: PluginInstall) => string | null;
  position: "head" | "body-end";
  requiresFeature?: string;
}

// ─── Settings schema ──────────────────────────────────────────────────────

export interface SettingsSchema {
  customPage?: boolean;
  groups: SettingsGroup[];
}

export interface SettingsGroup {
  id: string;
  label: string;
  description?: string;
  fields: SettingsField[];
}

export interface SettingsField {
  id: string;
  label: string;
  type: "text" | "password" | "url" | "email" | "number" | "select" | "boolean" | "textarea" | "color";
  default?: string | number | boolean;
  options?: { value: string; label: string }[];
  helpText?: string;
  placeholder?: string;
  plans?: PlanId[];
}

// ─── Feature toggles ──────────────────────────────────────────────────────

export interface PluginFeature {
  id: string;
  label: string;
  description?: string;
  default: boolean;
  plans?: PlanId[];
  requires?: string[];
}

// ─── Health check ─────────────────────────────────────────────────────────

export interface HealthStatus {
  ok: boolean;
  message?: string;
  components?: Record<string, { ok: boolean; message?: string }>;
}

// ─── Install scope policy ─────────────────────────────────────────────────
//
// Each plugin declares what scopes are valid for installs:
//   "client"  — only client-scoped (most plugins; commerce, editor, …)
//   "agency"  — only agency-scoped (e.g. agency-wide HR)
//   "either"  — both supported (e.g. fulfillment can be agency-wide and
//                              also have per-client overrides)
//
// The runtime enforces the policy at install time.

export type PluginScopePolicy = "client" | "agency" | "either";

// ─── The plugin manifest ──────────────────────────────────────────────────

export interface AquaPlugin {
  id: string;
  name: string;
  version: string;
  status: PluginStatus;
  category: PluginCategory;
  tagline: string;
  description: string;
  icon?: ReactNode;

  // Some plugins are core — auto-installed for every new tenant.
  core?: boolean;

  // Where this plugin is allowed to be installed.
  scopePolicy: PluginScopePolicy;

  plans?: PlanId[];
  requires?: string[];
  conflicts?: string[];

  // Lifecycle hooks.
  onInstall?: (ctx: PluginCtx, setupAnswers: Record<string, string>) => Promise<void>;
  onUninstall?: (ctx: PluginCtx) => Promise<void>;
  onEnable?: (ctx: PluginCtx) => Promise<void>;
  onDisable?: (ctx: PluginCtx) => Promise<void>;
  onConfigure?: (ctx: PluginCtx) => Promise<void>;

  setup?: SetupStep[];

  navGroup?: NavGroup;
  navItems: NavItem[];
  pages: PluginPage[];
  api: PluginApiRoute[];

  storefront?: {
    blocks?: BlockDescriptor[];
    routes?: StorefrontRoute[];
    headInjections?: HeadInjection[];
  };

  settings: SettingsSchema;
  features: PluginFeature[];
  healthcheck?: (ctx: PluginCtx) => Promise<HealthStatus>;
}

// ─── Presets ──────────────────────────────────────────────────────────────

export interface AquaPreset {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon?: ReactNode;
  // Plugins to install when this preset is applied. The runtime executes
  // them in order (deps first), with optional feature/config overrides.
  plugins: PresetPluginEntry[];
  brandHints?: { palette?: string[]; fontPair?: [string, string] };
}

export interface PresetPluginEntry {
  pluginId: string;
  features?: Record<string, boolean>;
  config?: Record<string, unknown>;
}
