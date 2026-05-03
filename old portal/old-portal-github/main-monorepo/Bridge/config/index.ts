/**
 * @aqua/bridge/config — Shared constants
 *
 * Single source of truth for cross-app constants that don't belong in
 * individual app shells. Anything imported by 2+ apps belongs here.
 *
 * Usage: import { APP_PORTS, BRIDGE_LS_KEYS, ROLE_PRODUCT_MAP } from '@aqua/bridge';
 */

// ── Port routing ────────────────────────────────────────────────────────────
//
// Single source of truth for which app runs on which dev port.
// Used by Bridge/postMessage.ts (origin whitelist) and host shell's iframe loader.
// Production deployments should override via env vars (NEXT_PUBLIC_*_URL).

export const APP_PORTS = {
  host:       3001,
  client:     3002,
  crm:        3003,
  operations: 3004,
  finance:    3005,
  people:     3006,
  revenue:    3007,
} as const;

export type AppName = keyof typeof APP_PORTS;

export const APP_LABELS: Record<AppName, string> = {
  host:       'Host Shell',
  client:     'Client Portal',
  crm:        'CRM',
  operations: 'Operations Hub',
  finance:    'Finance Hub',
  people:     'People Hub',
  revenue:    'Revenue Hub',
};

export const APP_DEV_URLS: Record<AppName, string> = Object.fromEntries(
  Object.entries(APP_PORTS).map(([name, port]) => [name, `http://localhost:${port}`])
) as Record<AppName, string>;

// ── localStorage keys ───────────────────────────────────────────────────────
//
// All localStorage keys used across the apps.
// Keep them centralized so a "clear all bridge state" function can iterate the list.

export const BRIDGE_LS_KEYS = {
  PORTAL_STATE: 'aqua_portal_state',
  SESSION:      'aqua_session',
  THEME:        'aqua_theme',
  RECENT_VIEWS: 'aqua_recent_views',
  AGENCY_CONFIG: 'aqua_agency_config',
} as const;

// ── Role → Product access ──────────────────────────────────────────────────
//
// Maps a role to which products it can access.
// Used by Bridge/auth/ to derive `BridgeSession.products` from `BridgeSession.user.role`.

export const ROLE_PRODUCT_MAP = {
  Founder:        ['host', 'client', 'crm', 'operations', 'finance', 'people', 'revenue'],
  AgencyManager:  ['host', 'client', 'crm', 'operations', 'finance', 'people', 'revenue'],
  AgencyEmployee: ['host', 'client', 'crm', 'operations'],
  ClientOwner:    ['client'],
  ClientEmployee: ['client'],
} as const satisfies Record<string, readonly AppName[]>;

// ── Demo mode ───────────────────────────────────────────────────────────────
//
// The magic email that bypasses authentication and returns DEMO_SESSION.

export const DEMO_EMAIL = 'demo@aqua.portal';

// ── Bridge message types (mirrored from postMessage.ts for non-message imports) ──

export const BRIDGE_MESSAGE_TYPES = [
  'BRIDGE_AUTH',
  'BRIDGE_NAVIGATE',
  'BRIDGE_THEME',
  'BRIDGE_READY',
  'BRIDGE_STATE_UPDATED',
  'BRIDGE_SYNC',
  'BRIDGE_PING',
] as const;

export type BridgeMessageType = typeof BRIDGE_MESSAGE_TYPES[number];

// ── Default theme tokens ────────────────────────────────────────────────────
//
// Fallback colors used when an agency has no custom branding configured.
// Apps should call useTheme() which reads agencyConfig.identity first, then falls back to these.

export const DEFAULT_THEME = {
  primary:   '#6366f1', // indigo-500
  secondary: '#10b981', // emerald-500
} as const;

// ── Session ────────────────────────────────────────────────────────────────

export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
