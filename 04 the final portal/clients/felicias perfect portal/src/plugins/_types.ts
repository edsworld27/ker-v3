// Aqua plugin platform — type contract.
//
// Every feature in the portal (Website, E-commerce, Blog, Analytics, …)
// is an `AquaPlugin`. The registry collects them; the runtime installs
// them onto an org; the admin layout reads `org.plugins` and renders
// the sidebar + routes from manifests.
//
// New feature workflow:
//   1. mkdir src/plugins/<id>
//   2. Author manifest as `index.ts` exporting `default: AquaPlugin`
//   3. Register it in src/plugins/_registry.ts
//   4. Done. It shows up in the marketplace; install per-org from /aqua.
//
// Anything that's NOT a plugin is "platform infrastructure" — auth,
// orgs, members, billing-shell, the marketplace UI itself.

import type { ReactNode } from "react";
import type { OrgPluginInstall as ServerOrgPluginInstall, PlanId } from "@/portal/server/types";

// Re-export the server-canonical install shape so plugins, runtime,
// and admin UI all share one type. Source of truth lives in
// src/portal/server/types.ts (alongside OrgRecord which embeds it).
export type OrgPluginInstall = ServerOrgPluginInstall;

// ─── Plugin identity ───────────────────────────────────────────────────────

export type PluginCategory =
  | "core"          // Brand kit, members, settings — can't be uninstalled
  | "content"       // Website, Blog, Forms
  | "commerce"      // E-commerce, Subscriptions
  | "marketing"     // SEO, Analytics, Funnels & A/B, Email
  | "support"       // Chatbot, Support hub, Compliance
  | "ops";          // Auditor, Repo browser, Health

export type PluginStatus = "stable" | "beta" | "alpha";

// ─── Runtime context handed to plugin lifecycle hooks ──────────────────────
//
// Plugins shouldn't import storage modules directly — they get a scoped
// context so future per-plugin storage isolation can be added without
// rewriting every plugin.

export interface PluginCtx {
  orgId: string;
  install: OrgPluginInstall;          // current install state
  // Read/write keys under this plugin's namespace. Each plugin gets its
  // own slice of org state so uninstall can clean up cleanly.
  storage: PluginStorage;
}

export interface PluginStorage {
  get<T = unknown>(key: string): Promise<T | undefined>;
  set<T = unknown>(key: string, value: T): Promise<void>;
  del(key: string): Promise<void>;
  list(prefix?: string): Promise<string[]>;
}

// ─── Setup wizard ──────────────────────────────────────────────────────────
//
// Heavy plugins (Website needs GitHub, E-commerce needs Stripe) declare
// setup steps. The marketplace install flow walks the operator through
// them; the plugin's onInstall hook receives the collected answers.

export interface SetupStep {
  id: string;                         // "github-repo", "stripe-key"
  title: string;
  description: string;
  // Declarative fields — rendered as a form by the marketplace.
  fields: SetupField[];
  // Optional async validator — e.g. test the Stripe key actually works.
  validate?(values: Record<string, string>): Promise<{ ok: true } | { ok: false; error: string }>;
  optional?: boolean;
}

export interface SetupField {
  id: string;
  label: string;
  type: "text" | "password" | "url" | "email" | "select" | "boolean" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];   // for type:"select"
  helpText?: string;
}

// ─── Sidebar contributions ─────────────────────────────────────────────────

export interface NavGroup {
  id: string;                         // "store", "marketing"
  label: string;
  order?: number;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;                       // typically /admin/<plugin>/<page>
  icon?: ReactNode;
  badge?: string | number;            // e.g. unread count
  // Optional sub-feature gate — only show when this feature is enabled
  // on the current install. Lets one plugin contribute different nav
  // items depending on which features the agency turned on.
  requiresFeature?: string;
  order?: number;
  // Declarative sidebar placement. When set, the admin sidebar layout
  // merges this item into the named panel (and optional group) on top
  // of DEFAULT_LAYOUT. Items already present in DEFAULT_LAYOUT are
  // skipped (dedupe by href) so plugins never collide with hardcoded
  // entries.
  //   panelId — "store" | "website" | "users" | "settings"
  //   groupId — optional folder within the panel (created if absent)
  // Plugins without panelId continue to be filtered into DEFAULT_LAYOUT
  // wherever they're hardcoded; setting panelId is opt-in.
  panelId?: string;
  groupId?: string;
}

// ─── Admin pages ───────────────────────────────────────────────────────────

export interface PluginPage {
  // Rendered at /admin/<plugin>/<path>. "" = the plugin's index page.
  path: string;
  // Lazy-loaded React component — keep uninstalled plugins out of the
  // initial bundle. Use dynamic() inside a "use client" wrapper or
  // a server component default-export depending on need.
  component: () => Promise<{ default: React.ComponentType<PluginPageProps> }>;
  // Granular feature toggle that hides this page when off.
  requiresFeature?: string;
  // Optional title for browser tab + breadcrumbs.
  title?: string;
}

export interface PluginPageProps {
  orgId: string;
  install: OrgPluginInstall;
  // Path segments after /admin/<plugin>/<page-path>/. Useful for
  // dynamic sub-routes (e.g. /admin/blog/post/[id]).
  segments: string[];
}

// ─── API routes ────────────────────────────────────────────────────────────

export interface PluginApiRoute {
  // Mounted at /api/portal/<plugin>/<path>.
  path: string;
  methods: ("GET" | "POST" | "PATCH" | "PUT" | "DELETE")[];
  handler: (req: Request, ctx: PluginCtx) => Promise<Response>;
  // Granular feature toggle — endpoint returns 404 when off.
  requiresFeature?: string;
}

// ─── Storefront contributions ──────────────────────────────────────────────
//
// Plugins can register editor blocks, public pages, and head injections
// that show up on /p/[slug] (the rendered storefront). Keeps the plugin
// boundary clean: the editor doesn't have to know about every block,
// and uninstalling a plugin removes its blocks from the palette.

export interface BlockDescriptor {
  type: string;                       // "product-grid", "blog-feed"
  name: string;
  category: "layout" | "content" | "commerce" | "form" | "media" | "marketing";
  defaultProps: Record<string, unknown>;
  // Lazy-loaded renderer.
  render: () => Promise<{ default: React.ComponentType<{ block: unknown }> }>;
  requiresFeature?: string;
}

export interface StorefrontRoute {
  // Mounted under /p/. Examples: "/shop", "/blog", "/blog/[slug]".
  path: string;
  // Lazy-loaded page component.
  component: () => Promise<{ default: React.ComponentType<{ params: Record<string, string> }> }>;
  requiresFeature?: string;
}

export interface HeadInjection {
  id: string;
  // Returns the raw <script>/<meta>/<link> string to inject. Receives
  // the install so per-org config (e.g. GA tracking ID) flows through.
  render: (install: OrgPluginInstall) => string | null;
  // Where to inject — analytics scripts go in <head>, structured data
  // can go before </body> for less render-blocking.
  position: "head" | "body-end";
  requiresFeature?: string;
}

// ─── Settings schema ───────────────────────────────────────────────────────
//
// Declarative per-install settings. The plugin's settings page is
// auto-generated by the marketplace from this schema, but plugins can
// also bring their own custom settings page if a form isn't enough.

export interface SettingsSchema {
  // If a plugin needs full UI control, it sets `customPage: true` and
  // contributes its own /admin/<plugin>/settings page via `pages`.
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
  // Plan gating per-field — enterprise-only field on a pro plugin.
  plans?: PlanId[];
}

// ─── Feature toggles ───────────────────────────────────────────────────────
//
// Granular sub-features inside one plugin. The agency owner flips these
// on/off per client based on plan + how tech-savvy the client is.
// Example: Website plugin has `simpleEditor` (default ON for all plans)
// + `codeView` (default OFF, enterprise-only).

export interface PluginFeature {
  id: string;                         // "simpleEditor", "codeView"
  label: string;
  description?: string;
  default: boolean;
  // Plans that *can* enable this feature. Empty/undefined = all plans.
  plans?: PlanId[];
  // Other features this depends on (must all be on).
  requires?: string[];
}

// ─── Health check ──────────────────────────────────────────────────────────

export interface HealthStatus {
  ok: boolean;
  // Short human-readable summary — surfaced in /admin/<plugin>/settings.
  message?: string;
  // Optional per-component health (e.g. "stripe": ok, "webhook": failing).
  components?: Record<string, { ok: boolean; message?: string }>;
}

// ─── The plugin manifest ───────────────────────────────────────────────────

export interface AquaPlugin {
  id: string;                         // "website", "ecommerce", "analytics"
  name: string;                       // "Website Builder"
  version: string;                    // semver, "1.0.0"
  status: PluginStatus;
  category: PluginCategory;
  tagline: string;                    // one-line marketplace summary
  description: string;                // longer marketplace description
  icon?: ReactNode;                   // shown in sidebar + marketplace card

  // Some plugins are core — they're auto-installed for every org and
  // can't be uninstalled. (Brand Kit, Members, Marketplace itself.)
  core?: boolean;

  // Plan gating — plans that can install this plugin. Empty = all plans.
  plans?: PlanId[];

  // Dependencies. E-commerce requires Website. Analytics requires nothing.
  requires?: string[];
  // Conflicts. Only one chatbot plugin at a time, etc.
  conflicts?: string[];

  // Lifecycle hooks.
  onInstall?: (ctx: PluginCtx, setupAnswers: Record<string, string>) => Promise<void>;
  onUninstall?: (ctx: PluginCtx) => Promise<void>;
  onEnable?: (ctx: PluginCtx) => Promise<void>;
  onDisable?: (ctx: PluginCtx) => Promise<void>;
  // Called when the operator changes settings/features. Useful for
  // reconciling external state (e.g. Stripe webhook subscription).
  onConfigure?: (ctx: PluginCtx) => Promise<void>;

  // Setup wizard run on install (if any).
  setup?: SetupStep[];

  // Sidebar contributions.
  navGroup?: NavGroup;                // group label/ordering
  navItems: NavItem[];

  // Admin pages.
  pages: PluginPage[];

  // API routes.
  api: PluginApiRoute[];

  // Storefront contributions.
  storefront?: {
    blocks?: BlockDescriptor[];
    routes?: StorefrontRoute[];
    headInjections?: HeadInjection[];
  };

  // Per-install settings (auto-rendered settings page unless custom).
  settings: SettingsSchema;

  // Granular sub-feature toggles.
  features: PluginFeature[];

  // Optional periodic health check — surfaced in /admin/<plugin>/settings
  // and aggregated on the org dashboard.
  healthcheck?: (ctx: PluginCtx) => Promise<HealthStatus>;
}

// ─── Presets ───────────────────────────────────────────────────────────────
//
// One-click bundles of plugins for common use cases. The agency owner
// hits "E-commerce store" on org creation and the runtime installs
// Website + E-commerce + Forms + SEO + Analytics + Compliance with
// sensible defaults — instead of clicking 6 install buttons.

export interface AquaPreset {
  id: string;                         // "ecommerce-physical", "blog", "portfolio"
  name: string;
  tagline: string;
  description: string;
  icon?: ReactNode;
  // Ordered list — earlier plugins install first (matters for deps).
  plugins: PresetPluginEntry[];
  // Optional default brand kit overrides (palette, fonts) keyed to the
  // preset's vibe — "Marketing site" gets a punchier palette by default.
  brandHints?: { palette?: string[]; fontPair?: [string, string] };
}

export interface PresetPluginEntry {
  pluginId: string;
  // Override the plugin's default features for this preset.
  features?: Record<string, boolean>;
  // Pre-fill some config values (operator can still edit during setup).
  config?: Record<string, unknown>;
}
