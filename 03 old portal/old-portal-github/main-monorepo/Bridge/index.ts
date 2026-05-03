/**
 * @aqua/bridge — Main Export
 *
 * The single entry point for everything in the Bridge.
 * Import from here or from the specific sub-path:
 *
 *   import { BridgeRegistry } from '@aqua/bridge'
 *   import { BridgeEvents } from '@aqua/bridge/events'
 *   import { authenticate } from '@aqua/bridge/auth'
 *   import type { Client, AppUser } from '@aqua/bridge/types'
 */

// Types — always safe to import anywhere (no side effects)
export type {
  PortalProduct,
  PortalTier,
  ClientStage,
  PortalView,
  Step,
  UserRole,
  Agency,
  AppUser,
  Client,
  ClientResource,
  FulfilmentBrief,
  FulfilmentDeliverable,
  AppNotification,
  LogEntry,
  BridgeSession,
  SuiteTemplate,
  SuiteSubItem,
} from './types';

// Registry — safe to import client-side
export { BridgeRegistry } from './registry';

// Event Bus — safe to import client-side
export { BridgeEvents } from './events';

// UI Registry — safe to import client-side
export { BridgeUIRegistry } from './ui';
export type { UIVariable, UIViewConfig } from './ui';

// Auth — server-side only (uses Prisma)
export { authenticate, validateSession, DEMO_EMAIL, DEMO_SESSION } from './auth';

// API — server-side only
export { BridgeAPI } from './api';

// Sync — server-side only
export {
  provisionClientWorkspace,
  syncClientStage,
  createBrief,
  submitDeliverable,
  approveDeliverable,
  getClientFulfilmentSummary,
} from './sync';

// postMessage Protocol — for Micro-Frontend communication
export * from './postMessage';

// Shared cross-app constants (ports, role mapping, theme defaults, LS keys)
export {
  APP_PORTS,
  APP_LABELS,
  APP_DEV_URLS,
  BRIDGE_LS_KEYS,
  ROLE_PRODUCT_MAP,
  BRIDGE_MESSAGE_TYPES,
  DEFAULT_THEME,
  SESSION_TTL_MS,
} from './config';
export type { AppName, BridgeMessageType } from './config';

